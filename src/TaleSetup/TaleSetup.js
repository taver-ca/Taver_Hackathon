import BaseInput from "./BaseInput.js";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js";
import {useRef } from "react";
import { Grid, Box } from "@mui/material";



const TaleSetup = ({ setStartDate,
    setEndDate,
    setArtistList,
    setOpenDialog,
    setConcerts,
    setUserLocation,
    setMapStyle,
    setAllConcerts,
    setArtistName,
    setFollowedArtists,
    setArtistWishlist,
    setIsRequestTriggered,
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
    isRequestTriggered
}) => {


    const childRef = useRef();
    const handleChildClick = (artistName) => {
        childRef.current.handleRequestFromParent(artistName);
    };
    const triggerReEvaluation = (updatedArtistWishlist) => {
        console.log("trigger re-evaluation");
        childRef.current.handleReEvaluation(updatedArtistWishlist);
    }

    return (<Grid direction={"column"} xs={10} sm={10} md={10} lg={2} xl={2}>
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
        <p />
        <BaseInput
            setConcerts={setConcerts}
            setUserLocation={setUserLocation}
            setMapStyle={setMapStyle}
            setAllConcerts={setAllConcerts}
            startDate={startDate}
            endDate={endDate}
            allConcerts={allConcerts}
            userLocation={userLocation}
            updateArtistNameInParent={(value) => setArtistName(value)}
            newArtistList={setArtistList}
            artistListFromParent={artistList}
            followedArtists={followedArtists}
            setFollowedArtists={setFollowedArtists}
            artistWishlist={artistWishlist}
            setArtistWishlist={setArtistWishlist}
            openDialogFromParent={openDialog}
            closeDialog={() => {
                setOpenDialog(false);
            }}
            ref={childRef}
        />
        <GetSpotifyPlaylistArtistsWithShows
            followedArtists={followedArtists}
            setFollowedArtists={setFollowedArtists}
            startDate={startDate}
            endDate={endDate}
            setIsRequestTriggered={setIsRequestTriggered}
        />
        <YourSpotifyArtistsWithShows
            artists={followedArtists}
            onChildClick={handleChildClick}
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
    </Grid>);
};
export default TaleSetup;