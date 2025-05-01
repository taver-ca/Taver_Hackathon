import { useRef, useState, useMemo } from "react";
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import BaseInput from "./BaseInput.js";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js";
import MapStyle from "./MapStyle.js";


const TaleSetup = ({ setStartDate,
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
}) => {
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
                <Box >
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );

    return (
        <Stack sx={{ container: true, flexDirection: 'column' }} spacing={4}>
            <Box>
                <img src={window.location.origin + "/Taver.png"} alt="Taver" />
            </Box>
            <PickDate
                updateStartDateInParent={setStartDate}
                updateEndDateInParent={setEndDate}
                artistName={artistName}
                newArtistList={setArtistList}
                openDialog={setOpenDialog}
            />
            <BaseInput
                setConcerts={setConcerts}
                setUserLocation={setUserLocation}
                setMapStyle={setMapStyle}
                setAllConcerts={setAllConcerts}
                setPosterName={setPosterName}
                setFollowedArtists={setFollowedArtists}
                setArtistWishlist={setArtistWishlist}
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
            <Stack sx={{ position: 'relative' }} spacing={8}>
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
            </Stack>
        </Stack>);
};
export default TaleSetup;
