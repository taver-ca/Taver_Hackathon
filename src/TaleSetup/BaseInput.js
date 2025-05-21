import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button, Stack, Switch, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, Typography, Card, CardContent, CardHeader, CircularProgress } from '@mui/material';
import DismissButton from "./DismissButton";
import ArtistChoiceList from "./ArtistChoiceList";
import { FetchArtist } from "./FetchArtist";
import moment from "moment";
import { GenerateOptimizedConcertRoute } from './GenerateOptimizedConcertRoute.js'
import { FetchName } from "../Odyssey/FetchName.js";


function formattedDate(incomingDate) {
  var date = new Date(incomingDate);
  return moment(date).format('YYYY/MM/DD');
}

const BaseInput = forwardRef(({
  setIsTourMapChecked,
  setConcerts,
  setUserLocation,
  setFollowedArtists,
  setAllConcerts,
  setArtistWishlist,
  setPosterName,
  setPosterNameSuggestions,
  startDate,
  isTourMapChecked,
  endDate,
  allConcerts,
  concerts,
  userLocation,
  updateArtistNameInParent,
  artistListFromParent,
  posterNameSuggestions,
  openDialogFromParent,
  closeDialog,
  closeRouteDialog,
  newArtistList,
  followedArtists,
  artistWishlist,
  setActiveTab
}, ref) => {

  useEffect(() => {
    function showPosition(position) {
      setUserLocation(position);
      //console.log("home position: " + position.coords.latitude + "," + position.coords.longitude);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("failed");
    }
  }, []);

  useImperativeHandle(ref, () => ({
    handleArtistChoiceUpdateFromParent: (artist) => {
      submitArtistInfo(artist);
    },
    handleRouteChoiceUpdateFromParent: (concerts) => {
      pickRoute(concerts);
    }
  }));

  const [artistName, setArtistName] = useState("");

  const pickRoute = (concerts) => {
    // clear existing concerts and followed artist
    setConcerts([]);
    setArtistWishlist([]);
    //update artist wishlist to include the artist from the concerts
    const artistInfoList = concerts.gigs.map(concert => {
      return { WishlistArtistName: concert.artist, WishlistArtistId: concert.artistId }
    });
    const nameInput = concerts.gigs.map(({ title, artist, location, date }) => ({ title: title.substring(0, 250), artist, date, venue: location.name, city: location.address }));

    // check if we already have a name suggestion
    if (posterNameSuggestions.length < 1) {
      try {
        FetchName(nameInput).then((suggestions) => {
          if (suggestions && suggestions.length >= 1) {
            concerts.posterName = `${suggestions[0].title}`;
            concerts.nameSuggestions = suggestions.slice(1);
            setPosterName(concerts.posterName);
            setPosterNameSuggestions(concerts.nameSuggestions);
          }
        });
      } catch (error) {
        console.error(`Error fetching name for selected suggestion:`, error);
        // Keep default name on error
      }
    }
    
    setConcerts(concerts.gigs);
    setArtistWishlist(artistInfoList);
    closeRouteDialog();
  }

  const submitArtistInfo = async (incomingArtistInfo) => {
    if (startDate === endDate) {
      alert("Your trip start date and end date is on the same day, spread them out");
      return;
    }

    setActiveTab(1); // Switch to the second tab in the TaleSetup component 

    let incomingArtistName = incomingArtistInfo.name;
    let incomingArtistId = incomingArtistInfo.id
    try {
      let res = await fetch(`${process.env.REACT_APP_BACKEND}/GetGigsByArtistId`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          artistId: incomingArtistId,
          startDate: startDate,
          endDate: endDate
        })
      });

      if (res.status === 200) {

        let incomingConcerts = await res.json();

        if (incomingConcerts.length < 1) {
          alert(`no upcoming concerts for ${incomingArtistName} found`);
          return;
        }

        //check if artist is already featured in somebody else's concert 
        //in order to check this 
        //check if existing concert titles includes incoming artist's concert titles
        //check if existing concert titles includes incoming artist's name 

        var existingConcertTitles = concerts.map(concert => concert.title.toLowerCase());
        var incomingConcertTitles = incomingConcerts.map(concert => concert.title.toLowerCase());

        var checkDuplicatesIndex = existingConcertTitles.findIndex((concertTitle) => {
          return concertTitle.includes(incomingArtistName) || incomingConcertTitles.includes(concertTitle);
        });

        if (checkDuplicatesIndex !== -1) {
          if (incomingArtistName !== concerts[checkDuplicatesIndex].artist.toLowerCase()) {
            alert(`${incomingArtistName} is already performing as part of ${concerts[checkDuplicatesIndex].title} on ${formattedDate(concerts[checkDuplicatesIndex].date)}`);
          }
          return;
        }

        var updatedArtistWishlist = artistWishlist;
        if (!updatedArtistWishlist.some(artistWishlistItem => artistWishlistItem.WishlistArtistId === incomingArtistId)) {
          updatedArtistWishlist.push({ WishlistArtistName: incomingArtistName, WishlistArtistId: incomingArtistId });
        }

        console.log(`updatedArtistWishlist: ${JSON.stringify(updatedArtistWishlist)}`);
        setArtistWishlist(updatedArtistWishlist);

        //add the new concerts
        //this list size might be concerning.....
        var concatenatedConcert = allConcerts.concat(incomingConcerts);
        setAllConcerts(concatenatedConcert);

        var emptyConcert = [];
        //clear the displayed concert, we will have to re-generate everything from scratch to maintain consistency (and by consistency I mean the order you pick artist should have no effect on how the route should be planned out)
        setConcerts(emptyConcert);
        //now.. are we rendering a route for multiple artist or just simply showing route of one single artist
        if (isTourMapChecked) {
          setConcerts(incomingConcerts);
        }
        else {
          GenerateOptimizedConcertRoute(concatenatedConcert, userLocation, artistWishlist, setArtistWishlist, setConcerts);
        }

        setOpen(false);
        closeDialog();

        //add the artist we just typed into the followed artist section, so next we don't have to type it next time
        //check for duplicates
        const hasElementWithValue = followedArtists.some(artist => artist.id === incomingArtistInfo.id);
        var updatedArtists = followedArtists;

        if (!hasElementWithValue) {
          updatedArtists.push(incomingArtistInfo);
        }

        setFollowedArtists(updatedArtists);

      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    FetchArtist(artistName, startDate, endDate).then((resJson) => {
      newArtistList(resJson);
      setIsLoading(false);
      setOpen(true);
    });
  };




  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    closeDialog();
  };

  const handleSwitchChange = () => {
    setIsTourMapChecked((prev) => !prev);
  };

  return (
    <Stack direction={'column'} width="100%" spacing={2}>
      <Card sx={{ backgroundColor: "#70afbf", height: '100%' }}>
        <CardHeader
          sx={{ backgroundColor: "#5e97a5", color: "white", p: 1 }}
          title="Who do you want to see?"
          titleTypographyProps={{ variant: 'subtitle1' }}>
        </CardHeader>
        <CardContent
          sx={{ p: 1 }}>
          <Stack sx={{ mb: 1 }} justifyContent="center" alignItems="center" direction={'row'} spacing={1}>
            <Typography variant="body2" color={"white"}>Tour map mode:</Typography>
            <Switch
              checked={isTourMapChecked}
              onChange={handleSwitchChange}
              inputProps={{ 'aria-label': 'Toggle Switch' }}
            />
          </Stack>
          <Stack
            direction={'column'}
            spacing={2}>
            {isLoading ? (<Stack direction={"column"} sx={{ flex: 1 }} alignItems="center"> <CircularProgress size={24} /> </Stack>) : (<form onSubmit={handleSubmit}>
              <Stack direction={'column'}
                spacing={2}
                container
                alignItems="center">
                <TextField
                  sx={{
                    "& input": {
                      color: "white",
                    },
                    "& label": {
                      color: "white",
                    },
                    width: { xs: '100%' }
                  }}
                  label="Enter Artist Name:"
                  InputLabelProps={{ shrink: true }}
                  placeholder="Taylor Swift"
                  value={artistName} onChange={(e) => {
                    setArtistName(e.target.value);
                    updateArtistNameInParent(e.target.value);
                  }}
                />
                <Button
                  disabled={(artistName.length === 0)}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Stack>
            </form>)}

          </Stack>
        </CardContent>
      </Card>
      <Dialog open={open || openDialogFromParent} onClose={handleClose}>
        <DialogTitle>{"Uhhh? Which one exactly?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            There are a few artists with similar names, please pick one.
          </DialogContentText>
          <List>
            {
              artistListFromParent && <ArtistChoiceList artists={artistListFromParent} onArtistClick={submitArtistInfo} />
            }
          </List>
          <DialogActions>
            <DismissButton onClick={handleClose} />
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Stack>
  );
});

export default BaseInput;
