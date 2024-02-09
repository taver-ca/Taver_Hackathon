import React, { useEffect, useState } from 'react';
import { Grid, Chip, Stack } from '@mui/material';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists({ onChildClick, startDate, endDate }) {
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const [code, setCode] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [disableButton, setDisableButton] = useState(false);

  const handleClick = (artistName) => {
    onChildClick(artistName);
  };


  const commaSeparatedfollowedArtists = followedArtists.map((artistName, index) => {
    return (

      <Grid item key={index}>
        <Chip sx={{ background: "limegreen" }} label={artistName} color="primary" onClick={() => handleClick(artistName)} />
      </Grid>

    );
  });



  useEffect(() => {
    async function fetchAccessData() {

      await fetch(`${process.env.REACT_APP_BACKEND}/authorization`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          code: code,
          code_verifier: codeVerifier
        }),
      }).then(async (res) => {
        console.log(`response status code: ${res.status}`);
        if (res.status === 200) {
          let resJson = await res.json();

          localStorage.setItem("access_token", resJson.access_token);
          localStorage.setItem("token_type", resJson.token_type);
          localStorage.setItem("expires_in", resJson.expires_in);
          //bad practice, need to find a better way to store this
          localStorage.setItem("refresh_token", resJson.refresh_token);
          localStorage.setItem("scope", resJson.scope);
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
      await fetch(`${process.env.REACT_APP_BACKEND}/getFollowedArtists`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          access_token: {
            access_token: localStorage.getItem("access_token"),
            token_type: localStorage.getItem("token_type"),
            expires_in: localStorage.getItem("expires_in"),
            refresh_token: localStorage.getItem("refresh_token"),
            scope: localStorage.getItem("scope")
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
    <div>
      <p>Top Artists: </p>
      {disableButton ? (
        <div>
          <Stack xs={4} md={4} container spacing={1} direction="row">
            {commaSeparatedfollowedArtists}
          </Stack>
        </div>) : (<Chip color="primary" label="Get your top artists" sx={{ background: "limegreen" }} onClick={getSpotifyArtist}></Chip>)}
    </div>
  );
}

export default YourFavoriteSpotifyArtists;