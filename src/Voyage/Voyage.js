import { Stack, Typography, Box, Button, Fab, Grid } from "@mui/material";
import Map from "../Odyssey/map";
import SharePageList from "../Odyssey/SharePageList"
import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api"
import CircularProgress from '@mui/material/CircularProgress';
import html2canvas from "html2canvas";
import canvas2image from "@reglendo/canvas2image";
import ListIcon from '@mui/icons-material/List';
import Fade from '@mui/material/Fade';
import { useMediaQuery } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function toLowerCaseKeys(obj) { if (Array.isArray(obj)) { return obj.map(toLowerCaseKeys); } else if (obj !== null && obj.constructor === Object) { return Object.keys(obj).reduce((acc, key) => { const lowerCaseKey = key.charAt(0).toLowerCase() + key.slice(1); acc[lowerCaseKey] = toLowerCaseKeys(obj[key]); return acc; }, {}); } return obj; }


function removeElement(containerId, elementId) {
    const container = document.getElementById(containerId);
    const element = document.getElementById(elementId);
    if (container && element) {
        const savedElement = element.cloneNode(true);
        container.removeChild(element);
        return savedElement;
    }
    return null;
}

const Voyage = ({
    concerts,
    userLocation,
    mapStyle,
    posterName,
    setPosterName,
    setConcerts,
    setUserLocation,
    setMapStyle,
    setSelectedPlaylist
}) => {
    const mapRef = useRef();
    const navigate = useNavigate();
    const { guid } = useParams();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });
    const [loading, setLoading] = useState(true);
    const [showSchedule, setShowSchedule] = useState(true);
    const [useDirections, setUseDirections] = useState(false);
    const isScreenSmall = useMediaQuery("(max-width:1200px)");

    const handleDownloadImage = async function () {

        removeElement("UIControlsContainer", "UIControls");
        removeElement("showScheduleFabContainer", "showScheduleFab");
        const element = document.getElementById("sharepage");

        html2canvas(element, {
            logging: true,
            proxy: `${process.env.REACT_APP_BACKEND}/GetImage`,
            ignoreElements: (node) => {
                return node.nodeName === "IFRAME";
            },
            scrollY: window.scrollY * -1,
        }).then((canvas) => {
            let finalPosterName = posterName || "poster";
            canvas2image.saveAsJPEG(canvas, finalPosterName, canvas.width, canvas.height);
            window.location.reload(true);
        });
    };

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                console.log("requesting data from server");
                const response = await fetch(`${process.env.REACT_APP_BACKEND}/RetrieveTrip?tripId=${guid}`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json;charset=utf-8",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (!data.concertJson) {
                    throw new Error("Invalid data structure received from server.");
                }

                // Deserialization
                var parsedConcerts = JSON.parse(data.concertJson);
                var transformedConcerts = toLowerCaseKeys(parsedConcerts);


                if (data.startingLocation) {
                    var coords = data.startingLocation;
                    var result = { coords: { longitude: coords.Longitude, latitude: coords.Latitude } };
                    setUserLocation(result);
                }

                setPosterName(data.tripName);
                setConcerts(transformedConcerts);
                setSelectedPlaylist({ id: data.playlistId, name: data.posterName });
                setMapStyle(data.mapStyleId);
            } catch (error) {
                alert("An error occurred while loading the trip data. Redirecting to home page.");
                console.error("Error fetching trip data:", error);
                navigate('/');
            }
            setLoading(false);
        };

        fetchTripData();
    }, []);

    useEffect(() => {
        if (!mapRef) {
            return
        }
        // detected rendering
    }, mapRef)

    // ...
    if (loading) {
        //do a throbber here
        return (
            <Stack sx={{
                backgroundColor: '#7fc9dc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                direction: 'column'
            }} >
                <Box
                    component="img"
                    src={window.location.origin + "/Taver.png"}
                    alt="Taver"
                    sx={{ width: "auto", height: "auto" }}
                />
                <CircularProgress />
            </Stack>);
    }

    return (
        <Stack sx={{ width: '100%', position: 'relative' }}
            backgroundColor="#7fc9dc"
            id="showScheduleFabContainer">
            {/* Background Map */}
            {isLoaded ? (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 0, // Sends the map to the background
                }}>
                    <Map ref={mapRef} concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} />
                </Box>
            ) : null}

            {/* Foreground Content */}
            <Fab
                id="showScheduleFab"
                sx={{
                    backgroundColor: '#70afbf',
                    color: 'white',
                    position: 'absolute',
                    top: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    left: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    zIndex: 2,
                    '&:hover': {
                        backgroundColor: '#e2e900', // Slightly darker shade for hover effect
                    },
                }} onClick={() => setShowSchedule(prevState => !prevState)}>
                <ListIcon />
            </Fab>

            <Fade in={showSchedule} mountOnEnter unmountOnExit>
                <Stack
                    id="UIControlsContainer"
                    spacing={1}
                    sx={{
                        backgroundColor: 'rgba(94, 151, 165, 0.8)', // Semi-transparent background
                        px: { xs: 0, sm: 1 },
                        py: { xs: 3 },
                        position: 'relative',
                        zIndex: 1,
                        minWidth: '375px',
                        width: { xs: '100%', sm: '100%', md: '40%', lg: '30%', xl: '25%' }, // Make it take up only a portion at xl
                        height: { xs: '100vh', md: '90vh' }, // Full height for smaller screens
                        left: { md: 20 }, // Push left at md
                        top: { md: 20 }, // Adjust top position for smaller screens
                        borderRadius: 2
                    }}>

                    <Grid flexDirection="column" sx={{ position: 'relative' }}>
                        <Box
                            component="img"
                            src={window.location.origin + "/Taver.png"}
                            alt="Taver"
                            sx={{ width: { xs: 200 }, height: "auto" }}
                        />

                    </Grid>
                    <Typography variant="h3">{posterName}</Typography>
                    <Stack justifyContent="space-evenly" container sx={{ flexDirection: "column" }}>
                        <SharePageList concerts={concerts} showActiveConcert={(markerId) => mapRef.current?.handleShowActiveConcert(markerId)} />
                    </Stack>
                    {/* Share Button */}
                    <Stack container spacing={2} direction="row" alignItems="center" justifyContent="center" Id="UIControls">
                        <Button color="primary" disabled={concerts.length === 0}
                            onClick={() => {
                                mapRef.current?.handleResetMapView();
                            }} variant="contained">
                            Reset Map View
                        </Button>
                        <Button variant="contained" color="primary"
                            onClick={() => {
                                setUseDirections(prev => !prev);
                                mapRef.current?.handleSetUseDirection(useDirections);
                            }}>
                            {useDirections ? 'Hide Directions' : 'Show Directions'}
                        </Button>
                        {(concerts.length > 0) &&
                            <Button color="primary"
                                onClick={async () => {
                                    await handleDownloadImage();
                                }} variant="contained">
                                Share As Image
                            </Button>}
                    </Stack>
                </Stack>
            </Fade>
        </Stack>
    );
};

export default Voyage;