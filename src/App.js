/*import logo from './logo.svg';*/
import "./App.css";
import BaseInput from "./BaseInput.js";
import { useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Grid, Box, Button } from '@mui/material';
import YourFavoriteSpotifyArtists from "./YourFavoriteSpotifyArtists.js";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js"
import AuthorizeSpotify from "./AuthorizeSpotify.js";
import SharePage from "./SharePage.js";
import html2canvas from 'html2canvas';
import canvas2image from "@reglendo/canvas2image";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";

function App() {
  let cachedStartDate = localStorage.getItem('startDate');
  let cachedEndDate = localStorage.getItem('endDate');
  const [concerts, setConcerts] = useState([]);
  //all concerts is used to reoptimize the whole route... based on incoming concert
  const [allConcerts, setAllConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [posterName, setPosterName] = useState('poster');
  const [followedArtists, setFollowedArtists] = useState([]);
  const [startDate, setStartDate] = useState(cachedStartDate === null ? new Date() : new Date(cachedStartDate));
  const [endDate, setEndDate] = useState(cachedEndDate === null ? new Date() : new Date(cachedEndDate));
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");
  const childRef = useRef();

  const handleChildClick = (artistName) => {
    //send artistName to input component
    console.log(artistName);
    childRef.current.handleRequestFromParent(artistName);
  };


  const handleDownloadImage = async function () {
    const element = document.getElementById('sharepage');
    html2canvas(element, {
      logging: true,
      proxy: `${process.env.REACT_APP_BACKEND}/ImageProxy`,
      backgroundColor: '#282c34',

      ignoreElements: (node) => {
        return node.nodeName === "IFRAME";
      },
      scrollY: (window.scrollY * -1)

    }).then(canvas => {
      canvas2image.saveAsPNG(canvas, posterName, canvas.width, canvas.height);
    });
  }

  return (
    <div className="App">
      <Grid
        className="App-header"
        container
        spacing={2}
        alignItems="flex-start">
        <Grid direction={'column'} xs={10} md={3} spacing={2}>
          <Box>
            <img src={window.location.origin + '/Taver.png'} alt="Taver" />
          </Box>
          <PickDate updateStartDateInParent={setStartDate} updateEndDateInParent={setEndDate} />
          <p />
          <BaseInput setConcerts={setConcerts} setUserLocation={setUserLocation} setMapStyle={setMapStyle} setAllConcerts={setAllConcerts} startDate={startDate} endDate={endDate} concerts={concerts} allConcerts={allConcerts} userLocation={userLocation} ref={childRef} />
          <GetSpotifyPlaylistArtistsWithShows followedArtists={followedArtists} setFollowedArtists={setFollowedArtists} startDate={startDate} endDate={endDate}/>
          <Router>
            <Routes>
              <Route path="/" element={<AuthorizeSpotify />} />
            </Routes>
            <Routes>
              <Route path="/ShowSpotifyArtists" element={<YourFavoriteSpotifyArtists startDate={startDate} endDate={endDate} followedArtists={followedArtists} setFollowedArtists={setFollowedArtists} />} />
            </Routes>
          </Router>
          <p/>
          <YourSpotifyArtistsWithShows artists={followedArtists} onChildClick={handleChildClick}/>
          <ConcertList setConcerts={setConcerts} setAllConcerts={setAllConcerts} concerts={concerts}/>
        </Grid>
        <Grid item xs={10} md={5} direction={'row'}>
          <div id="sharepage">
            <SharePage
              concerts={concerts}
              userLocation={userLocation}
              mapStyle={mapStyle}
              setPosterName={setPosterName} />
          </div>
          <Button id="sharebutton" color="primary" onClick={handleDownloadImage} variant="contained">Share As Image</Button>
        </Grid>
      </Grid>
    </div>
  );
}
export default App;
