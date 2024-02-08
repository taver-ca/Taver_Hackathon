import React, { useState } from 'react';
import { Grid, Chip, Stack, Box } from '@mui/material';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists({ onChildClick, startDate, endDate }) {
  let location = useLocation();
  let code_verifier = localStorage.getItem('code_verifier');
  let searchParams = new URLSearchParams(location.search);
  let code = searchParams.get("code");

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




  let getSpotifyArtist = async () => {

    console.log(`code: ${code}`);
    if (code === null) {
      console.log("code is empty, abort access token acquisition");
      return;
    }

    if (code_verifier !== null && code_verifier !== null) {

      setDisableButton(true);
      await fetch(`${process.env.REACT_APP_BACKEND}/getFollowedArtists`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          code: code,
          code_verifier: code_verifier,
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
        <Stack xs={4} md={4}  container spacing={1} direction="row">
          {commaSeparatedfollowedArtists}
        </Stack>
      </div>) : (<Chip color="primary" label="Get your top artists" sx={{ background: "limegreen" }} onClick={getSpotifyArtist}></Chip>)}
    </div>
  );
}

export default YourFavoriteSpotifyArtists;