import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button } from '@mui/material';

const mapStyles = [
  { mapId: "1fc21c527f198d4e", displayName: "Default Theme", buttonColorCss: "0070d2" },
  { mapId: "53a5c2c14f51f10b", displayName: "Dark Theme", buttonColorCss: "#404040" },
];


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

      let resJson = await res.json();
      if (res.status === 200) {

        if (resJson.length < 1) {
          return;
        }
        console.log(`resJson: ${resJson}`);
        console.log(`add incoming concerts into allconcerts`);
        console.log(`total Number Of Concerts Memorized: ${allConcerts.length}`);
        setAllConcerts((prev) => prev.concat(resJson), sortArtist(allConcerts.concat(resJson), userLocation));
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    await submitArtist(artistName);
  };

  const sortArtist = (incomingAllConcerts , userLocation)=>{
    console.log(`total Number Of Concerts Memorized after submitArtist: ${incomingAllConcerts.length}`);
    console.log(`sort all concerts`);
        var sortedAllConcerts = incomingAllConcerts.sort((a, b) => {
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
          console.log(`Calculate the distance between the points`);
          var distancea = distanceInKmBetweenEarthCoordinates(originPoint.latitude, originPoint.longitude, a.location.latitude, a.location.longitude);
          var distanceb = distanceInKmBetweenEarthCoordinates(originPoint.latitude, originPoint.longitude, b.location.latitude, b.location.longitude);
          console.log(`distancea: ${distancea}`);
          console.log(`distanceb: ${distanceb}`);
          return (new Date(a.date) - new Date(b.date)) && (distancea - distanceb);
        });

        console.log(`filter the sorted concert by artist name, so we're only left with one concert per artist`);
        var newConcerts = sortedAllConcerts.filter((value, index, self) => {
          return self.findIndex(v => v.artist === value.artist) === index;
        })
        newConcerts = newConcerts.sort((a, b)=>{return (new Date(a.date) - new Date(b.date))});
        console.log(`concat the new concerts into the optimized`);
        setConcerts(newConcerts);
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
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
        <p />
        <Button
          sx={{
            cursor: 'pointer',
          }}
          type="submit"
          variant="contained"
          color="primary">
          Submit
        </Button>
      </form>
      <div>
        Map Style:{" "}
        <select name="mapStyle" id="mapStyle" onChange={(event) => setMapStyle(event.target.value)}>
          {mapStyles.map((mapStyle) => (
            <option key={mapStyle.mapId} value={mapStyle.mapId}>
              {mapStyle.displayName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default BaseInput;
