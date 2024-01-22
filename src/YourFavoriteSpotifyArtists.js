import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists({ onChildClick }) {
  let location = useLocation();
  let code_verifier = localStorage.getItem('code_verifier');
  let searchParams = new URLSearchParams(location.search);
  let code = searchParams.get("code");
  const [trigger, setTrigger] = useState(false);
  const [followedArtists, setFollowedArtists] = useState([]);

  const handleClick = (artistName) => {
    onChildClick(artistName);
  };


  const commaSeparatedfollowedArtists = followedArtists.map((artistName, index) => (
    <span key={index}>
      <button onClick={() => handleClick(artistName)}>{artistName}</button>
      {index < followedArtists.length - 1 ? " " : ""}
    </span>
  ));



  useEffect(() => {
    
    const getToken = async (code, code_verifier) => {

      if (trigger) {
        console.log("already attempted access token acquistion, aborting");
        return;
      }
      setTrigger(true);

      try {
        let res = await fetch("http://localhost:3001/getFollowedArtists", {
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            code: code,
            code_verifier: code_verifier
          }),
        });

        if (res.status === 200) {
          let resJson = await res.json();
          setFollowedArtists(resJson);
          return resJson;
        }

      } catch (err) {
        console.log("Some error occured");
        console.log(err);
        return;
      }
    }

    if (code === null) {
      console.log("code is empty, abort access token acquisition");
      return;
    }

    if (code_verifier !== null && code_verifier !== '') {
      getToken(code, code_verifier);
    }
  });

  // Display spotify token 
  return (
    <div>
      <p>Followed Artists: </p>
      <p>{commaSeparatedfollowedArtists}</p>
    </div>
  );
}

export default YourFavoriteSpotifyArtists;