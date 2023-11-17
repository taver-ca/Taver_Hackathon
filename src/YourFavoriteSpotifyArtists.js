import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists() {

  let location = useLocation();
  let code_verifier = localStorage.getItem('code_verifier');
  let searchParams = new URLSearchParams(location.search);
  let code = searchParams.get("code");
  const [token, setToken] = useState("");
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {

    const getToken = async (code, code_verifier) => {

      if (trigger) {
        console.log("already attempted access token acquistion, aborting");
        return;
      }
      setTrigger(true);

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

        if (res.status === 200) {
          let resJson = await res.json();
          setToken(resJson);
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
    
    getToken(code, code_verifier);

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
