import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import * as React from 'react';
import { TextField, Button } from '@mui/material';

const mapStyles = [
  { mapId: "1fc21c527f198d4e", displayName: "Default Theme", buttonColorCss: "0070d2" },
  { mapId: "53a5c2c14f51f10b", displayName: "Dark Theme", buttonColorCss: "#404040" },
];




const BaseInput = forwardRef(({ setConcerts, setUserLocation, setMapStyle, startDate, endDate }, ref) => {

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
        
        resJson = resJson.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

        let result = [];
        result.push(resJson[0]);
        setConcerts((prev) => prev.concat(result));
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
