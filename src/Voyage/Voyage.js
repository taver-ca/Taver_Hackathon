import { Stack, Typography, Box, Button } from "@mui/material";
import Map from "../Odyssey/map";
import SharePageList from "../Odyssey/SharePageList"
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api"
import CircularProgress from '@mui/material/CircularProgress';
import html2canvas from "html2canvas";
import canvas2image from "@reglendo/canvas2image";
function toLowerCaseKeys(obj) { if (Array.isArray(obj)) { return obj.map(toLowerCaseKeys); } else if (obj !== null && obj.constructor === Object) { return Object.keys(obj).reduce((acc, key) => { const lowerCaseKey = key.charAt(0).toLowerCase() + key.slice(1); acc[lowerCaseKey] = toLowerCaseKeys(obj[key]); return acc; }, {}); } return obj; }



const Voyage = ({
    concerts,
    userLocation,
    mapStyle,
    posterName,
    setPosterName,
    setConcerts,
    setUserLocation,
    setMapStyle

}) => {
    const { guid } = useParams();
    const [loading, setLoading] = useState(true);
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const handleDownloadImage = async function () {
        const element = document.getElementById("sharepage");
        html2canvas(element, {
            logging: true,
            proxy: `${process.env.REACT_APP_BACKEND}/GetImage`,
            backgroundColor: "#7fc9dc",

            ignoreElements: (node) => {
                return node.nodeName === "IFRAME";
            },
            scrollY: window.scrollY * -1,
        }).then((canvas) => {
            let finalPosterName = posterName || "poster";
            canvas2image.saveAsPNG(canvas, finalPosterName, canvas.width, canvas.height);
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

                if (!data.concertJson || !data.startingLocation) {
                    throw new Error("Invalid data structure received from server.");
                }

                // Deserialization
                var parsedConcerts = JSON.parse(data.concertJson);
                var transformedConcerts = toLowerCaseKeys(parsedConcerts);
                var coords = data.startingLocation;
                var result = { coords: { longitude: coords.Longitude, latitude: coords.Latitude } };

                setPosterName(data.tripName);
                setConcerts(transformedConcerts);
                setUserLocation(result);
                setMapStyle(data.mapStyleId);
            } catch (error) {
                alert("An error occurred while loading the trip data. Please try again later.");
                console.error("Error fetching trip data:", error);
            }
            setLoading(false);
        };

        fetchTripData();
    }, []);

    // ...
    if (loading) {
        //do a throbber here
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }} >
                <CircularProgress />
            </Box>);
    }


    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0, middleIndex);
    const concerts2 = concerts.slice(middleIndex);

    return (
        <Stack spacing={3} marginBottom={10} sx={{ width: '100%' }}>
            <Stack spacing={3} sx={{ px:{xs:5, sm:10, md:25, lg:50, xl:75} }}id="sharepage">
                <Box>
                    <img src={window.location.origin + "/Taver.png"} alt="Taver" />
                </Box>
                {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
                <Typography
                    variant="h3"
                >{posterName}</Typography>
                <Stack justifyContent="space-evenly" container  spacing={{xs:-3,sm:-2, md:0}} sx={{ flexDirection: { xs: "column", sm: "column", md: "row" } }} >
                    <SharePageList concerts={concerts1} />
                    <SharePageList concerts={concerts2} />
                </Stack>
            </Stack>
            <Stack
                container
                direction="column"
                alignItems="center"
            >
                <Button
                    id="sharebutton"
                    color="primary"
                    disabled={concerts.length === 0}
                    onClick={handleDownloadImage}
                    variant="contained"
                >
                    Share As Image
                </Button>
            </Stack>
        </Stack>
    );
};

export default Voyage;