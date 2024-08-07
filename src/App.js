/*import logo from './logo.svg';*/
import "./App.css";
import BaseInput from "./BaseInput.js";
import { useState, useRef, useEffect } from "react";
import { Grid, Box, Button } from "@mui/material";
import PickDate from "./PickDate.js";
import ConcertList from "./ConcertList.js";
import SharePage from "./SharePage.js";
import html2canvas from "html2canvas";
import canvas2image from "@reglendo/canvas2image";
import GetSpotifyPlaylistArtistsWithShows from "./GetSpotifyPlaylistArtistsWithShows.js";
import YourSpotifyArtistsWithShows from "./YourSpotifyArtistsWithShows.js";

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

  const triggerReEvaluation=(updatedArtistWishlist)=>{
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

  return (
    <div className="App">
      <Grid
        className="App-header"
        container
        columnSpacing={{ xs: 1, sm: 2, md: 3, lg: 10, xl: 3 }}
        alignItems="flex-start"
      >
        <Grid direction={"column"} xs={10} sm={10} md={10} lg={2} xl={2}>
          <Box>
            <img src={window.location.origin + "/Taver.png"} alt="Taver" />
          </Box>
          <PickDate
            updateStartDateInParent={setStartDate}
            updateEndDateInParent={setEndDate}
            artistName={artistName}
            newArtistList={setArtistList}
            openDialog={setOpenDialog}
          />
          <p />
          <BaseInput
            setConcerts={setConcerts}
            setUserLocation={setUserLocation}
            setMapStyle={setMapStyle}
            setAllConcerts={setAllConcerts}
            startDate={startDate}
            endDate={endDate}
            concerts={concerts}
            allConcerts={allConcerts}
            userLocation={userLocation}
            updateArtistNameInParent={(value) => setArtistName(value)}
            newArtistList={setArtistList}
            artistListFromParent={artistList}
            followedArtists = {followedArtists}
            setFollowedArtists = {setFollowedArtists}
            artistWishlist = {artistWishlist}
            setArtistWishlist = {setArtistWishlist}
            openDialogFromParent={openDialog}
            closeDialog={() => {
              setOpenDialog(false);
            }}
            ref={childRef}
          />
          <GetSpotifyPlaylistArtistsWithShows
            followedArtists={followedArtists}
            setFollowedArtists={setFollowedArtists}
            startDate={startDate}
            endDate={endDate}
            setIsRequestTriggered={setIsRequestTriggered}
          />
          <YourSpotifyArtistsWithShows
            artists={followedArtists}
            onChildClick={handleChildClick}
            isRequestTriggered={isRequestTriggered}
          />
          <ConcertList
            setConcerts={setConcerts}
            setAllConcerts={setAllConcerts}
            artistWishlist={artistWishlist}
            setArtistWishlist={setArtistWishlist}
            concerts={concerts}
            triggerReEvaluation={triggerReEvaluation}
          />
        </Grid>
        <Grid item xs={10} sm={10} md={10} lg={7} xl={8} direction={"row"}>
          <div id="sharepage">
            <SharePage
              concerts={concerts}
              userLocation={userLocation}
              mapStyle={mapStyle}
              setPosterName={setPosterName}
            />
          </div>
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
    </div>
  );
}
export default App;
