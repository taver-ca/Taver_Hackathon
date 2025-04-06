/*import logo from './logo.svg';*/
import "./App.css";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import Voyage from "./Voyage/Voyage.js";
import TaleSetup from "./TaleSetup/TaleSetup.js";
import Odyssey from "./Odyssey/Odyssey.js";

function App() {
  let cachedStartDate = localStorage.getItem("startDate");
  let cachedEndDate = localStorage.getItem("endDate");

  let futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 365);

  //concerts is used to display the current optimized route
  const [concerts, setConcerts] = useState([]);
  const [artistWishlist, setArtistWishlist] = useState([]);
  const [isRequestTriggered, setIsRequestTriggered] = useState(false);
  //all concerts is used to reoptimize the whole route... based on incoming concert
  const [allConcerts, setAllConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [posterName, setPosterName] = useState("");
  const [posterNameSuggestions, setPosterNameSuggestions] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [artistName, setArtistName] = useState("");
  const [artistList, setArtistList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [shareId, setShareId] = useState("");
  const [tripSuggestions, setTripSuggestions] = useState([]);
  const [startDate, setStartDate] = useState(
    cachedStartDate === null ? new Date() : new Date(cachedStartDate)
  );
  const [endDate, setEndDate] = useState(
    cachedEndDate === null ? futureDate : new Date(cachedEndDate)
  );
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");


  useEffect(() => {
    if (artistName) console.log("Artist Name: ", artistName);
  }, [artistName]);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={
            <Grid
              className="App-header"
              container
              spacing={3}              
            >
              <Grid item xs={11} sm={11} md={4} lg={3} xl={3} sx={{ minHeight: { xs: '50vh', sm: '50vh', md: '100vh' }}}>
                <TaleSetup setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setArtistList={setArtistList}
                  setOpenDialog={setOpenDialog}
                  setConcerts={setConcerts}
                  setUserLocation={setUserLocation}
                  setMapStyle={setMapStyle}
                  setAllConcerts={setAllConcerts}
                  setArtistName={setArtistName}
                  setFollowedArtists={setFollowedArtists}
                  setArtistWishlist={setArtistWishlist}
                  setIsRequestTriggered={setIsRequestTriggered}
                  setTripSuggestions={setTripSuggestions}
                  startDate={startDate}
                  endDate={endDate}
                  concerts={concerts}
                  artistName={artistName}
                  allConcerts={allConcerts}
                  userLocation={userLocation}
                  artistList={artistList}
                  followedArtists={followedArtists}
                  artistWishlist={artistWishlist}
                  openDialog={openDialog}
                  isRequestTriggered={isRequestTriggered}
                  tripSuggestions={tripSuggestions} />
              </Grid>
              <Grid item xs={11} sm={11} md={7} lg={7} xl={7} sx={{ marginTop: 3}}>
                <Odyssey
                  setPosterName={setPosterName}
                  setShareId={setShareId}
                  concerts={concerts}
                  userLocation={userLocation}
                  mapStyle={mapStyle}
                  posterName={posterName}
                  startDate={startDate}
                  endDate={endDate}
                  shareId={shareId}
                  posterNameSuggestions = {posterNameSuggestions} 
                  setPosterNameSuggestions = {setPosterNameSuggestions}
                  />
              </Grid>
            </Grid>
          } />
          <Route path="/tales/:guid" element={
            <Grid
              className="Voyage"
            >
              <Voyage
                concerts={concerts}
                mapStyle={mapStyle}
                userLocation={userLocation}
                posterName={posterName}
                setPosterName={setPosterName}
                setMapStyle={setMapStyle}
                setConcerts={setConcerts}
                setUserLocation={setUserLocation}
              />
            </Grid>} />
        </Routes>
      </Router>
    </div >
  );
}
export default App;
