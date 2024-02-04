/*import logo from './logo.svg';*/
import "./App.css";
import BaseInput from "./BaseInput.js";
import Map from "./map";
import { useState, useRef, useLayoutEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grid, Stack } from '@mui/material';
import YourFavoriteSpotifyArtists from "./YourFavoriteSpotifyArtists.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js"
import AuthorizeSpotify from "./AuthorizeSpotify.js";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

function App() {
  let cachedStartDate = localStorage.getItem('startDate');
  let cachedEndDate = localStorage.getItem('endDate');
  const [width, height] = useWindowSize();
  const [concerts, setConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [startDate, setStartDate] = useState(cachedStartDate === null ? new Date() : new Date(cachedStartDate));
  const [endDate, setEndDate] = useState(cachedEndDate === null ? new Date() : new Date(cachedEndDate));
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");
  const childRef = useRef();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
  });

  const handleChildClick = (artistName) => {
    //send artistName to input component
    console.log(artistName);
    childRef.current.handleRequestFromParent(artistName);
  };
  return (
    <div className="App">
      {width/height > 1 ? (
        <Grid
          className="App-header"
          container
          spacing={2}>
          
          <Grid item xs={6} md={6}>
          <img src={window.location.origin + '/Taver.png'} alt="Taver" />
            <PickDate updateStartDateInParent={setStartDate} updateEndDateInParent={setEndDate} />
            <p/>
            <BaseInput setConcerts={setConcerts} setUserLocation={setUserLocation} setMapStyle={setMapStyle} startDate={startDate} endDate={endDate} ref={childRef} />
            <Router>
            <Routes>
                <Route path="/" element={<AuthorizeSpotify />} />
              </Routes>
              <Routes>
                <Route path="/ShowSpotifyArtists" element={<YourFavoriteSpotifyArtists onChildClick={handleChildClick} startDate={startDate} endDate={endDate} />} />
              </Routes>
            </Router>
            <ConcertList concerts={concerts}></ConcertList>
          </Grid>
          <Grid item xs={6} md={6}>
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
          </Grid>
        </Grid>
      ) : (
        <Stack
          className="App-header"
          container
          spacing={2}>
          <Stack item xs={10} md={10} sx={{ display: { xs: 'flex', md: 'flex' } }}>
            <PickDate updateStartDateInParent={setStartDate} updateEndDateInParent={setEndDate} />
            <BaseInput setConcerts={setConcerts} setUserLocation={setUserLocation} setMapStyle={setMapStyle} startDate={startDate} endDate={endDate} ref={childRef} />
            <Router>
            <Routes>
                <Route path="/" element={<AuthorizeSpotify />} />
              </Routes>
              <Routes>
                <Route path="/ShowSpotifyArtists" element={<YourFavoriteSpotifyArtists onChildClick={handleChildClick} startDate={startDate} endDate={endDate} />} />
              </Routes>
            </Router>
            <ConcertList concerts={concerts}></ConcertList>
          </Stack>
          <Stack item xs={2} md={2} sx={{ display: { xs: 'flex', md: 'flex' } }}>
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
          </Stack>
        </Stack>
      )}
    </div>
  );
}
export default App;
