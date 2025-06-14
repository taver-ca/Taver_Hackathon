import { useRef, useState, useMemo } from "react";
import { Grid, Box, Stack, Tab, Tabs, Fade, Badge, CircularProgress, Link } from "@mui/material";
import BaseInput from "./BaseInput.js";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js";
import MapStyle from "./MapStyle.js";
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';

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
    clearSelectedArtist,
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
    showActiveConcert,
    selectedPlaylist,
    setSelectedPlaylist,
    storedPlaylists,
    setStoredPlaylists,
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
        setPosterName(route.posterName) // The "route" argument is a trip object with gigs, name suggestions and a poster name
        childRef.current.handleRouteChoiceUpdateFromParent(route);
    }



    const isInputDisabled = activeTab >= 2;
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
        <Stack container sx={{ px: 2, flexDirection: 'column' }} spacing={2}>
            <Grid container flexDirection="row" alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
                <Box
                    component="img"
                    src={window.location.origin + "/Taver.png"}
                    alt="Taver"
                    sx={{ width: { xs: 200 }, height: "auto" }}
                />
                <Stack sx={{
                    width: '12.5%',
                    position: 'absolute',
                    right: 0, // Stick to the right edge
                    bottom: 0, // Center vertically
                    transform: 'translateY(-50%)',
                    paddingRight: 2, // Adds spacing from the edge
                }} flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Link href="https://www.instagram.com/projecttaver/" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InstagramIcon />
                    </Link>
                    <Link href="https://github.com/orgs/taver-ca/discussions" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GitHubIcon />
                    </Link>
                </Stack>
            </Grid>
            <Fade in={!isInputDisabled} mountOnEnter unmountOnExit>
                <Stack justifyContent="center" spacing={1} direction='row'>
                    <Grid display='flex' flex={1} minWidth={'200px'}>
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
                        <Grid display='flex' flex={1} minWidth={'150px'}>
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
                                setUserLocation={setUserLocation}
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
                                userLocation={userLocation}
                                selectedPlaylist={selectedPlaylist}
                                setSelectedPlaylist={setSelectedPlaylist}
                                storedPlaylists={storedPlaylists}
                                setStoredPlaylists={setStoredPlaylists}
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
                                setActiveTab={setActiveTab}
                            />
                        </TabPanel>
                        <TabPanel value={activeTab} index={2}>
                            {saveRouteInProgress ? <Box width='100%' height='100%'><CircularProgress /></Box> :
                                <ConcertList
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
                                    clearSelectedArtist={clearSelectedArtist}
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
