/*import logo from './logo.svg';*/
import "./App.css";
import Input from "./Input.js";
import Map from "./map";
import { useState, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import YourFavoriteSpotifyArtists from "./YourFavoriteSpotifyArtists.js";

function App() {
  const [concerts, setConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");
  const childRef = useRef();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBrho3RkNlDaztsqX0paNbBW4Do98758a4", // Add your API key
  });

  const handleChildClick = (artistName) => {
    //send artistName to input component
    console.log(artistName);
    childRef.current.handleRequestFromParent(artistName);
  };
  return (
    <div className="App">
      <header className="App-header">
        <Input setConcerts={setConcerts} setUserLocation={setUserLocation} setMapStyle={setMapStyle} ref={childRef} />
        <Router>
          <Routes>
            <Route
              path="/"
              element={<YourFavoriteSpotifyArtists onChildClick={handleChildClick}></YourFavoriteSpotifyArtists>}
            />
          </Routes>
        </Router>
      </header>

      {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
    </div>
  );
}
export default App;
