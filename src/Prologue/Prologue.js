import { Stack, Typography, Box, Button, Fab, Grid, Tab, Tabs } from "@mui/material";
import Map from "../Odyssey/map";
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api"
import CircularProgress from '@mui/material/CircularProgress';
import ListIcon from '@mui/icons-material/List';
import Fade from '@mui/material/Fade';
import { useMediaQuery } from "@mui/material";
import BaseInput from "./../TaleSetup/BaseInput.js";
import GetSpotifyPlaylistArtistsWithShows from "./../TaleSetup/GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./../TaleSetup/YourSpotifyArtistsWithShows.js";
import PickDate from "./../TaleSetup/PickDate.js";
import ConcertList from "./../TaleSetup/ConcertList.js";
import MapStyle from "./../TaleSetup/MapStyle.js";



const Prologue = ({
    setStartDate,
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
}) => {
    const mapRef = useRef();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });
    const isScreenSmall = useMediaQuery("(max-width:1200px)");

    const [showSchedule, setShowSchedule] = useState(true);


    const [isTourMapChecked, setIsTourMapChecked] = useState(false);
    const isArtistTabDisabled = followedArtists.length === 0;
    const isScheduleTabDisabled = concerts.length === 0;

    const getArtistWishlist = useMemo(() => {
        return artistWishlist.reduce((acc, item) => {
            acc[item.WishlistArtistId] = item;
            return acc;
        }, {});
    }, [artistWishlist]);

    const childRef = useRef();
    const handleArtistPick = (artist) => {
        const isSelected = getArtistWishlist?.[artist.id];
        const newConcerts = concerts.filter(({ artistId }) => artistId !== artist.id);
        const newArtistWishlist = artistWishlist.filter(({ WishlistArtistId }) => WishlistArtistId !== artist.id)

        if (isSelected) {
            setConcerts(newConcerts);
            setArtistWishlist(newArtistWishlist);
        } else {
            childRef.current.handleArtistChoiceUpdateFromParent(artist);
        }

    };
    const handleRoutePick = (route) => {
        childRef.current.handleRouteChoiceUpdateFromParent(route);
    }
    const triggerReEvaluation = (updatedArtistWishlist) => {
        console.log("trigger re-evaluation");
        childRef.current.handleReEvaluation(updatedArtistWishlist);
    }

    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index}>
            {value === index && (
                <Box
                    sx={{
                        borderRadius: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    {children}
                </Box>
            )}
        </div>
    );



    return (
        <Stack sx={{ width: '100%', position: 'relative' }} backgroundColor="#7fc9dc">
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

<Box>
                            <img src={window.location.origin + "/Taver.png"} alt="Taver" />
                        </Box>

                        <BaseInput
                            setIsTourMapChecked={setIsTourMapChecked}
                            setConcerts={setConcerts}
                            setUserLocation={setUserLocation}
                            setMapStyle={setMapStyle}
                            setAllConcerts={setAllConcerts}
                            setPosterName={setPosterName}
                            setFollowedArtists={setFollowedArtists}
                            setArtistWishlist={setArtistWishlist}
                            isTourMapChecked={isTourMapChecked}
                            startDate={startDate}
                            endDate={endDate}
                            allConcerts={allConcerts}
                            concerts={concerts}
                            userLocation={userLocation}
                            updateArtistNameInParent={(value) => setArtistName(value)}
                            newArtistList={setArtistList}
                            artistListFromParent={artistList}
                            followedArtists={followedArtists}
                            artistWishlist={[...artistWishlist]}
                            openDialogFromParent={openDialog}
                            setActiveTab={setActiveTab}
                            closeDialog={() => {
                                setOpenDialog(false);
                            }}
                            closeRouteDialog={() => {
                                setOpenRouteDialog(false);
                            }}
                            ref={childRef}
                        />
                        {!isTourMapChecked && (<PickDate
                            updateStartDateInParent={setStartDate}
                            updateEndDateInParent={setEndDate}
                            artistName={artistName}
                            newArtistList={setArtistList}
                            openDialog={setOpenDialog}
                        />)}
                        {!isTourMapChecked && (<Stack sx={{ position: 'relative' }} spacing={8}>
                            <Box sx={{
                                position: 'absolute',
                                width: '100%',
                                boxShadow: '0 2px 5px 1px rgba(0,0,0,0.1)',
                                backgroundColor: '#5e97a5',
                                borderRadius: '4px'
                            }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        "& .MuiTabs-scrollButtons": {
                                            "&:hover": {
                                                backgroundColor: "#bbdefb", // Slightly darker blue on hover
                                                transform: "scale(1.05)", // Subtle scale effect
                                            },
                                        },
                                        "& .MuiTabs-scrollButtons.Mui-disabled": {
                                            opacity: 0.2, // Disabled buttons appear semi-transparent
                                            cursor: "not-allowed", // Clear disabled state
                                        },
                                        "& .MuiTab-root": {
                                            color: "white", // Make tab text white
                                            "&.Mui-selected": {
                                                color: "white", // Ensure selected tab text is also white
                                            },
                                        },
                                    }}
                                >
                                    <Tab label="Import Playlist" />
                                    <Tab disabled={isArtistTabDisabled} label="Artists & Suggestions" />
                                    <Tab disabled={isScheduleTabDisabled} label="Schedule" />
                                    <Tab disabled={isArtistTabDisabled || isScheduleTabDisabled} label="Map Style" />
                                </Tabs>
                            </Box>
                            <Box>
                                <TabPanel value={activeTab} index={0}>
                                    <GetSpotifyPlaylistArtistsWithShows
                                        setFollowedArtists={setFollowedArtists}
                                        setIsArtistRequestTriggered={setIsArtistRequestTriggered}
                                        setIsSuggestionRequestTriggered={setIsSuggestionRequestTriggered}
                                        setAllConcerts={setAllConcerts}
                                        setTripSuggestions={setTripSuggestions}
                                        setOpenRouteDialog={setOpenRouteDialog}
                                        followedArtists={followedArtists}
                                        startDate={startDate}
                                        endDate={endDate}
                                        allConcerts={allConcerts}
                                        openDialog={openDialog}
                                        openRouteDialogFromParent={openRouteDialog}
                                        closeRouteDialog={() => {
                                            setOpenRouteDialog(false);
                                        }}
                                        trippSuggestions={tripSuggestions}
                                        setRoute={handleRoutePick}
                                        setActiveTab={setActiveTab}
                                    />
                                </TabPanel>
                                <TabPanel value={activeTab} index={1}>
                                    <YourSpotifyArtistsWithShows
                                        artists={followedArtists}
                                        artistWishlist={getArtistWishlist}
                                        tripSuggestions={tripSuggestions}
                                        onArtistClick={handleArtistPick}
                                        onTripSuggestionClick={handleRoutePick}
                                        isArtistRequestTriggered={isArtistRequestTriggered}
                                        isSuggestionRequestTriggered={isSuggestionRequestTriggered}
                                    />
                                </TabPanel>
                                <TabPanel value={activeTab} index={2}>
                                    <ConcertList
                                        setConcerts={setConcerts}
                                        setAllConcerts={setAllConcerts}
                                        artistWishlist={artistWishlist}
                                        setArtistWishlist={setArtistWishlist}
                                        concerts={concerts}
                                        triggerReEvaluation={triggerReEvaluation}
                                    />
                                </TabPanel>
                                <TabPanel value={activeTab} index={3}>
                                    <MapStyle setMapStyle={setMapStyle} />
                                </TabPanel>
                            </Box>
                        </Stack>)}
                </Stack>

            </Fade>
        </Stack>
    );
};





export default Prologue;