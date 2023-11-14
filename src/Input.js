import { useState } from "react";
var CryptoJS = require("crypto-js");

var redirectUri = "http://localhost:3000/";
var clientId = "03443a9e213f4dacb4e591779a560834";

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function getCodeCallenge()
{
  let randomString = generateRandomString(64);

   // Convert the bytes array to a base64 string
   var code_verifier = btoa(randomString)
   // Remove any trailing '=' characters
   .replace(/=+$/, '')
   // Replace '+' with '-' and '/' with '_'
   .replace(/\+/g, '-')
   .replace(/\//g, '_');
   localStorage.setItem("code_verifier", code_verifier);

   var sha256 = CryptoJS.algo.SHA256.create()
   var challengeBytes = sha256.finalize(code_verifier);
   var code_challenge = challengeBytes.toString(CryptoJS.enc.Base64).replace('/=+$/', '') .replace('/+/g', '-') .replace('///g', '_');
   return code_challenge;

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