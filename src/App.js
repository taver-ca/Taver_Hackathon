/*import logo from './logo.svg';*/
import "./App.css";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import TaleSetup from "./TaleSetup/TaleSetup.js";
import Odyssey from "./Odyssey/Odyssey.js";


function App() {
  let cachedStartDate = localStorage.getItem("startDate");
  let cachedEndDate = localStorage.getItem("endDate");
  //concerts is used to display the current optimized route
  const [concerts, setConcerts] = useState([]);
  const [artistWishlist, setArtistWishlist] = useState([]);
  const [isRequestTriggered, setIsRequestTriggered] = useState(false);
  //all concerts is used to reoptimize the whole route... based on incoming concert
  const [allConcerts, setAllConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [posterName, setPosterName] = useState("");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [artistName, setArtistName] = useState("Taylor Swift");
  const [artistList, setArtistList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [shareId, setShareId] = useState("");
  const [startDate, setStartDate] = useState(
    cachedStartDate === null ? new Date() : new Date(cachedStartDate)
  );
  const [endDate, setEndDate] = useState(
    cachedEndDate === null ? new Date() : new Date(cachedEndDate)
  );
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");


  useEffect(() => {
    if (artistName) console.log("Artist Name: ", artistName);
  }, [artistName]);




  return (

    <div className="App">
      <Grid
        className="App-header"
        container
        columnSpacing={{ xs: 1, sm: 2, md: 3, lg: 10, xl: 3 }}
        alignItems="flex-start"
      >
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
          isRequestTriggered={isRequestTriggered} />
        <Odyssey
          concerts={concerts}
          userLocation={userLocation}
          mapStyle={mapStyle}
          setPosterName={setPosterName}
          posterName={posterName}
          startDate={startDate}
          endDate={endDate}
          setShareId={setShareId}
          shareId={shareId} />
      </Grid>
    </div>
  );
}
export default App;
