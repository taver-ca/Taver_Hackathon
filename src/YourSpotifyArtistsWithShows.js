import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress } from '@mui/material';
import SwipeableTextMobileStepper from './ArtistsCarrousel'

function YourSpotifyArtistsWithShows({ artists, onChildClick, isRequestTriggered }) {
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
  
  useEffect(()=>{
    setIsLoading(isRequestTriggered);
  }, [isRequestTriggered])


  const handleClick = (artistName) => {
    onChildClick(artistName);
  };

  return (
    <Grid>
      <p>Artists from your playlist</p>
      {!!artists && <SwipeableTextMobileStepper groupedNames={groupedNames} handleArtistClick={handleClick} />}
      {isLoading && <CircularProgress />}
    </Grid>
  );
}


export default YourSpotifyArtistsWithShows






