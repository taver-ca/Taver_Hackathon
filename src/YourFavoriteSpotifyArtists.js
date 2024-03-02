import React, { useEffect, useState } from 'react';
import { Grid, Chip, Button, Box, Stack, TextField } from '@mui/material';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists({ onChildClick, startDate, endDate }) {
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const [code, setCode] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [disableButton, setDisableButton] = useState(false);
  const [spotifyPlayList, setSpotifyPlaylist] = useState("");
  const handleClick = (artistName) => {
    onChildClick(artistName);
  };


  const commaSeparatedfollowedArtists = followedArtists.map((artistName, index) => {
    return (
      <Grid item key={index}>
        <Chip sx={{ background: "limegreen" }} label={artistName} color="success" onClick={() => handleClick(artistName)} />
      </Grid>
    );
  });

  useEffect(() => {
    async function fetchAccessData() {

      await fetch(`${process.env.REACT_APP_BACKEND}/Authorization`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          ClientId: process.env.REACT_APP_SPOTIFY_CLIENTID,
          Code: code,
          CodeVerifier: codeVerifier,
          RedirectUri: process.env.REACT_APP_REDIRECT_URL
        }),
      }).then(async (res) => {
        console.log(`response status code: ${res.status}`);
        if (res.status === 200) {
          let resJson = await res.json();

          localStorage.setItem("access_token", resJson.accessToken);
          localStorage.setItem("token_type", resJson.tokenType);
          localStorage.setItem("expires_in", resJson.expiresIn);
          //bad practice, need to find a better way to store this
          localStorage.setItem("refresh_token", resJson.refreshToken);
          localStorage.setItem("scope", resJson.scope);
          localStorage.setItem("created_at", resJson.createdAt)
        }
        return;
      }).catch((err) => {
        console.log("Some error occured");
        console.log(err);
      });
    }
    setCode(searchParams.get("code"));
    setCodeVerifier(localStorage.getItem('code_verifier'))

    if (code !== null && codeVerifier !== null) {
      fetchAccessData();
    }
  }, [code, codeVerifier])

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
          (value, index, self) => self.indexOf(value) === index
        );
        setFollowedArtists(updatedArtists);
      }
      return;
    }).catch((err) => {
      console.log("Some error occured");
      console.log(err);
    });
  };
  let getSpotifyArtist = async () => {
    //get access token 
    var access_token = localStorage.getItem("access_token");
    if (access_token !== null) {
      setDisableButton(true);
      //call setFollowedArtists
      await fetch(`${process.env.REACT_APP_BACKEND}/FindArtistWithShows/GetTopArtistsWithShows`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          access_token: {
            AccessToken: localStorage.getItem("access_token"),
            TokenType: localStorage.getItem("token_type"),
            ExpiresIn: localStorage.getItem("expires_in"),
            Scope: localStorage.getItem("scope"),
            RefreshToken: localStorage.getItem("refresh_token"),
            CreatedAt: localStorage.getItem("created_at")
          },
          startDate: startDate,
          endDate: endDate
        }),
      }).then(async (res) => {
        console.log(`response status code: ${res.status}`);
        if (res.status === 200) {
          let resJson = await res.json();
          setFollowedArtists(resJson);
        }
        return;
      }).catch((err) => {
        console.log("Some error occured");
        console.log(err);
      });
    }
  };

  // Display spotify token 
  return (
    <Grid>
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
            label="Spotify Playlist URL"
            value={spotifyPlayList} onChange={(e) => setSpotifyPlaylist(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Stack>
      </form>
      
      {disableButton ? (<div></div>
) : (
        <Button
          sx={{ background: "limegreen" }}
          variant="contained"
          color="success"
          onClick={getSpotifyArtist}>
          Get your top artists
        </Button>)}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"

        >
          <Grid xs={10} md={10} container spacing={1} direction="row" justifyContent="center">
            {commaSeparatedfollowedArtists}
          </Grid>
        </Box>
    </Grid>
  );
}

export default YourFavoriteSpotifyArtists;