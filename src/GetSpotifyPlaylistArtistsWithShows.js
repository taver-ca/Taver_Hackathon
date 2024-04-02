import React, { useState } from 'react';
import { Grid, Stack, TextField, Button } from '@mui/material';

function GetSpotifyPlaylistArtistsWithShows({followedArtists, setFollowedArtists, startDate, endDate}) {
    const [spotifyPlayList, setSpotifyPlaylist] = useState("");
    let handleSubmit = async (e) => {
        e.preventDefault();

        const url = spotifyPlayList;
        const startIndex = url.lastIndexOf("/") + 1; // Find the index of the last slash and add 1
        const endIndex = url.indexOf("?"); // Find the index of the question mark

        const extractedPlaylistId = url.substring(startIndex, endIndex);

        await fetch(`${process.env.REACT_APP_BACKEND}/FindArtistWithShows/GetSpotifyPlaylistArtistsWithShows`, {
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
                    (value, index, self) => self.findIndex(otherItem=>otherItem.Id === value.Id) === index
                );
                setFollowedArtists(updatedArtists);
            }
            return;
        }).catch((err) => {
            console.log("Some error occured");
            console.log(err);
        });
    };

    return (<Grid>
        <p>Upcoming Artists With Shows: </p>
        <form onSubmit={handleSubmit}>
            <Stack direction={'column'} spacing={2}>
                <TextField
                    sx={{
                        "& input": {
                            color: "white",
                        },
                        "& label": {
                            color: "white",
                        },
                    }}
                    label="Spotify Playlist URL:"
                    value={spotifyPlayList} onChange={(e) => setSpotifyPlaylist(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary">
                    Submit
                </Button>
            </Stack>
        </form>
    </Grid>);
}

export default GetSpotifyPlaylistArtistsWithShows;