import React, { useState } from 'react';
import { Stack, TextField, Button, Typography } from '@mui/material';

function GetSpotifyPlaylistArtistsWithShows({ followedArtists, setFollowedArtists, startDate, endDate, setIsRequestTriggered }) {
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
                const updatedArtists = [...existingArtists, ...resJson].filter(
                    (value, index, self) => self.findIndex(otherItem => otherItem.id === value.id) === index
                );
                setFollowedArtists(updatedArtists);
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
                            width:{xs:'100%'}
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