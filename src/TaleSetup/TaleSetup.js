import { useRef, useState, useMemo } from "react";
import { Grid, Box, Stack, Tab, Tabs, Fade, Badge, CircularProgress } from "@mui/material";
import BaseInput from "./BaseInput.js";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js";
import MapStyle from "./MapStyle.js";


const TaleSetup = ({
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
    setPosterNameSuggestions,
    setShareId,
    setShow_ToggleUIFab,
    setActiveTab,
    saveRouteInProgress,
    activeTab,
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
    posterName,
    shareId,
    posterNameSuggestions,
    showActiveConcert
}) => {
    const [isTourMapChecked, setIsTourMapChecked] = useState(false);
    const [showBadge, setShowBadge] = useState(false);

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
            setShowBadge(true);
            childRef.current.handleArtistChoiceUpdateFromParent(artist);
        }
    };

    const handleRoutePick = (route) => {
        setShowBadge(true);
        childRef.current.handleRouteChoiceUpdateFromParent(route);
    }



    const isInputDisabled = activeTab >= 2;
    const handleTabChange = (event, newValue) => {
        if (newValue === 2) {
            setShow_ToggleUIFab(false);
        }
        else {
            setShow_ToggleUIFab(true);
        }
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
        <Stack container sx={{ px: 2, flexDirection: 'column', overflow: 'auto' }} spacing={2}>
            <Grid flexDirection="column" sx={{ position: 'relative' }}>
                <Box
                    component="img"
                    src={window.location.origin + "/Taver.png"}
                    alt="Taver"
                    sx={{ width: { xs: 200 }, height: "auto" }}
                />
            </Grid>
            <Fade in={!isInputDisabled} mountOnEnter unmountOnExit>
                <Stack justifyContent="center" spacing={1} direction='row'>
                    <Grid display='flex' flex={1}>
                        <BaseInput
                            setIsTourMapChecked={setIsTourMapChecked}
                            setConcerts={setConcerts}
                            setUserLocation={setUserLocation}
                            setMapStyle={setMapStyle}
                            setAllConcerts={setAllConcerts}
                            setPosterName={setPosterName}
                            setFollowedArtists={setFollowedArtists}
                            setArtistWishlist={setArtistWishlist}
                            setPosterNameSuggestions={setPosterNameSuggestions}
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
                            ref={childRef} />
                    </Grid>
                    <Fade in={!isTourMapChecked} mountOnEnter unmountOnExit>
                        <Grid display='flex' flex={1}>
                            <PickDate
                                updateStartDateInParent={setStartDate}
                                updateEndDateInParent={setEndDate}
                                artistName={artistName}
                                newArtistList={setArtistList}
                                openDialog={setOpenDialog}
                            />
                        </Grid>
                    </Fade>
                </Stack>
            </Fade>
            <Fade in={!isTourMapChecked} mountOnEnter unmountOnExit>
                <Stack sx={{ position: 'relative' }} >
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
                            <Tab disabled={isScheduleTabDisabled}
                                label=
                                {
                                    <Box padding={1} gap={2} >
                                        <Badge
                                            color="error"
                                            variant="dot"
                                            invisible={!showBadge}>
                                            Schedule
                                        </Badge>
                                    </Box>
                                }
                                onClick={() => setShowBadge(false)} />
                            <Tab disabled={isArtistTabDisabled || isScheduleTabDisabled} label="Map Style" />
                        </Tabs>
                    </Box>
                    <Box mt={8}>
                        <TabPanel value={activeTab} index={0}>
                            <GetSpotifyPlaylistArtistsWithShows
                                setFollowedArtists={setFollowedArtists}
                                setIsArtistRequestTriggered={setIsArtistRequestTriggered}
                                setIsSuggestionRequestTriggered={setIsSuggestionRequestTriggered}
                                setAllConcerts={setAllConcerts}
                                setTripSuggestions={setTripSuggestions}
                                setOpenRouteDialog={setOpenRouteDialog}
                                setRoute={handleRoutePick}
                                setActiveTab={setActiveTab}
                                setPosterName={setPosterName}
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
                            {saveRouteInProgress ? <CircularProgress /> : <ConcertList
                                allConcerts={allConcerts}
                                userLocation={userLocation}
                                posterNameSuggestions={posterNameSuggestions}
                                setPosterNameSuggestions={setPosterNameSuggestions}
                                setShareId={setShareId}
                                setPosterName={setPosterName}
                                setConcerts={setConcerts}
                                setAllConcerts={setAllConcerts}
                                setArtistWishlist={setArtistWishlist}
                                posterName={posterName}
                                artistWishlist={artistWishlist}
                                concerts={concerts}
                                showActiveConcert={showActiveConcert}
                            />}
                        </TabPanel>
                        <TabPanel value={activeTab} index={3}>
                            <MapStyle setMapStyle={setMapStyle} />
                        </TabPanel>
                    </Box>
                </Stack>
            </Fade>
        </Stack>);
};
export default TaleSetup;
