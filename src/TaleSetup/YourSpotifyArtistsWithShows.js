import React, { useState, useEffect } from 'react';
import { Grid, Chip, Box, CircularProgress, Typography } from '@mui/material';
import SwipeableTextMobileStepper from './ArtistsCarrousel'

function YourSpotifyArtistsWithShows({
  artistWishlist,
  tripSuggestions,
  artists,
  onArtistClick,
  onTripSuggestionClick,
  isArtistRequestTriggered,
  isSuggestionRequestTriggered
}) {
  const [groupedNames, setGroupedNames] = useState({});
  const [isArtistLoading, setIsArtistLoading] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
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
    setIsArtistLoading(isArtistRequestTriggered);
  }, [isArtistRequestTriggered]);

  useEffect(() => {
    setIsSuggestionLoading(isSuggestionRequestTriggered);
  }, [isSuggestionRequestTriggered]);

  const handleClick = (artistName) => {
    onArtistClick(artistName);
  };

  const handleTripSuggestionClick = (tripSuggestion) => {
    onTripSuggestionClick(tripSuggestion);
  }

  const commaSeparatedfollowedArtists = artists.map((artist, index) => {
    return (
      <Grid item key={index}>
        <Chip sx={{ background: artistWishlist?.[artist.id] ? "gray" : "limegreen" }} label={artist.name} color="success" onClick={() => handleClick(artist)} />
      </Grid>
    );
  });
  const commaSeparatedTripSuggestions = tripSuggestions.map((tripSuggestion, index) => {
    return (
      <Grid item key={index}>
        <Chip sx={{ background: "teal" }} label={tripSuggestion.posterName} color="primary" onClick={() => handleTripSuggestionClick(tripSuggestion)} />
      </Grid>
    );
  });

  return (
    <Grid spacing={2} >
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography>Artists from your playlist</Typography>
      </Box>
      {artists.length > 25 ? (<SwipeableTextMobileStepper groupedNames={groupedNames} handleArtistClick={handleClick} />) : (<Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Grid xs={10} md={10} container spacing={1} direction="row" justifyContent="center">
          {commaSeparatedfollowedArtists}
        </Grid>
      </Box>)}
      {isArtistLoading && <CircularProgress sx={{ mt: 5 }} />}

      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography>Trip Suggestions</Typography>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center">
        <Grid xs={10} md={10} container spacing={1} direction="row" justifyContent="center">
          {commaSeparatedTripSuggestions}
        </Grid>
      </Box>
      {isSuggestionLoading && <CircularProgress sx={{ mt: 5 }} />}
    </Grid>
  );
}


export default YourSpotifyArtistsWithShows






