/*import logo from './logo.svg';*/
import "./App.css";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useRef, useEffect } from "react";
import { Grid, Box, Button } from "@mui/material";
import TaleSetup from "./Setup/TaleSetup.js";
import SharePage from "./SharePage.js";
import html2canvas from "html2canvas";
import canvas2image from "@reglendo/canvas2image";


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
  const [posterName, setPosterName] = useState("poster");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [artistName, setArtistName] = useState("Taylor Swift");
  const [artistList, setArtistList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [startDate, setStartDate] = useState(
    cachedStartDate === null ? new Date() : new Date(cachedStartDate)
  );
  const [endDate, setEndDate] = useState(
    cachedEndDate === null ? new Date() : new Date(cachedEndDate)
  );
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");
  const childRef = useRef();

  const triggerReEvaluation = (updatedArtistWishlist) => {
    console.log("trigger re-evaluation");
    childRef.current.handleReEvaluation(updatedArtistWishlist);
  }
  const handleChildClick = (artistName) => {
    childRef.current.handleRequestFromParent(artistName);
  };

  useEffect(() => {
    if (artistName) console.log("Artist Name: ", artistName);
  }, [artistName]);

  const handleDownloadImage = async function () {
    const element = document.getElementById("sharepage");
    html2canvas(element, {
      logging: true,
      proxy: `${process.env.REACT_APP_BACKEND}/GetImage`,
      backgroundColor: "#282c34",

      ignoreElements: (node) => {
        return node.nodeName === "IFRAME";
      },
      scrollY: window.scrollY * -1,
    }).then((canvas) => {
      canvas2image.saveAsPNG(canvas, posterName, canvas.width, canvas.height);
    });
  };

  const handleShareAsLink = async function () {
    //gather json for artists, map coordinates, share page schedules, concert list, trip name, map style id, start date, end date
    try {
      let res = await fetch(`${process.env.REACT_APP_BACKEND}/SaveTrips`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          ownerUsername: "",
          startingPoint: userLocation,
          gigs: concerts,
          tripName: posterName,
          startDate: startDate,
          mapStyleId: mapStyle,
          endDate: endDate
        })
      });


      if (res.status === 200) {
        let incomingConcerts = await res.json();
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
    //make a request to taverondemand.azurewebsites.net/api/SaveTrips
  };

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
          setArtistWishlist={setArtistList}
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
          triggerReEvaluation={triggerReEvaluation}
          isRequestTriggered={isRequestTriggered} />
        <Grid item xs={10} sm={10} md={10} lg={7} xl={8} direction={"row"}>
          <div id="sharepage">
            <SharePage
              concerts={concerts}
              userLocation={userLocation}
              mapStyle={mapStyle}
              setPosterName={setPosterName}
            />
          </div>
          <Grid spacing={2} direction={"row"}>
            <Grid item>
              <Button
                id="sharelinkbutton"
                color="primary"
                disabled={concerts.length === 0}
                onClick={handleShareAsLink}
                variant="contained">Share As Link</Button>
            </Grid>
            <Grid item>
              <Button
                id="sharebutton"
                color="primary"
                onClick={handleDownloadImage}
                variant="contained"
              >
                Share As Image
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
export default App;
