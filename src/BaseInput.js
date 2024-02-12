import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button, Stack, FormControl, InputLabel, NativeSelect } from '@mui/material';
import moment from 'moment';

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

const BaseInput = forwardRef(({ setConcerts, setUserLocation, setMapStyle, startDate, setAllConcerts, endDate, concerts, allConcerts, userLocation }, ref) => {

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
    handleRequestFromParent: (artistName) => {
      submitArtist(artistName);
    },
  }));

  const [artistName, setArtistName] = useState("Taylor Swift");



  const submitArtist = async (incomingArtistName) => {
    incomingArtistName = incomingArtistName.toLowerCase();
    try {
      let res = await fetch(`${process.env.REACT_APP_BACKEND}/concerts`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          artistName: incomingArtistName,
          startDate: startDate,
          endDate: endDate
        }),
      });

      let incomingConcerts = await res.json();
      if (res.status === 200) {

        if (incomingConcerts.length < 1) {
          alert(`no upcoming concerts for ${incomingArtistName} found`);
          return;
        }
        console.log(`incoming concerts: ${incomingConcerts.length}`);
        //console.log(`add incoming concerts into allconcerts`);
        //console.log(`total Number Of Concerts Memorized: ${allConcerts.length}`);
        //avoid adding the same concert.. check the title of the concert
        var incomingConcertTitles = incomingConcerts.map(concert => concert.title);

        var found = concerts.some((concert) => {

          var concertFound = incomingConcertTitles.includes(concert.title);
          var artistFound = false;
          var artistFoundConcert = concerts.find((concert) => {
            return concert.title.includes(concert.artist);
          });

          if (concertFound) {
            if (incomingArtistName !== concert.artist.toLowerCase()) {
              alert(`${concert.artist} is already performing as part of ${concert.title} on ${formattedDate(concert.date)}`);
            }
          }
          if (artistFoundConcert) {
            if (incomingArtistName !== artistFoundConcert.artist.toLowerCase()) {
              alert(`${incomingArtistName} is already performing as part of ${artistFoundConcert.title} on ${formattedDate(artistFoundConcert.date)}`);
            }
            artistFound = true;
          }
          return concertFound || artistFound;

        });

        if (!found) {
          setAllConcerts((prev) => prev.concat(incomingConcerts));
          sortArtist(allConcerts.concat(incomingConcerts), userLocation);
        }

      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    submitArtist(artistName);
  };

  const sortArtist = (incomingAllConcerts, userLocation) => {
    console.log(`total Number Of Concerts Memorized after submitArtist: ${incomingAllConcerts.length}`);
    console.log(`sort all concerts`);

    incomingAllConcerts = incomingAllConcerts.sort((a, b) => {
      return (new Date(a.date) - new Date(b.date));
    });
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

    console.log(`filter the sorted concert by artist name, so we're only left with one concert per artist`);
    var newConcerts = incomingAllConcerts.filter((value, index, self) => {
      return self.findIndex(v => v.artist === value.artist || v.title == value.title) === index;
    });

    var concertTitles = newConcerts.map(concert => concert.title);
    newConcerts = newConcerts.filter((concert) => {

      var match = false;

      concertTitles.forEach((concertTitle) => {
        if (concertTitle.toLowerCase().includes(concert.artist.toLowerCase())) {
          match = true;
        }
      });

      return match;

    });



    newConcerts = newConcerts.sort((a, b) => { return (new Date(a.date) - new Date(b.date)) });
    console.log(`concat the new concerts into the optimized list`);
    setConcerts(newConcerts);
  }
  return (
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
            value={artistName} onChange={(e) => setArtistName(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary">
            Submit
          </Button>
        </Stack>

      </form>

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
            color: 'white'
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
