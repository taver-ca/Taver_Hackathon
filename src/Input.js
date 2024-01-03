import { useState, forwardRef, useImperativeHandle } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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

const Input = forwardRef(({ setConcerts, setArtist, setUserLocation }, ref) => {
  useImperativeHandle(ref, () => ({
    handleRequestFromParent: (artistName) => {
      //do something
      submitArtist(artistName);
    }
  }));
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [artistName, setArtistName] = useState("Taylor Swift");

  let handleSpotifySignIn = () => {
    getCodeCallenge().then((result) => {
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-top-read%20&code_challenge_method=S256&code_challenge=${result}`;
    });
  };

  const submitArtist = async (incomingArtistName) => {
    try {
      let res = await fetch("http://localhost:3001/concerts", {
        method: "POST",
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          artistName: incomingArtistName,
          startDate: startDate,
          endDate: endDate
        }),
      });

      let resJson = await res.json()
      if (res.status === 200) 
      {
        function showPosition(position) 
        {
          setUserLocation(position);
          console.log('home position: '+ position.coords.latitude + ',' + position.coords.longitude );
        }

        if (navigator.geolocation) 
        {
          navigator.geolocation.getCurrentPosition(showPosition);
        }
        else 
        { 
          console.log("failed") 
        }

        setConcerts((prev) => (prev.concat(resJson)));
        setArtist(incomingArtistName);
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  }

  let handleSubmit = async (e) => {
    e.preventDefault();
    submitArtist(artistName);
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
      <div>StartDate: <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} /></div>
      <div>EndDate: <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} /></div>

      <button onClick={handleSpotifySignIn}>
        Sign in to Spotify
      </button>
    </div>

  )
});


export default Input;