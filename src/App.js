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
      {width / height > 1 ? (
        <Grid
          className="App-header"
          container
          spacing={2}>
          <Stack item xs={4} md={4} spacing={3}>
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
          <Grid sx={{ height: '100vh' }} item xs={8} md={8}>
            <SharePage concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} />
          </Grid>
        </Grid>
      ) : (
        <Stack
          className="App-header"
          container
          spacing={2}>
          <Stack item xs={2} md={2} spacing={3} sx={{ display: { xs: 'flex', md: 'flex' } }}>
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
          <Stack>
            <SharePage concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} />
          </Stack>
        </Stack>
      )}
    </div>
  );
}
export default App;
