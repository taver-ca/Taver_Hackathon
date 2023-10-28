import { useState } from "react";

// GENERATING CODE VERIFIER
function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}
function generateCodeVerifier() {
  var array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}


// GENERATING CODE CHALLENGE FROM VERIFIER
function sha256(plain) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
  var str = "";
  var bytes = new Uint8Array(a);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallengeFromVerifier(v) {
  var hashed = await sha256(v);
  var base64encoded = base64urlencode(hashed);
  return base64encoded;
}

export default function Input({ setConcerts, setArtist }) {
  const [artistName, setArtistName] = useState("Taylor Swift");

  var redirect_uri = "http://localhost:3000/";
  var client_id = "03443a9e213f4dacb4e591779a560834";
  let handleSpotifySignIn = () => {
    generateCodeChallengeFromVerifier(generateCodeVerifier()).then((result) => {
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=user-follow-read&code_challenge_method=S256&code_challenge=${result}`;

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