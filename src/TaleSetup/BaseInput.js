import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button, Stack, Switch, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, Typography, Card, CardContent,CardHeader } from '@mui/material';
import DismissButton from "./DismissButton";
import ArtistChoiceList from "./ArtistChoiceList";
import { FetchArtist } from "./FetchArtist";
import moment from "moment";




function getTotalDistance(concerts, userLocation) {

  if (concerts.length <= 0) {
    return 0;
  }

  let totalDistance = 0;

  //consider distance between userlocation and the first location of the concert
  var originPoint = {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
  };
  //console.log(`concert: ${JSON.stringify(concerts[0])}`);

  var firstPoint = { latitude: concerts[0].location.latitude, longitude: concerts[0].location.longitude };


  totalDistance += distanceInKmBetweenEarthCoordinates(originPoint.latitude, originPoint.longitude, firstPoint.latitude, firstPoint.longitude);

  for (let i = 2; i < concerts.length; i++) {
    const prevPoint = { latitude: concerts[i - 1].location.latitude, longitude: concerts[i - 1].location.longitude };
    const currPoint = { latitude: concerts[i].location.latitude, longitude: concerts[i].location.longitude };

    totalDistance += distanceInKmBetweenEarthCoordinates(
      prevPoint.latitude, prevPoint.longitude,
      currPoint.latitude, currPoint.longitude
    );
  }
  return totalDistance;
}

function formattedDate(incomingDate) {
  var date = new Date(incomingDate);
  return moment(date).format('YYYY/MM/DD');
}


function generateCombinations(dictionary) {
  const keys = Object.keys(dictionary);
  const result = [];

  function backtrack(combination, index, lastDate, lastLocation, lastTitle) {
    if (index === keys.length) {
      result.push([...combination]);
      return;
    }

    const key = keys[index];
    const values = dictionary[key];

    for (const value of values) {
      const concertDate = new Date(value.date);
      if (concertDate >= lastDate && (concertDate !== lastDate || (value.location.name === lastLocation.name && value.location.address === lastLocation.address && value.title === lastTitle))) {
        combination.push(value);
        backtrack(combination, index + 1, concertDate, value.location, value.title);
        combination.pop();
      }
    }
  }

  backtrack([], 0, new Date(0), { name: null, address: null }, null);
  return result;
}


// Convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Calculate the distance in kilometers between two coordinates
function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

const BaseInput = forwardRef(({
  setIsTourMapChecked,
  setConcerts,
  setUserLocation,
  setFollowedArtists,
  setAllConcerts,
  setArtistWishlist,
  setPosterName,
  startDate,
  isTourMapChecked,
  endDate,
  allConcerts,
  concerts,
  userLocation,
  updateArtistNameInParent,
  artistListFromParent,
  openDialogFromParent,
  closeDialog,
  closeRouteDialog,
  newArtistList,
  followedArtists,
  artistWishlist,
  setActiveTab,
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
    },
    handleReEvaluation: (updatedArtistWishlist) => {
      generateOptimizedConcertRoute(allConcerts, userLocation, updatedArtistWishlist);
    },
  }));

  const [artistName, setArtistName] = useState("");

  const pickRoute = (concerts) => {
    // clear existing concerts and followed artist
    setConcerts([]);
    setArtistWishlist([]);
    //update artist wishlist to include the artist from the concerts
    const artistInfoList = concerts.map(concert => {
      return { WishlistArtistName: concert.artist, WishlistArtistId: concert.artistId }
    });

    setPosterName(concerts.posterName);
    setConcerts(concerts);
    setArtistWishlist(artistInfoList);
    closeRouteDialog();
  }

  const submitArtistInfo = async (incomingArtistInfo) => {
    setActiveTab(1); // Switch to the second tab in the TaleSetup component 
    if (artistWishlist.length >= 5) {
      alert(`You can have only 5 artists at a time.`)
      return
    }
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
          generateOptimizedConcertRoute(concatenatedConcert, userLocation, artistWishlist);
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
    FetchArtist(artistName, startDate, endDate).then((resJson) => {
      newArtistList(resJson);
      setOpen(true);
    });
  };

  const generateOptimizedConcertRoute = (allConcerts, userLocation, artistWishlist) => {
    //generate an optimized route based on existing concerts saved and the artist wishlist, with consideration to user current location
    //console.log(`generate optimized concert route for the current selected artist`);
    //console.log(JSON.stringify(artistWishlist));
    //filter out concerts that are not performed by the artists from the artist wish list
    //allow concert with duplicate id at this stage, inform user of the dupcliate at the end
    var initialFilteredConcerts = allConcerts.filter((concert) => {
      return artistWishlist.some(artistWishlistItem => artistWishlistItem.WishlistArtistId === concert.artistId)
    });
    //group the concerts by artistId
    var groupedByArtistConcertList = initialFilteredConcerts.reduce((r, a) => {
      r[a.artistId] = r[a.artistId] || [];
      r[a.artistId].push(a);
      return r;
    }, Object.create(null));

    //this should be a dictionary
    //console.log(`groupedbyartistconcertlist: ${JSON.stringify(groupedByArtistConcertList)}`);

    // figure out all the possible combination of the shows 
    // thanks stackoverflow, I'm not writing up this shit.
    // https://stackoverflow.com/questions/4331092/finding-all-combinations-cartesian-product-of-javascript-array-values
    // this needs to be a list of list
    var allCombinationOfConcerts = generateCombinations(groupedByArtistConcertList);

    if (allCombinationOfConcerts.length < 1) {
      alert(`Unable to schedule a plan for the artists you want to see, their schedules conflict with each other`);
      //remove the last attempted artist that was causing problem and run the optimization again
      setArtistWishlist(artistWishlist.slice(0, -1));
      generateOptimizedConcertRoute(allConcerts, userLocation, artistWishlist.slice(0, -1));
    }

    //now sort the remaining by max distance traveled
    allCombinationOfConcerts = allCombinationOfConcerts.sort((a, b) => {
      return getTotalDistance(a, userLocation) - getTotalDistance(b, userLocation);
    });

    //pick the route with the shortest distance
    // this need to be a list
    console.log(`allCombinationOfConcerts[0]: ${JSON.stringify(allCombinationOfConcerts[0])}`);

    if (allCombinationOfConcerts.length > 1) {
      var optimizedConcerts = allCombinationOfConcerts[0];
      setConcerts(optimizedConcerts);
    }
  }


  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    closeDialog();
  };

  const handleSwitchChange = () => {
    setIsTourMapChecked((prev) => !prev);
  };

  return (

    <Stack direction={'column'} spacing={2}>
      <Card sx={{ backgroundColor: "#70afbf" }}>
        <CardHeader
          sx={{ backgroundColor: "#5e97a5", color: "white" }}
          title="Who do you want to see?">
        </CardHeader>
        <CardContent>
        <Stack justifyContent="center" direction={'row'} spacing={2}>
          <Typography color={"white"}>Tour map mode:</Typography>
          <Switch
            checked={isTourMapChecked}
            onChange={handleSwitchChange}
            inputProps={{ 'aria-label': 'Toggle Switch' }}
          />
        </Stack>
          <Stack
            direction={'column'}
            spacing={2}>
            <form onSubmit={handleSubmit}>
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
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Stack>
            </form>
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
