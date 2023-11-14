import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";



const getToken = async (code, code_verifier) => {
  try {
    let res = await fetch("http://localhost:3001/spotifyauth", {
      method: "POST",
      headers: {
        'content-type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        code: code,
        code_verifier: code_verifier
      }),
    });

    let resJson = await res.json()
    if (res.status === 200) {
      return resJson;
    } else {
      console.log("Some error occured");
    }
  } catch (err) {
    console.log(err);
  }
}

function YourFavoriteSpotifyArtists() {

  let location = useLocation();
  let code_verifier = localStorage.getItem('code_verifier');
  let searchParams = new URLSearchParams(location.search);
  let code = searchParams.get("code");
  const [token, setToken] = useState("");

  useEffect(() => {

    var tokenJsonObject = getToken(code, code_verifier);
    setToken(tokenJsonObject.token);





  });

  // Display spotify token 
  return (
    <div>
      <p>Code: {code}</p>
      <p>Token: {token}</p>
    </div>
  );
}

export default YourFavoriteSpotifyArtists;
