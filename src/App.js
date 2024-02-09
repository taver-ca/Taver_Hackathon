/*import logo from './logo.svg';*/
import "./App.css";
import BaseInput from "./BaseInput.js";
import { useState, useRef, useLayoutEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grid, Stack, Box } from '@mui/material';
import YourFavoriteSpotifyArtists from "./YourFavoriteSpotifyArtists.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js"
import AuthorizeSpotify from "./AuthorizeSpotify.js";
import SharePage from "./SharePage.js";

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
  //all concerts is used to reoptimize the whole route... based on incoming concert
  const [allConcerts, setAllConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [startDate, setStartDate] = useState(cachedStartDate === null ? new Date() : new Date(cachedStartDate));
  const [endDate, setEndDate] = useState(cachedEndDate === null ? new Date() : new Date(cachedEndDate));
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");
  const childRef = useRef();

  const handleChildClick = (artistName) => {
    //send artistName to input component
    console.log(artistName);
    childRef.current.handleRequestFromParent(artistName);
  };
  return (
    <div className="App">
      <Grid
          className="App-header"
          container
          spacing={2}>
          <Stack item xs={6} md={6} spacing={2}>
            <Box>
              <img src={window.location.origin + '/Taver.png'} alt="Taver" />
            </Box>
            <PickDate updateStartDateInParent={setStartDate} updateEndDateInParent={setEndDate} />
            <BaseInput setConcerts={setConcerts} setUserLocation={setUserLocation} setMapStyle={setMapStyle} setAllConcerts={setAllConcerts} startDate={startDate} endDate={endDate} concerts={concerts} allConcerts={allConcerts} userLocation={userLocation} ref={childRef} />
            <Router>
              <Routes>
                <Route path="/" element={<AuthorizeSpotify />} />
              </Routes>
              <Routes>
                <Route path="/ShowSpotifyArtists" element={<YourFavoriteSpotifyArtists onChildClick={handleChildClick} startDate={startDate} endDate={endDate} />} />
              </Routes>
            </Router>
            <ConcertList setConcerts={setConcerts} setAllConcerts={setAllConcerts} concerts={concerts}></ConcertList>
          </Stack>
          <Grid item xs={10} md={6} direction={'row'}>
            <SharePage concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} />
          </Grid>
        </Grid>
    </div>
  );
}
export default App;
