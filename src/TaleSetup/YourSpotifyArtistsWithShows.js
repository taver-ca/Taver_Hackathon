import { useState, useEffect } from 'react';
import { Grid, Chip, CircularProgress, Card, CardContent, CardHeader } from '@mui/material';
import SwipeableTextMobileStepper from './ArtistsCarrousel'

function YourSpotifyArtistsWithShows({
  artistWishlist,
  tripSuggestions,
  artists,
  onArtistClick,
  onTripSuggestionClick,
  isArtistRequestTriggered,
  isSuggestionRequestTriggered,
  setActiveTab
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

  const handleTripSuggestionClick = (targetId) => {
    let trip = tripSuggestions.find(trip => trip.id === targetId);
    onTripSuggestionClick(trip);
    setActiveTab(2); //direct user to the schedule tab
  }

  const commaSeparatedfollowedArtists = artists.map((artist, index) => {
    return (
      <Grid item key={index}>
        <Chip sx={{ background: artistWishlist?.[artist.id] ? "gray" : "limegreen" }} label={artist.name} color="success" onClick={() => handleClick(artist)} />
      </Grid>
    );
  });
  const commaSeparatedTripSuggestions = tripSuggestions.map((tripSuggestion, index) => {
    const posterNameIsDefault = tripSuggestion.posterName.includes("Click to Reveal");
    return (
      <Grid sx={{ width: '100%', display: 'flex', flexWrap: 'wrap' }} item key={index}>
        <Chip sx={{ width: '100%', color: "white", backgroundColor: "teal" }} label={
          posterNameIsDefault
            ? `${tripSuggestion.posterName}`
            : `${tripSuggestion.posterName} (${new Date(tripSuggestion.gigs[0].date).toDateString()} - ${new Date(tripSuggestion.gigs[tripSuggestion.gigs.length - 1].date).toDateString()})`
        } onClick={() => handleTripSuggestionClick(tripSuggestion.id)} />
      </Grid>
    );
  });

  return (
    <Grid mt={1}>
      <Card sx={{ backgroundColor: "#70afbf" }}
        variant="elevation" elevation={3}>
        <CardHeader
          sx={{ backgroundColor: "#5e97a5", color: "white" }}
          title="Artists from your playlist">

        </CardHeader>
        <CardContent>
          {artists.length > 25 ? (<SwipeableTextMobileStepper groupedNames={groupedNames} handleArtistClick={handleClick} />) : (
            <Grid container spacing={1} direction="row" justifyContent="center">
              {commaSeparatedfollowedArtists}
            </Grid>)}
          {isArtistLoading && <CircularProgress sx={{ mt: 5 }} />}</CardContent>
      </Card>

      {(tripSuggestions.length > 0 || isSuggestionLoading) && <Card sx={{ backgroundColor: "#70afbf", mt: 2 }}
        variant="elevation" elevation={3}>
        <CardHeader
          sx={{ backgroundColor: "#5e97a5", color: "white" }}
          title="Trip Suggestions">
        </CardHeader>
        <CardContent>
          <Grid display={"flex"} container spacing={1} direction="row" justifyContent="center">
            {commaSeparatedTripSuggestions}
          </Grid>
          {isSuggestionLoading && <CircularProgress sx={{ mt: 5 }} />}
        </CardContent>
      </Card>}
    </Grid>
  );
}


export default YourSpotifyArtistsWithShows






