import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists({ onChildClick, startDate, endDate }) {
  let location = useLocation();
  let code_verifier = localStorage.getItem('code_verifier');
  let searchParams = new URLSearchParams(location.search);
  let code = searchParams.get("code");

  const [followedArtists, setFollowedArtists] = useState([]);
  const initialized = useRef(false);
  const handleClick = (artistName) => {
    onChildClick(artistName);
  };


  const commaSeparatedfollowedArtists = followedArtists.map((artistName, index) => {
    return (
      <span key={index}>
        <button onClick={() => handleClick(artistName)}>{artistName}</button>
        {index < followedArtists.length - 1 ? " " : ""}
      </span>
    );
  });

  useEffect(() => {   
    const getToken = async (code, code_verifier) => {
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
        console.log(`initialized.current before setting artist: ${initialized.current}`); 
        if (res.status === 200) {
          initialized.current = true;
          let resJson = await res.json();
          setFollowedArtists(resJson);
        }
        return;
      }).catch((err) => {
        console.log("Some error occured");
        console.log(err);
      });
    }
    console.log(`code: ${code}`);

    if (code === null) {
      console.log("code is empty, abort access token acquisition");
      return;
    }


    if (code_verifier !== null && code_verifier !== null) {
      console.log(`initialized.current: ${initialized.current}`); 
      if (!initialized.current) {
        initialized.current = true;
        getToken(code, code_verifier);       
      }  
      return;    
    }
  }, []);

  // Display spotify token 
  return (
    <div>
      <p>Followed Artists: </p>
      <p>{commaSeparatedfollowedArtists}</p>
    </div>
  );
}

export default YourFavoriteSpotifyArtists;