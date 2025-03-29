import React, { useState } from 'react';
import { Stack, TextField, Button, Typography } from '@mui/material';
import geocluster from 'geocluster';

function GetSpotifyPlaylistArtistsWithShows({ allConcerts, followedArtists, startDate, endDate, setFollowedArtists, setIsRequestTriggered, setAllConcerts, setTripSuggestions }) {
    const [spotifyPlayList, setSpotifyPlaylist] = useState("");
    const initialSpotifyURL = "https://open.spotify.com/playlist/";
    const [errorMessage, setErrorMessage] = useState("");

    let handleSubmit = async (e) => {
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
        setIsRequestTriggered(true);
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
                setFollowedArtists(updatedArtists);
                setAllConcerts(updatedGigs);

                // suggest potential routes to user here
                // let the clustering BEGIN!!!!!
                // move the code below to it's separate function sometime later
                // but we are at a hackathon so fuck best practices
                // Extract lat-lon pairs and keep track of indices
                const coordinates = updatedGigs.map((gig) => [gig.location.gpsCoordinate.coords.latitude, gig.location.gpsCoordinate.coords.longitude]);
                // Perform clustering
                const bias = 0.05;
                const result = geocluster(coordinates, bias);

                // Map cluster into trip suggestion
                var clusters = result.map(cluster => (
                    cluster.elements.map(coords => {
                        const index = coordinates.findIndex(
                            ([lat, lon]) => lat === coords[0] && lon === coords[1]
                        );
                        return existingGigs[index];
                    })
                ));
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
                console.table(clusters);
                setTripSuggestions(clusters);
            }
            return;
        }).catch((err) => {
            console.log("Some error occured");
            console.log(err);
        });
        setIsRequestTriggered(false);
    };

    return (
        <Stack spacing={2}>
            <Typography>Find concerts from playlist</Typography>
            <form onSubmit={handleSubmit}>
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
        </Stack>);
}

export default GetSpotifyPlaylistArtistsWithShows;