import { useState } from "react";
var CryptoJS = require("crypto-js");

var redirectUri = "http://localhost:3000/";
var clientId = "03443a9e213f4dacb4e591779a560834";

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getCodeCallenge() {

  const codeVerifier = generateRandomString(64);
  window.localStorage.setItem('code_verifier', codeVerifier);
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);
  return codeChallenge;

}


export default function Input({ setConcerts, setArtist }) {
  const [artistName, setArtistName] = useState("Taylor Swift");
  let handleSpotifySignIn = () => {
    getCodeCallenge().then((result) => {
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-follow-read&code_challenge_method=S256&code_challenge=${result}`;
    });
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch("http://localhost:3001/concerts", {
        method: "POST",
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          artistName: artistName,
        }),
      });

      let resJson = await res.json()
      if (res.status === 200) {
        setConcerts((prev) => (prev.concat(resJson)));
        setArtist(artistName);
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter Artist Name:
        </label>
        <div>
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <button onClick={handleSpotifySignIn}>
        Sign in to Spotify
      </button>
    </div>

  )
}