import React, { useState, useEffect } from 'react';
import { Stack, Button, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, Card, CardHeader, CardContent } from '@mui/material';
import DismissButton from "./../TaleSetup/DismissButton.js";
import RouteChoiceList from './RouteChoiceList.js';
import {ClusterArtists} from './ClusterArtists.js';



function GetSpotifyPlaylistArtistsWithShows({
    setFollowedArtists,
    setIsArtistRequestTriggered,
    setIsSuggestionRequestTriggered,
    setAllConcerts,
    setTripSuggestions,
    setRoute,
    setActiveTab,
    setPosterName,
    allConcerts,
    followedArtists,
    startDate,
    endDate,
    openRouteDialogFromParent,
    closeRouteDialog }
) {

    const [spotifyPlayList, setSpotifyPlaylist] = useState("");
    const [calculatedRoutes, setCalculatedRoutes] = useState([]);
    const [open, setOpen] = useState(false);
    // Time threshold (in milliseconds)
    const [timeThreshold, setTimeThreshold] = useState(7 * 24 * 60 * 60 * 1000);
    // Distance threshold (in degrees, you can adjust this)
    const distanceThreshold = 4;

    useEffect(() => {
        let filteredEndDate = endDate instanceof Date ? endDate.getTime() : new Date(endDate).getTime();
        let filteredStartDate = startDate instanceof Date ? startDate.getTime() : new Date(startDate).getTime();
        setTimeThreshold(filteredEndDate - filteredStartDate);
    }, [startDate, endDate]);

    const handleClose = () => {
        setOpen(false);
        closeRouteDialog();
    };

    useEffect(() => {
        console.log("opening route dialog");
        if (calculatedRoutes && calculatedRoutes.length > 0) {
            setOpen(true);
        }
    }, [calculatedRoutes]);


    useEffect(() => {
        if (spotifyPlayList && spotifyPlayList !== "") {
            handlePlaylistSubmit();
        }
    }, [spotifyPlayList]);

    let handlePlaylistSubmit = async () => {
        const url = spotifyPlayList;
        const urlValidate = new RegExp("^https://open\\.spotify\\.com/playlist/[a-zA-Z0-9]{22}(\\?si=.*)?$");
        if (!urlValidate.test(spotifyPlayList)) {
            alert("Please enter a valid Spotify playlist URL.");
            return;
        }

        const startIndex = url.lastIndexOf("/") + 1;
        const endIndex = url.indexOf("?") !== -1 ? url.indexOf("?") : url.length;

        const extractedPlaylistId = url.substring(startIndex, endIndex);
        setIsArtistRequestTriggered(true);
        setActiveTab(1); // Switch to the second tab in the TaleSetup component 
        await fetch(`${process.env.REACT_APP_BACKEND}/GetSpotifyPlaylistArtistsWithGigs`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                playlistId: extractedPlaylistId,
                startDate: startDate,
                endDate: endDate
            }),
        }).then(async (res) => {
            console.log(`response status code: ${res.status}`);
            if (res.status === 200) {
                ClusterArtists(res, followedArtists, allConcerts, timeThreshold, distanceThreshold, setPosterName, setFollowedArtists, setAllConcerts, setIsArtistRequestTriggered, setIsSuggestionRequestTriggered, setTripSuggestions, setCalculatedRoutes);
            }
            return;
        }).catch((err) => {
            console.log("Some error occured");
            console.log(err);
        });
    };

    return (
        <Stack container spacing={3} sx={{ flexDirection: 'column', paddingTop: 0 }}>
            <Card sx={{ backgroundColor: "#70afbf", mt: 1 }} variant="elevation" elevation={3}>
                <CardHeader sx={{ backgroundColor: "#5e97a5", color: "white" }} title="See who's on tour from your playlist" />
                <CardContent sx={{ backgroundColor: "#70afbf", color: "white" }}>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!spotifyPlayList) {
                            const text = await navigator.clipboard.readText();
                            setSpotifyPlaylist(text);
                        }
                    }}>
                        <Stack
                            direction={'column'}
                            spacing={2}
                            alignItems="center">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary">
                                Paste from clipboard
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={open || openRouteDialogFromParent} onClose={closeRouteDialog}>
                <DialogTitle>{"Choices Choices Choices..."}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        We figured out some cool routes based on your Spotify playlist. Feel free to pick one. Or make your own.
                    </DialogContentText>
                    <List>
                        {
                            <RouteChoiceList routes={calculatedRoutes} onRouteClick={setRoute} />
                        }
                    </List>
                    <DialogActions>
                        <DismissButton onClick={handleClose} />
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </Stack>);
}

export default GetSpotifyPlaylistArtistsWithShows;