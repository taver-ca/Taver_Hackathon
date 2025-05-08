import React, { useState, useEffect } from 'react';
import { Stack, TextField, Button, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, Card, CardHeader, CardContent } from '@mui/material';
import DismissButton from "./../TaleSetup/DismissButton.js";
import { FetchName } from './../Odyssey/FetchName.js';
import RouteChoiceList from './RouteChoiceList.js';

// Helper function: calculate Euclidean distance
function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.location.gpsCoordinate.coords.latitude - b.location.gpsCoordinate.coords.latitude, 2) + Math.pow(a.location.gpsCoordinate.coords.longitude - b.location.gpsCoordinate.coords.longitude, 2));
}

// Helper function: calculate time difference
function calculateTimeDifference(timeA, timeB) {
    return Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime());
}

// Group events based on proximity, ensuring unique artistId in each cluster
function groupByProximityWithUniqueArtists(events, distanceThreshold, timeThreshold) {
    
    events.sort((a, b) => a.date.localeCompare(b.date)); // Sort by event time first
    const clusters = [];
    const visited = new Set();
    
    events.forEach(event => {
        if (!visited.has(event.id)) {
            let cluster = [event];
            let lastEvent = event;
            visited.add(event.id);
            
            events.forEach(otherEvent => {
                if (!visited.has(otherEvent.id)) {
                    const distance = calculateDistance(lastEvent, otherEvent);
                    const timeDifference = calculateTimeDifference(lastEvent.date, otherEvent.date);
                    
                    if (distance <= distanceThreshold && timeDifference <= timeThreshold) {
                        cluster.push(otherEvent);
                        visited.add(otherEvent.id);
                        lastEvent = otherEvent; // Ensure we prioritize forward movement
                    }
                }
            });

            if (cluster.length > 2 && cluster.length < 7) {
                clusters.push(cluster);
            }
        }
    });

    return clusters;
}

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

    const initialSpotifyURL = "https://open.spotify.com/playlist/";
    const [spotifyPlayList, setSpotifyPlaylist] = useState("");
    const [calculatedRoutes, setCalculatedRoutes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
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

    let handlePlaylistSubmit = async (e) => {
        e.preventDefault();
        const url = spotifyPlayList;
        const urlValidate = new RegExp("^https://open\\.spotify\\.com/playlist/[a-zA-Z0-9]{22}(\\?si=.*)?$");
        if (urlValidate.test(spotifyPlayList)) {
            setErrorMessage("");
        }
        else {
            setErrorMessage("Please enter a valid Spotify playlist URL.");
        }

        const startIndex = url.lastIndexOf("/") + 1; // Find the index of the last slash and add 1
        const endIndex = url.indexOf("?"); // Find the index of the question mark

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
                let resJson = await res.json();
                //console.table(resJson);
                const existingArtists = followedArtists;
                const incomingArtists = resJson.artistList;
                const existingGigs = allConcerts;
                const incomingGigs = resJson.artistGigList;
                const playlistName = resJson.playlistName;
                const updatedArtists = [...existingArtists, ...incomingArtists].filter(
                    (value, index, self) => self.findIndex(otherItem => otherItem.id === value.id) === index
                );
                const updatedGigs = [...existingGigs, ...incomingGigs].filter(
                    (value, index, self) => self.findIndex(otherItem => otherItem.id === value.id) === index
                );

                if (updatedArtists.length < 1) {
                    alert(`Oof, nobody from this playlist is on tour...`);
                }
                await new Promise(resolve => {
                    setPosterName(playlistName);
                    setFollowedArtists(updatedArtists);
                    setAllConcerts(updatedGigs);
                    resolve();
                });
                setIsArtistRequestTriggered(false);
                setIsSuggestionRequestTriggered(true);
                // suggest potential routes to user here
                // let the clustering BEGIN!!!!!
                // move the code below to it's separate function sometime later
                // but we are at a hackathon so fuck best practices
                var clusters = groupByProximityWithUniqueArtists(updatedGigs, distanceThreshold, timeThreshold);

                //console.table(clusters);
                // Remove duplicates within each cluster by `id`
                clusters = clusters.map(cluster => {
                    const seenIds = new Set();
                    const seenArtistIds = new Set();
                    // Filter out duplicates by `id` and `artistId`
                    return cluster.filter(gig => {
                        if (seenArtistIds.has(gig.artistId)) return false;
                        if (seenIds.has(gig.id)) return false;
                        seenArtistIds.add(gig.artistId);
                        seenIds.add(gig.id);
                        return true;
                    });
                });
                // Sort each cluster by date
                clusters = clusters.map(cluster =>
                    cluster.sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date in ascending order
                );

                // Filter clusters and sort by length
                clusters = clusters
                    .filter(cluster => cluster.length > 1) // Remove clusters with length of 1
                    .sort((a, b) => b.length - a.length); // Sort clusters by length (descending)
                clusters = clusters.slice(0, 3); // Keep only the top 3 clusters

                //console.table(clusters);
                //give each cluster a name, wait until we get the name from the backend
                await Promise.all(
                    clusters.map(async cluster => {
                        const nameInput = cluster.map(({ title, artist, location, date }) => ({ title, artist, date, venue: location.name, city: location.address }));
                        await FetchName(nameInput).then((suggestions) => {
                            if (suggestions.length >= 1) {
                                cluster.posterName = suggestions[0].title;
                                cluster.nameSuggestions = suggestions.slice(1);
                            }
                        });
                    }));
                await new Promise(resolve => {
                    //passing the clusters to the parent component
                    setTripSuggestions(clusters);
                    //using the cluster to trigger the route dialog right here
                    setCalculatedRoutes(clusters);
                    resolve();
                });
                setIsSuggestionRequestTriggered(false);
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
                    <form onSubmit={handlePlaylistSubmit}>
                    <Stack
                        direction={'column'}
                        spacing={2}                        
                        alignItems="center">
                        <TextField
                            sx={{
                                "& input": {
                                    color: "white",
                                },
                                "& label": {
                                    color: "white",
                                },
                                width: { xs: '100%' }
                            }}
                            label="Spotify Playlist URL:"
                            placeholder='https://open.spotify.com/playlist/37i9dQZF1DWXT8uSSn6PRy'
                            InputLabelProps={{ shrink: true }}
                            value={spotifyPlayList} onChange={(e) => setSpotifyPlaylist(e.target.value)}
                            helperText={errorMessage}
                            error={errorMessage}
                        />
                        <Button
                            disabled={(spotifyPlayList.length === 0 || !spotifyPlayList.includes(initialSpotifyURL)) ? true : false}
                            type="submit"
                            variant="contained"
                            color="primary">
                            Submit
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