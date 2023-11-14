/*import logo from './logo.svg';*/
import './App.css';
import Input from './Input.js';
import Map from './map';
import { useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import YourFavoriteSpotifyArtists from './YourFavoriteSpotifyArtists.js';


function App() {
  const [concerts, setConcerts] = useState([]);
  const [artist, setArtist] = useState("");
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBrho3RkNlDaztsqX0paNbBW4Do98758a4" // Add your API key
  });

  return (
    <div className="App">
      <header className="App-header">
        <Input setConcerts={setConcerts} setArtist={setArtist} />
        <Router>
          <Routes>
            <Route path="/" element={<YourFavoriteSpotifyArtists></YourFavoriteSpotifyArtists>} />
          </Routes>
        </Router>
      </header>

      {isLoaded ? <Map artist={artist} concerts={concerts} /> : null}

    </div>
  );
}
export default App;
