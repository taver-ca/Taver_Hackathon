import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { Stack, TextField, Button, Box, Card, CardHeader, CardContent } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import { GenerateTripTitle } from "../Odyssey/GenerateTripTitle";
import { GenerateOptimizedConcertRoute } from './GenerateOptimizedConcertRoute.js'

function formattedDate(incomingDate) {
  var date = new Date(incomingDate);
  return moment(date).format("YYYY/MM/DD hh:mm A");
}

class ConcertList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //pass concerts from maps into here
      allConcerts: this.props.allConcerts,
      concerts: this.props.concerts,
      userLocation: this.props.userLocation,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      shareId: this.props.shareId,
      posterNameSuggestions: this.props.posterNameSuggestions,
      setPosterNameSuggestions: this.props.setPosterNameSuggestions,
      setPosterName: this.props.setPosterName,
      setConcerts: this.props.setConcerts,
      setAllConcerts: this.props.setAllConcerts,
      setArtistWishlist: this.props.setArtistWishlist,
      posterName: this.props.posterName,
      artistWishlist: this.props.artistWishlist,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.concerts !== this.props.concerts) {
      this.setState({
        concerts: this.props.concerts,
      });
    }
  }

  // Display spotify token
  render() {
    const renderConcertList = this.state.concerts.map((concert, index) => {
      return (
        <ListItem
          sx={{ background: "#e2e900", borderRadius: 2, mb: 1, boxShadow: 2 }}
          key={index}
          disablePadding={{ xs: true, sm: false }}
          secondaryAction={<IconButton
            edge="end"
            onClick={() => {
              //alert(`You clicked the button! artist is ${concert.artist}`);
              //remove concerts of artist from local copy of concert list
              //console.log(`who we are deleting: ${concert.artist}`);
              var newConcerts = this.state.concerts;
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
              this.componentDidUpdate(filteredConcerts);
              //set the new concert list
              this.props.setConcerts(filteredConcerts);
              this.props.setAllConcerts((prev) =>
                prev.filter(
                  (concertInQuestion) =>
                    concertInQuestion.artist !== concert.artist
                )
              );
              console.log(
                `before removing artist: ${JSON.stringify(
                  this.props.artistWishlist
                )}`
              );
              var updatedArtistWishlist =
                this.props.artistWishlist.filter(
                  (artistWishlistItem) => {
                    return (
                      artistWishlistItem.WishlistArtistId !==
                      concert.artistId
                    );
                  }
                );
              //remove selected artist from wish list
              this.props.setArtistWishlist(updatedArtistWishlist);
              console.log(
                `trigger re-evaluation: ${JSON.stringify(
                  updatedArtistWishlist
                )}`
              );
              GenerateOptimizedConcertRoute(
                this.state.allConcerts,
                this.state.userLocation,
                updatedArtistWishlist,
                this.state.setArtistWishlist,
                this.state.setConcerts);
            }}
            aria-label="delete"
          >
            <DeleteIcon sx={{ color: "red" }} />
          </IconButton>}
        >
          <ListItemButton >
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
                      color="primary"
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
    const hasConcerts = this.state.concerts.length > 0;

    const onClearAllPress = () => {
      if (window.confirm("Are you sure you want to clear all your events?")) {
        this.props.setConcerts([])
        this.props.setArtistWishlist([])
      } else {
        return;
      }
    };
    return (
      <Box>
        <Card sx={{ backgroundColor: "#70afbf" }}
          variant="elevation" elevation={3}>
          {hasConcerts && (
            <CardHeader
              sx={{ backgroundColor: "#5e97a5", color: "white" }}
              title={`Upcoming Concerts ${this.state.concerts.length} / 5 :`}
              action={
                <Button onClick={onClearAllPress} variant="contained" color="warning">
                  Clear All
                </Button>
              }>
            </CardHeader>
          )}
          <CardContent>
            <Stack spacing={2} direction={'row'} >
              <TextField
                variant="standard"
                placeholder="Write a cool name for your trip here"
                InputProps={{ sx: { 'input': { textAlign: 'center', color: 'white' } } }}
                value={this.state.posterName}
                onChange={(e) => this.state.setPosterName(e.target.value)}
                sx={{ flex: 1 }} />
              <Button
                color="primary"
                onClick={GenerateTripTitle(
                  this.state.posterNameSuggestions,
                  this.state.concerts,
                  this.state.setPosterName,
                  this.state.setPosterNameSuggestions,
                  this.state.setIsLoading,
                  this.state.posterName)}
                disabled={(this.state.concerts.length === 0)}
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
}

export default ConcertList;
