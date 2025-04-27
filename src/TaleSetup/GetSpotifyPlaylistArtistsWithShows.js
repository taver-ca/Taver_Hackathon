import React, { useState, useEffect } from 'react';
import { Stack, TextField, Button, Typography, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, Box } from '@mui/material';
import DismissButton from "./../TaleSetup/DismissButton.js";
import { FetchName } from './../Odyssey/FetchName.js';
import RouteChoiceList from './RouteChoiceList.js';



// Distance threshold (in degrees, you can adjust this)
const distanceThreshold = 4;

// Time threshold (in milliseconds)
const timeThreshold = 120 * 60 * 60 * 1000; // 24 hours

// Helper function: calculate Euclidean distance
function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.location.gpsCoordinate.coords.latitude - b.location.gpsCoordinate.coords.latitude, 2) + Math.pow(a.location.gpsCoordinate.coords.longitude - b.location.gpsCoordinate.coords.longitude, 2));
}

// Helper function: calculate time difference
function calculateTimeDifference(timeA, timeB) {
    return Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime());
}

// Group events based on proximity, ensuring unique artistId in each cluster
function groupByProximityWithUniqueArtists(events, threshold) {
    const clusters = [];
    const visited = new Set();

    events.forEach(event => {
        if (!visited.has(event.id)) {
            const cluster = [];
            const artistIdsInCluster = new Set();
            visited.add(event.id);
            artistIdsInCluster.add(event.artistId);

            events.forEach(otherEvent => {
                if (!visited.has(otherEvent.id) && !artistIdsInCluster.has(otherEvent.artistId)) {
                    const distance = calculateDistance(event, otherEvent);
                    const timeDifference = calculateTimeDifference(event.date, otherEvent.date);
                    if (distance <= distanceThreshold && timeDifference <= timeThreshold) {
                        cluster.push(otherEvent);
                        visited.add(otherEvent.id);
                        artistIdsInCluster.add(otherEvent.artistId);
                    }
                }
            });

            cluster.push(event); // Include current event in its cluster
            if (cluster.length > 2 && cluster.length < 7) {
                clusters.push(cluster);
            }
        }
    });

    return clusters;
}



function GetSpotifyPlaylistArtistsWithShows({
    allConcerts,
    followedArtists,
    startDate,
    endDate,
    setFollowedArtists,
    setIsArtistRequestTriggered,
    setIsSuggestionRequestTriggered,
    setAllConcerts,
    setTripSuggestions,
    openRouteDialogFromParent,
    closeRouteDialog,
    setRoute,
    setActiveTab }) {
    const initialSpotifyURL = "https://open.spotify.com/playlist/";
    const [spotifyPlayList, setSpotifyPlaylist] = useState("");
    const [calculatedRoutes, setCalculatedRoutes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [open, setOpen] = useState(false);
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
                var clusters = groupByProximityWithUniqueArtists(updatedGigs, distanceThreshold);

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
        <Stack spacing={2}>
            <Box >
                <Typography sx={{ mt: 3, mb: 3 }}>Find concerts from playlist</Typography>
            </Box>
            <form onSubmit={handlePlaylistSubmit}>
                <Stack
                    direction={'column'}
                    spacing={2}
                    container
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