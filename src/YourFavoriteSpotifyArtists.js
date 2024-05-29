import React, { useEffect, useState } from 'react';
import { Grid, Button } from '@mui/material';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists({ startDate, endDate, followedArtists, setFollowedArtists }) {
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const [code, setCode] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");
  const [disableButton, setDisableButton] = useState(false);

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
    }
  };

  // Display spotify token 
  return (
    <Grid>


      {disableButton ? (<div></div>
      ) : (
        <Button
          sx={{ background: "limegreen" }}
          variant="contained"
          color="success"
          onClick={getSpotifyArtist}>
          Get your top artists
        </Button>)}

    </Grid>
  );
}

export default YourFavoriteSpotifyArtists;