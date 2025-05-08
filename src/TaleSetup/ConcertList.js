import * as React from "react";
import { useState } from "react";
import moment from "moment";
import { List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Chip, Stack, TextField, Button, Box, Card, CardHeader, CardContent, CircularProgress, IconButton } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { GenerateTripTitle } from "../Odyssey/GenerateTripTitle.js";
import { GenerateOptimizedConcertRoute } from "./GenerateOptimizedConcertRoute.js";

function formattedDate(incomingDate) {
  var date = new Date(incomingDate);
  return moment(date).format("YYYY/MM/DD hh:mm A");
}

const ConcertList = ({ allConcerts,
  concerts,
  userLocation,
  startDate,
  endDate,
  shareId,
  posterNameSuggestions,
  setPosterNameSuggestions,
  setPosterName,
  setConcerts,
  setAllConcerts,
  setArtistWishlist,
  posterName,
  artistWishlist,
  showActiveConcert }) => {

  const [isLoading, setIsLoading] = useState(false);
  const renderConcertList = concerts.map((concert, index) => {
    return (
      <ListItem
        sx={{ background: "#e2e900", borderRadius: 2, mb: 1, boxShadow: 2, disablePadding: { xs: true, sm: false } }}
        key={index}
        secondaryAction=
        {
          <IconButton
            edge="end"
            onClick={() => {
              //alert(`You clicked the button! artist is ${concert.artist}`);
              //remove concerts of artist from local copy of concert list
              //console.log(`who we are deleting: ${concert.artist}`);
              var newConcerts = concerts;
              //console.log(`concerts length before operation: ${newConcerts.length}`);
              var filteredConcerts = newConcerts.filter(
                (concertInQuestion) => {
                  console.log(
                    `${concertInQuestion.artist} vs ${concert.artist}`
                  );
                  return concertInQuestion.artist !== concert.artist;
                }
              );
              //console.log(`concerts length after operation: ${filteredConcerts.length}`);
              //set the new concert list
              setConcerts(filteredConcerts);
              setAllConcerts((prev) =>
                prev.filter(
                  (concertInQuestion) =>
                    concertInQuestion.artist !== concert.artist
                )
              );
              console.log(
                `before removing artist: ${JSON.stringify(
                  artistWishlist
                )}`
              );
              var updatedArtistWishlist =
                artistWishlist.filter(
                  (artistWishlistItem) => {
                    return (
                      artistWishlistItem.WishlistArtistId !==
                      concert.artistId
                    );
                  }
                );
              //remove selected artist from wish list
              setArtistWishlist(updatedArtistWishlist);
              console.log(
                `trigger re-evaluation: ${JSON.stringify(
                  updatedArtistWishlist
                )}`
              );
              GenerateOptimizedConcertRoute(
                allConcerts,
                userLocation,
                updatedArtistWishlist,
                setArtistWishlist,
                setConcerts);
            }}
            aria-label="delete"
          >
            <DeleteIcon sx={{ color: "red" }} />
          </IconButton>
        }
      >
        <ListItemButton onClick={() => showActiveConcert(index)} >
          <ListItemAvatar>
            <Avatar alt={`${concert.artist}`} src={`${concert.image.url}`} />
          </ListItemAvatar>
          <ListItemText
            sx={{ color: "black" }}
            primary={`${concert.title}`}
            secondary={
              <Stack
                direction="row"
                justifyContent={"space-between"}
                display={"flex"}
              >
                <Stack
                  width={'100%'}
                  direction="column"
                  spacing={1}
                >
                  <Chip
                    sx={{ background: '#7fc9dc' }}
                    label={`${concert.location.name}`}
                  />
                  <Chip
                    color="secondary"
                    label={`${formattedDate(concert.date)}`}
                  />
                </Stack>

              </Stack>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  });
  const hasConcerts = concerts.length > 0;

  const onClearAllPress = () => {
    if (window.confirm("Are you sure you want to clear all your events?")) {
      setConcerts([])
      setArtistWishlist([])
    } else {
      return;
    }
  };
  return (
    <Box
      sx={{
        maxHeight: { xs: '100vh', sm: '100vh', md: '75vh', lg: '70vh', xl: '70vh' },
        overflow: 'scroll',
        '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome, Safari, and Opera
        '-ms-overflow-style': 'none', // Hide scrollbar for IE and Edge
        'scrollbar-width': 'none', // Hide scrollbar for Firefox
      }}
    >
      <Card sx={{ backgroundColor: "#70afbf" }}
        variant="elevation" elevation={3}>
        {hasConcerts && (
          <CardHeader
            sx={{ backgroundColor: "#5e97a5", color: "white" }}
            title={`Upcoming Concerts ${concerts.length} / 5 :`}
            action={
              <Button onClick={onClearAllPress} variant="contained" color="warning">
                Clear All
              </Button>
            }>
          </CardHeader>
        )}
        <CardContent>
          <Stack spacing={2} direction={'row'} >
            {isLoading ? <Stack direction={"column"} sx={{ flex: 1 }} alignItems="center"> <CircularProgress size={24} /> </Stack> :
              <TextField
                variant="standard"
                placeholder="Write a cool name for your trip here"
                InputProps={{ sx: { 'input': { textAlign: 'center', color: 'white' } } }}
                value={posterName}
                onChange={(e) => setPosterName(e.target.value)}
                sx={{ flex: 1 }} />}
            <Button
              color="primary"
              onClick={
                async () => {
                  await GenerateTripTitle(
                    posterNameSuggestions,
                    concerts,
                    setPosterName,
                    setPosterNameSuggestions,
                    setIsLoading);
                }}
              disabled={(concerts.length === 0)}
              justifyContent="flex-end"
              variant="contained">
              Generate
            </Button>
          </Stack>
          <List
            sx={{
              width: "100%",
            }}
          >
            {renderConcertList}
          </List>
        </CardContent>

      </Card>
    </Box>)
}


export default ConcertList;
