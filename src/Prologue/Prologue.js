import { Stack, Box, Fab, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api"
import Map from "../Odyssey/map";
import ListIcon from '@mui/icons-material/List';
import SaveIcon from '@mui/icons-material/Save';
import Fade from '@mui/material/Fade';
import TaleSetup from "../TaleSetup/TaleSetup.js";
import { ShareAsLink } from "../Odyssey/ShareAsLink.js"
import { useMediaQuery } from "@mui/material";
import { Backdrop, CircularProgress } from "@mui/material"

const Prologue = ({ setStartDate,
    setEndDate,
    setArtistList,
    setOpenDialog,
    setOpenRouteDialog,
    setConcerts,
    setUserLocation,
    setMapStyle,
    setAllConcerts,
    setArtistName,
    setFollowedArtists,
    setArtistWishlist,
    setIsArtistRequestTriggered,
    setIsSuggestionRequestTriggered,
    setTripSuggestions,
    setPosterName,
    setPosterNameSuggestions,
    setShareId,
    startDate,
    endDate,
    concerts,
    artistName,
    allConcerts,
    userLocation,
    artistList,
    followedArtists,
    artistWishlist,
    openDialog,
    openRouteDialog,
    isArtistRequestTriggered,
    isSuggestionRequestTriggered,
    tripSuggestions,
    mapStyle,
    posterName,
    shareId,
    posterNameSuggestions,
    selectedPlaylist,
    setSelectedPlaylist,
    storedPlaylists,
    setStoredPlaylists,
}) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const mapRef = useRef();
    const [showSchedule, setShowSchedule] = useState(true);
    const [show_ToggleUIFab, setShow_ToggleUIFab] = useState(true);
    const [saveRouteInProgress, setSaveRouteInProgress] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true); // Track loading state
    const [loadingMessage, setLoadingMessage] = useState("Acquiring your location to plan your next road trip, sit tight!"); // Initial message
    const isScreenSmall = useMediaQuery("(max-width:600px)");

    useEffect(() => {
        if (!mapRef) {
            return
        }
        // detected rendering
    }, mapRef)

    useEffect(() => {
        if(activeTab === 2) {
            setShow_ToggleUIFab(false);
        }
        else {
            setShow_ToggleUIFab(true);
        }
    }, [activeTab]);

    useEffect(() => {
        function showPosition(position) {
            setUserLocation(position);          
            setLoading(false); // Hide loading animation once location is acquired
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                showPosition,
                () => {                    
                    setLoadingMessage("Failed to acquire location. Try refreshing the page. Or allow location access for taver.ca");
                },
                {
                    enableHighAccuracy: false,
                    timeout: 30000,
                    maximumAge: 600000
                }
            );
        } else {
            setLoadingMessage("Please enable location services in your browser.");            
        }
    }, []);


    return (
        <Stack sx={{ width: '100%', position: 'relative' }} backgroundColor="#7fc9dc">
            <Backdrop open={loading} sx={{ color: '#e2e900', zIndex: 999 }} direction="column" alignItems="center" justifyContent="center">
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
                    <Typography variant="h6">{loadingMessage}</Typography>
                    <CircularProgress color="inherit" />
                </Stack>
            </Backdrop>

            <Stack sx={{ width: "100%", position: "relative" }} backgroundColor="#7fc9dc">
                {/* Background Map */}
                <Fade in={isLoaded} mountOnEnter unmountOnExit>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        zIndex: 0, // Sends the map to the background
                    }}>
                        <Map ref={mapRef} concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} />
                    </Box>
                </Fade>

                {/* Foreground Content */}
                {show_ToggleUIFab && <Fab sx={{
                    backgroundColor: '#70afbf',
                    color: 'white',
                    position: 'absolute',
                    top: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    left: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    zIndex: 2,
                    '&:hover': {
                        backgroundColor: '#e2e900', // Slightly darker shade for hover effect
                    },
                }} onClick={() => {
                    if (isScreenSmall) {
                        var tempActiveTab = activeTab;
                        if (!showSchedule) {                           
                            setActiveTab(tempActiveTab);
                        }
                    }

                    setShowSchedule(prevState => !prevState);
                }}>
                    <ListIcon />
                </Fab>}

                {!show_ToggleUIFab && <Fab sx={{
                    backgroundColor: '#70afbf',
                    color: 'white',
                    position: 'absolute',
                    top: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    left: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    zIndex: 2,
                    '&:hover': {
                        backgroundColor: '#e2e900', // Slightly darker shade for hover effect
                    },
                }} onClick={() => ShareAsLink(concerts,
                    userLocation,
                    mapStyle,
                    posterName,
                    startDate,
                    endDate,
                    shareId,
                    setShareId,
                    selectedPlaylist,
                    setSaveRouteInProgress)}>
                    <SaveIcon />
                </Fab>}

                <Fade in={showSchedule} mountOnEnter unmountOnExit>
                    <Stack
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

                        <TaleSetup setStartDate={setStartDate}
                            setEndDate={setEndDate}
                            setArtistList={setArtistList}
                            setOpenDialog={setOpenDialog}
                            setOpenRouteDialog={setOpenRouteDialog}
                            setConcerts={setConcerts}
                            setUserLocation={setUserLocation}
                            setMapStyle={setMapStyle}
                            setAllConcerts={setAllConcerts}
                            setArtistName={setArtistName}
                            setFollowedArtists={setFollowedArtists}
                            setArtistWishlist={setArtistWishlist}
                            setIsArtistRequestTriggered={setIsArtistRequestTriggered}
                            setIsSuggestionRequestTriggered={setIsSuggestionRequestTriggered}
                            setTripSuggestions={setTripSuggestions}
                            setPosterName={setPosterName}
                            setPosterNameSuggestions={setPosterNameSuggestions}
                            setShareId={setShareId}
                            setActiveTab={setActiveTab}
                            saveRouteInProgress={saveRouteInProgress}
                            activeTab={activeTab}
                            startDate={startDate}
                            endDate={endDate}
                            concerts={[...concerts]}
                            artistName={artistName}
                            allConcerts={allConcerts}
                            userLocation={userLocation}
                            artistList={artistList}
                            followedArtists={followedArtists}
                            artistWishlist={[...artistWishlist]}
                            openDialog={openDialog}
                            openRouteDialog={openRouteDialog}
                            isArtistRequestTriggered={isArtistRequestTriggered}
                            isSuggestionRequestTriggered={isSuggestionRequestTriggered}
                            tripSuggestions={tripSuggestions}
                            shareId={shareId}
                            posterName={posterName}
                            posterNameSuggestions={posterNameSuggestions}
                            setShow_ToggleUIFab={setShow_ToggleUIFab}
                            setUseDirections = {(setUseDirections) => {
                                mapRef.current?.handleSetUseDirections(setUseDirections);
                            }}
                            clearSelectedArtist={() => {
                                mapRef.current?.handleClearActiveMarker();
                            }}
                            selectedPlaylist={selectedPlaylist}
                            setSelectedPlaylist={setSelectedPlaylist}
                            storedPlaylists={storedPlaylists}
                            setStoredPlaylists={setStoredPlaylists}
                            showActiveConcert={(markerId) => {
                                //if we are on mobile screen
                                //hide ui
                                if (isScreenSmall) {
                                    setShowSchedule(false);
                                    setShow_ToggleUIFab(true);
                                }
                                mapRef.current?.handleShowActiveConcert(markerId);
                            }}
                        />
                    </Stack>
                </Fade>
            </Stack>
        </Stack>
    );
};

export default Prologue;