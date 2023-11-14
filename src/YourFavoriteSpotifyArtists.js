import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

function YourFavoriteSpotifyArtists() {

  let location = useLocation();
  let client_id = "03443a9e213f4dacb4e591779a560834";
  let redirect_Uri = "http://localhost:3000/";
  let searchParams = new URLSearchParams(location.search);
  let code = searchParams.get("code");
  const [token, setToken] = useState("");

  useEffect(() => {
    const getToken = async () => {

      // stored in the previous step
      let codeVerifier = localStorage.getItem('code_verifier');

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: client_id,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirect_Uri,
          code_verifier: codeVerifier,
        }),
      }

      const body = await fetch("https://accounts.spotify.com/api/token", payload);
      const response = await body.json();

      localStorage.setItem('access_token', response.access_token);
      setToken(response.access_token);
    }
    getToken();
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
