import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import { Button } from "@mui/material";
function formattedDate(incomingDate) {
  var date = new Date(incomingDate);
  return moment(date).format("YYYY/MM/DD hh:mm A");
}

class ConcertList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //pass concerts from maps into here
      concerts: this.props.concerts,
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
        <ListItem key={index} disablePadding sx={{ width: "100%" }}>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar alt={`${concert.artist}`} src={`${concert.image.url}`} />
            </ListItemAvatar>
            <ListItemText
              primary={`${concert.title}`}
              secondary={
                <React.Fragment>
                  <Stack
                    direction="row"
                    justifyContent={"space-between"}
                    display={"flex"}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "column",
                        md: "row",
                        lg: "column",
                        xl: "column",
                      }}
                      item
                      spacing={1}
                    >
                      <Chip
                        color="primary"
                        label={`${concert.location.name}`}
                      />
                      <Chip
                        color="primary"
                        label={`${formattedDate(concert.date)}`}
                      />
                    </Stack>
                    <IconButton
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
                                artistWishlistItem.WishlistArtistId !=
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
                        this.props.triggerReEvaluation(updatedArtistWishlist);
                      }}
                      aria-label="delete"
                    >
                      <DeleteIcon sx={{ color: "red" }} />
                    </IconButton>
                  </Stack>
                </React.Fragment>
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
      <div>
        {hasConcerts && <p>Upcoming Concerts: </p>}
        {hasConcerts && (
          <Button onClick={onClearAllPress} variant="outlined" color="warning">
            Clear All
          </Button>
        )}
        <List
          sx={{
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "110%",
              xl: "110%",
            },
          }}
        >
          {renderConcertList}
        </List>
      </div>
    );
  }
}

export default ConcertList;
