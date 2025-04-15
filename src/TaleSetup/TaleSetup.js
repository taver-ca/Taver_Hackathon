import BaseInput from "./BaseInput.js";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js";
import { useRef } from "react";
import { Box, Stack } from "@mui/material";



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
    setIsRequestTriggered,
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
    isRequestTriggered,
    tripSuggestions,
}) => {


    const childRef = useRef();
    const handleArtistPick = (artistName) => {
        childRef.current.handleArtistChoiceUpdateFromParent(artistName);
    };
    const handleRoutePick = (route) => {        
        childRef.current.handleRouteChoiceUpdateFromParent(route);
    }
    const triggerReEvaluation = (updatedArtistWishlist) => {
        console.log("trigger re-evaluation");
        childRef.current.handleReEvaluation(updatedArtistWishlist);
    }

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
                userLocation={userLocation}
                updateArtistNameInParent={(value) => setArtistName(value)}
                newArtistList={setArtistList}
                artistListFromParent={artistList}
                followedArtists={followedArtists}                
                artistWishlist={artistWishlist}
                openDialogFromParent={openDialog}
                closeDialog={() => {
                    setOpenDialog(false);
                }}
                closeRouteDialog={() => {
                    setOpenRouteDialog(false);
                }}
                ref={childRef}
            />
            <GetSpotifyPlaylistArtistsWithShows
                setFollowedArtists={setFollowedArtists}
                setIsRequestTriggered={setIsRequestTriggered}
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
            />
            <YourSpotifyArtistsWithShows
                artists={followedArtists}
                tripSuggestions={tripSuggestions}
                onArtistClick={handleArtistPick}
                onTripSuggestionClick={handleRoutePick}
                isRequestTriggered={isRequestTriggered}
            />
            <ConcertList
                setConcerts={setConcerts}
                setAllConcerts={setAllConcerts}
                artistWishlist={artistWishlist}
                setArtistWishlist={setArtistWishlist}
                concerts={concerts}
                triggerReEvaluation={triggerReEvaluation}
            />
        </Stack>);
};
export default TaleSetup;