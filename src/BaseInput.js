import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button, Stack, FormControl, InputLabel, NativeSelect, Switch, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List } from '@mui/material';
import moment from 'moment';
import DismissButton from "./DismissButton";
import ArtistChoiceList from "./ArtistChoiceList";
import { FetchArtist } from "./FetchArtist";
import { json } from "react-router-dom";

const mapStyles = [
  { mapId: "1fc21c527f198d4e", displayName: "Default Theme", buttonColorCss: "0070d2" },
  { mapId: "53a5c2c14f51f10b", displayName: "Dark Theme", buttonColorCss: "#404040" },
];

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



function generateCombinations(dictionary) {
  const keys = Object.keys(dictionary);
  const result = [];

  function backtrack(combination, index) {
    if (index === keys.length) {
      const dates = combination.map(concert=>concert.date); 
      const sortedDates = [...dates].sort();
      if(JSON.stringify(dates)===(JSON.stringify(sortedDates)))
      {
        result.push([...combination]);
      }
      return;
    }

    const key = keys[index];
    const values = dictionary[key];

    for (const value of values) {
      combination.push(value);
      backtrack(combination, index + 1);
      combination.pop();
    }
  }

  backtrack([], 0);
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

const BaseInput = forwardRef(({ setConcerts,
  setUserLocation,
  setMapStyle,
  startDate,
  setAllConcerts,
  endDate,
  concerts,
  allConcerts,
  userLocation,
  updateArtistNameInParent,
  artistListFromParent,
  openDialogFromParent,
  closeDialog,
  newArtistList,
  followedArtists,
  setFollowedArtists,
  artistWishlist,
  setArtistWishlist
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
    handleRequestFromParent: (artist) => {
      submitArtistInfo(artist);
    },
    handleReEvaluation: (updatedArtistWishlist) => {
      console.log(`trigger re-evaluation: ${JSON.stringify(updatedArtistWishlist)}`);
      generateOptimizedConcertRoute(allConcerts, userLocation, updatedArtistWishlist);
    },
  }));

  const [artistName, setArtistName] = useState("Taylor Swift");
  const submitArtistInfo = async (incomingArtistInfo) => {
    console.log(incomingArtistInfo);
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
        if (isChecked) {
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
    FetchArtist(artistName).then((resJson) => {
      // setArtistList(resJson);
      newArtistList(resJson);
      setOpen(true);
    });
    //submitArtist(artistName);
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
      alert(`Unable to schedule a plan for the artists you want to see, their schedules conflict with each other, removing the last artist you added since it was causing problems`);
      //remove the last attempted artist that was causing problem and run the optimization again
      generateOptimizedConcertRoute(allConcerts, userLocation, artistWishlist.slice(-1));
    }

    //now sort the remaining by max distance traveled
    allCombinationOfConcerts = allCombinationOfConcerts.sort((a, b) => {
      return getTotalDistance(a, userLocation) - getTotalDistance(b, userLocation);
    });

    //pick the route with the shortest distance
    // this need to be a list
    console.log(`allCombinationOfConcerts[0]: ${JSON.stringify(allCombinationOfConcerts[0])}`);

    var optimizedConcerts = allCombinationOfConcerts[0];

    setConcerts(optimizedConcerts);

  }

  const [isChecked, setIsChecked] = useState(false);
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    closeDialog();
  };

  const handleSwitchChange = () => {
    setIsChecked((prev) => !prev);
  };

  return (

    <Stack direction={'column'} spacing={2}>
      Display all concerts of a single artist:
      <Switch
        checked={isChecked}
        onChange={handleSwitchChange}
        inputProps={{ 'aria-label': 'Toggle Switch' }}
      />

      <Stack direction={'column'} spacing={2}>
        <form onSubmit={handleSubmit}>
          <Stack direction={'column'} spacing={2}>
            <TextField
              sx={{
                "& input": {
                  color: "white",
                },
                "& label": {
                  color: "white",
                },
              }}
              label="Enter Artist Name:"
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


      <Dialog open={open || openDialogFromParent} onClose={handleClose}>
        <DialogTitle>{"Uhhh? Which one exactly?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            There are a few artists with similar names, please pick one.
          </DialogContentText>
          <List>
            {artistListFromParent && <ArtistChoiceList artists={artistListFromParent} onArtistClick={submitArtistInfo} />
            }
          </List>
          <DialogActions>
            <DismissButton onClick={handleClose} />
          </DialogActions>
        </DialogContent>
      </Dialog>

      <FormControl fullWidth>
        <InputLabel
          sx={{
            color: 'white'
          }}
          variant="standard" htmlFor="mapStyle">
          Map Style:
        </InputLabel>
        <NativeSelect
          sx={{
            color: 'white',
            "& input": {
              color: "white",
            },
            "& label": {
              color: "white",
            },
            "& svg": {
              color: "white",
            }
          }}
          defaultValue={mapStyles[0]}
          id="mapStyle"
          onChange={(event) => setMapStyle(event.target.value)}>
          {mapStyles.map((mapStyle) => (
            <option style={{ backgroundColor: 'darkgrey' }} key={mapStyle.mapId} value={mapStyle.mapId}>
              {mapStyle.displayName}
            </option >
          ))}
        </NativeSelect>
      </FormControl>
    </Stack>
  );
});

export default BaseInput;
