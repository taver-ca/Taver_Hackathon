import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button, Stack, FormControl, InputLabel, NativeSelect, Switch, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemAvatar, Avatar } from '@mui/material';
import moment from 'moment';
import DismissButton from "./DismissButton";
import ArtistChoiceList from "./ArtistChoiceList";
import { FetchArtist } from "./FetchArtist";

const mapStyles = [
  { mapId: "1fc21c527f198d4e", displayName: "Default Theme", buttonColorCss: "0070d2" },
  { mapId: "53a5c2c14f51f10b", displayName: "Dark Theme", buttonColorCss: "#404040" },
];

// Convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function formattedDate(incomingDate) {
  var date = new Date(incomingDate);
  return moment(date).format('YYYY/MM/DD');
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

const BaseInput = forwardRef(({ setConcerts, setUserLocation, setMapStyle, startDate, setAllConcerts, endDate, concerts, allConcerts, userLocation, updateArtistNameInParent, artistListFromParent, openDialogFromParent, closeDialog, newArtistList }, ref) => {

  useEffect(() => {
    function showPosition(position) {
      setUserLocation(position);
      console.log("home position: " + position.coords.latitude + "," + position.coords.longitude);
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
  }));

  const [artistName, setArtistName] = useState("Taylor Swift");
  const submitArtistInfo = async (incomingArtistInfo) => {
    console.log(incomingArtistInfo);
    let incomingArtistName = incomingArtistInfo.name;
    let incomingArtistId = incomingArtistInfo.id
    try {
      let res = await fetch(`${process.env.REACT_APP_BACKEND}/FindArtistWithShows/GetGigsById`, {
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

        var duplicateFound = false;
        var existingConcertTitles = concerts.map(concert => concert.title.toLowerCase());
        var incomingConcertTitles = incomingConcerts.map(concert => concert.title.toLowerCase());

        var checkDuplicatesIndex = existingConcertTitles.findIndex((concertTitle) => {
          return concertTitle.includes(incomingArtistName) || incomingConcertTitles.includes(concertTitle);
        });

        if (checkDuplicatesIndex !== -1) {
          if (incomingArtistName !== concerts[checkDuplicatesIndex].artist.toLowerCase()) {
            alert(`${incomingArtistName} is already performing as part of ${concerts[checkDuplicatesIndex].title} on ${formattedDate(concerts[checkDuplicatesIndex].date)}`);
          }
          duplicateFound = true;
        }

        if (!duplicateFound) {
          if (!isChecked) {
            incomingConcerts = incomingConcerts.reduce((uniqueConcerts, concert) => {
              const existingConcert = uniqueConcerts.find(c => c.artist === concert.artist);
              if (!existingConcert) {
                uniqueConcerts.push(concert);
              }
              return uniqueConcerts;
            }, []);
          }
          sortArtist(allConcerts.concat(incomingConcerts), userLocation);
        }
        setOpen(false);
        closeDialog();
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

  const sortArtist = (incomingAllConcerts, userLocation) => {
    console.log(`total Number Of Concerts Memorized after submitArtist: ${incomingAllConcerts.length}`);
    console.log(`sort all concerts`);


    //sort by date
    incomingAllConcerts = incomingAllConcerts.sort((a, b) => {
      return (new Date(a.date) - new Date(b.date));
    });

    //sort by distance to last point
    incomingAllConcerts = incomingAllConcerts.sort((a, b) => {
      console.log(`sort the entire concert list based on date and distance to home location of each concert...`);
      var originPoint;

      if (concerts.length > 0) {
        originPoint = {
          latitude: concerts[concerts.length - 1].location.latitude,
          longitude: concerts[concerts.length - 1].location.longitude,
        };
      }
      else {
        originPoint = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        };
      }
      // Calculate the distance between the points
      var distancea = distanceInKmBetweenEarthCoordinates(originPoint.latitude, originPoint.longitude, a.location.latitude, a.location.longitude);
      var distanceb = distanceInKmBetweenEarthCoordinates(originPoint.latitude, originPoint.longitude, b.location.latitude, b.location.longitude);
      return (distancea - distanceb);
    })

    if (!isChecked) {
      //filter part one concert
      console.log(`filter the sorted concert by artist name, so we're only left with one concert per artist`);
      incomingAllConcerts = incomingAllConcerts.filter((value, index, self) => {
        return self.findIndex(v => v.artist === value.artist || v.title === value.title) === index;
      });
    }


    //filter part all concert
    console.log(`filter the sorted concert by artist name`);
    var newConcerts = incomingAllConcerts

    // filter the concert list by
    // if artist name is included in titles of concerts performed by other artists 
    if (!isChecked) {
      if (concerts.length > 0) {
        newConcerts = newConcerts.filter((concert) => {

          var match = true;
          var matchindex = newConcerts.findIndex((findConcert) => {
            return findConcert.title.includes(concert.artist) && (findConcert.artist !== concert.artist);
          })

          if (matchindex !== -1) {
            alert(`${concert.artist} is performing as part of ${newConcerts[matchindex].title} by ${newConcerts[matchindex].artist}, consolidating schedule`);
            match = false;
          }

          return match;

        });
      }
    }
    
    newConcerts = newConcerts.sort((a, b) => { return (new Date(a.date) - new Date(b.date)) });
    console.log(`concat the new concerts into the optimized list`);
    setConcerts(newConcerts);
    setAllConcerts(newConcerts);
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
