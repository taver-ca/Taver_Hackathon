import "./App.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import Voyage from "./Voyage/Voyage.js";
import Prologue from "./Prologue/Prologue.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QRCodeCanvas } from "qrcode.react";
import { useMediaQuery } from "@mui/material";


function App() {
  let cachedStartDate = localStorage.getItem("startDate");
  let cachedEndDate = localStorage.getItem("endDate");

  let futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 365);

  //concerts is used to display the current optimized route
  const [concerts, setConcerts] = useState([]);
  const [artistWishlist, setArtistWishlist] = useState([]);
  const [isArtistRequestTriggered, setIsArtistRequestTriggered] = useState(false);
  const [isSuggestionRequestTriggered, setIsSuggestionRequestTriggered] = useState(false);
  //all concerts is used to reoptimize the whole route... based on incoming concert
  const [allConcerts, setAllConcerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [posterName, setPosterName] = useState("");
  const [posterNameSuggestions, setPosterNameSuggestions] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [artistName, setArtistName] = useState("");
  const [artistList, setArtistList] = useState([]);
  //artist search dialog
  const [openDialog, setOpenDialog] = useState(false);
  //route suggestion dialog
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [shareId, setShareId] = useState("");
  const [tripSuggestions, setTripSuggestions] = useState([]);
  const [startDate, setStartDate] = useState(
    cachedStartDate === null ? new Date() : new Date(cachedStartDate)
  );
  const [endDate, setEndDate] = useState(
    cachedEndDate === null ? futureDate : new Date(cachedEndDate)
  );
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [storedPlaylists, setStoredPlaylists] = useState([]);
  const [mapStyle, setMapStyle] = useState("1fc21c527f198d4e");
  const isScreenSmall = useMediaQuery("(max-width:1200px)");
  const theme = createTheme({
    palette: {
      primary: {
        main: "#e2e900",
      },
      secondary: {
        main: "#b1caaa",
      },
    },
  });

  useEffect(() => {
    if (artistName) console.log("Artist Name: ", artistName);
  }, [artistName]);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={
            <ThemeProvider theme={theme}>
              <Grid
                className="App-header"
              >
                <Prologue
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setArtistList={setArtistList}
                  setOpenDialog={setOpenDialog}
                  setOpenRouteDialog={setOpenRouteDialog}
                  setConcerts={setConcerts}
                  setUserLocation={setUserLocation}
                  setMapStyle={setMapStyle}
                  setAllConcerts={setAllConcerts}
                  setArtistName={setArtistName}
                  setFollowedArtists={setFollowedArtists}
                  setArtistWishlist={setArtistWishlist}
                  setIsArtistRequestTriggered={setIsArtistRequestTriggered}
                  setIsSuggestionRequestTriggered={setIsSuggestionRequestTriggered}
                  setTripSuggestions={setTripSuggestions}
                  setPosterName={setPosterName}
                  setShareId={setShareId}
                  setPosterNameSuggestions={setPosterNameSuggestions}
                  startDate={startDate}
                  endDate={endDate}
                  concerts={[...concerts]}
                  artistName={artistName}
                  allConcerts={allConcerts}
                  userLocation={userLocation}
                  artistList={artistList}
                  followedArtists={followedArtists}
                  artistWishlist={[...artistWishlist]}
                  openDialog={openDialog}
                  openRouteDialog={openRouteDialog}
                  isArtistRequestTriggered={isArtistRequestTriggered}
                  isSuggestionRequestTriggered={isSuggestionRequestTriggered}
                  tripSuggestions={tripSuggestions}
                  mapStyle={mapStyle}
                  posterName={posterName}
                  shareId={shareId}
                  posterNameSuggestions={posterNameSuggestions}
                  selectedPlaylist={selectedPlaylist}
                  setSelectedPlaylist={setSelectedPlaylist}
                  storedPlaylists={storedPlaylists}
                  setStoredPlaylists={setStoredPlaylists}
                />
              </Grid>
            </ThemeProvider>
          } />
          <Route path="/tales/:guid" element={
            <ThemeProvider theme={theme}>
              <Grid
                className="Voyage"
                id="sharepage"
                height={'100vh'}
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
                <Grid
                  sx={{
                    position: 'absolute',
                    right: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    bottom: { xs: 5, sm: 5, md: 30, lg: 30, xl: 30 },
                    zIndex: 2,
                  }}>
                  {!isScreenSmall && <QRCodeCanvas
                    id="QRCode"
                    value={window.location.href}
                    alt={window.location.href}
                    size={125}

                    bgColor="#e2e900"
                    level="H"
                  />}
                </Grid>
              </Grid>
            </ThemeProvider>
          } />
        </Routes>
      </Router>
    </div >
  );
}
export default App;
