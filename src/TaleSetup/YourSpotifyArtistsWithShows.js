import React, { useState, useEffect } from 'react';
import { Grid, Chip, Box, CircularProgress, Typography } from '@mui/material';
import SwipeableTextMobileStepper from './ArtistsCarrousel'

function YourSpotifyArtistsWithShows({ tripSuggestions, artists, onChildClick, isRequestTriggered }) {
  const [groupedNames, setGroupedNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!artists) return
    artists.sort((a, b) => a.name.localeCompare(b.name));
    const grouped = artists.reduce((acc, artist) => {
      const artistNameRaw = artist.name.toUpperCase();
      const firstLetter = artistNameRaw[0];

      acc[firstLetter] = acc[firstLetter] || [];
      acc[firstLetter].push(artist);

      return acc;
    }, {});
    setGroupedNames(grouped);
  }, [artists]);

  useEffect(() => {
    setIsLoading(isRequestTriggered);
  }, [isRequestTriggered])


  const handleClick = (artistName) => {
    onChildClick(artistName);
  };

  const commaSeparatedfollowedArtists = artists.map((artist, index) => {
    return (
      <Grid item key={index}>
        <Chip sx={{ background: "limegreen" }} label={artist.name} color="success" onClick={() => handleClick(artist)} />
      </Grid>
    );
  });
  const commaSeparatedTripSuggestions = tripSuggestions.map((tripSuggestion, index) => {
    return (
      <Grid item key={index}>
        <Chip sx={{ background: "teal" }} label={tripSuggestion.posterName} color="success" onClick={() => handleClick(tripSuggestion)} />
      </Grid>
    );
  });

  return (
    <Grid spacing={2}>
      <Typography>Artists from your playlist</Typography>

      {artists.length > 25 ? (<SwipeableTextMobileStepper groupedNames={groupedNames} handleArtistClick={handleClick} />) : (<Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Grid xs={10} md={10} container spacing={1} direction="row" justifyContent="center">
          {commaSeparatedfollowedArtists}
        </Grid>
      </Box>)}
      {isLoading && <CircularProgress sx={{ mt: 5 }} />}
    </Grid>
  );
}


export default YourSpotifyArtistsWithShows






