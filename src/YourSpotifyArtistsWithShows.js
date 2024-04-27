import React, {useState, useEffect} from 'react';
import { Grid } from '@mui/material';
import SwipeableTextMobileStepper from './ArtistsCarrousel'
import {response} from "./object"

function YourSpotifyArtistsWithShows({ artists, onChildClick}) {
    const [groupedNames, setGroupedNames] = useState({});
    artists = response
    useEffect(() => {
      if (!artists) return
      artists.sort((a, b) => a.name.localeCompare(b.name));
      const grouped = artists.reduce((acc, artist) => {
        const firstLetter = artist.name[0];
      
        acc[firstLetter] = acc[firstLetter] || [];
        acc[firstLetter].push(artist);
      
        return acc;
      }, {});
      console.log(grouped);
      setGroupedNames(grouped);
    }, [artists]);

    const handleClick = (artistName) => {
        onChildClick(artistName); 
      };

    return (
        <Grid>
          <p>Artists from your playlist</p>
          {!!artists && <SwipeableTextMobileStepper groupedNames={groupedNames} handleArtistClick={handleClick} />}
        </Grid>
    );
}


export default YourSpotifyArtistsWithShows






