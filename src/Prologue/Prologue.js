import { Stack, Box, Fab } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api"
import Map from "../Odyssey/map";
import ListIcon from '@mui/icons-material/List';
import Fade from '@mui/material/Fade';
import TaleSetup from "../TaleSetup/TaleSetup.js";

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
    posterNameSuggestions
}) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const mapRef = useRef();
    const [showSchedule, setShowSchedule] = useState(true);    

    useEffect(() => {
        if (!mapRef) {
            return
        }
        // detected rendering
    }, mapRef)

    const showActiveConcert = (markerId) => mapRef.current?.handleShowActiveConcert(markerId);
    return (
        <Stack sx={{ width: '100%', position: 'relative' }} backgroundColor="#7fc9dc">
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
            <Fab sx={{
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
                    spacing={1}
                    sx={{
                        backgroundColor: 'rgba(94, 151, 165, 0.8)', // Semi-transparent background
                        px: { xs: 0, sm: 1 },
                        py: { xs: 3 },
                        position: 'relative',
                        zIndex: 1,
                        width: { xs: '100%', sm: '100%', md: '40%', lg: '30%', xl: '25%' }, // Make it take up only a portion at xl
                        height: '100%', // Full height for smaller screens
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
                        showActiveConcert={(markerId) => mapRef.current?.handleShowActiveConcert(markerId)}
                    />

                </Stack>
            </Fade>
        </Stack>
    );
};

export default Prologue;