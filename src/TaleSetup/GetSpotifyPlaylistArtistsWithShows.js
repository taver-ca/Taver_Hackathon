import DismissButton from "./../TaleSetup/DismissButton.js";
import RouteChoiceList from './RouteChoiceList.js';
import Carousel from 'react-material-ui-carousel';
import { useState, useEffect } from 'react';
import { Stack, Button, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, List, Card, CardHeader, CardContent, Typography } from '@mui/material';
import { ClusterArtists } from './ClusterArtists.js';
import { QuestionMark as QuestionMark } from "@mui/icons-material";


function GetSpotifyPlaylistArtistsWithShows({
    setFollowedArtists,
    setIsArtistRequestTriggered,
    setIsSuggestionRequestTriggered,
    setAllConcerts,
    setTripSuggestions,
    setRoute,
    setActiveTab,
    setPosterName,
    setUserLocation,
    allConcerts,
    followedArtists,
    startDate,
    endDate,
    openRouteDialogFromParent,
    closeRouteDialog,
    userLocation }
) {

    const [spotifyPlayList, setSpotifyPlaylist] = useState("");
    const [calculatedRoutes, setCalculatedRoutes] = useState([]);
    const [openRouteDialog, setOpenRouteDialog] = useState(false);
    const [openShareInstructionDialog, setOpenShareInstructionDialog] = useState(false);
    // Time threshold (in milliseconds)
    const [timeThreshold, setTimeThreshold] = useState(4 * 60 * 60 * 1000);
    // Distance threshold (in degrees, you can adjust this)
    const distanceThreshold = 4;


    const handleClose = () => {
        setOpenRouteDialog(false);
        closeRouteDialog();
    };

    useEffect(() => {
        console.log("opening route dialog");
        if (calculatedRoutes && calculatedRoutes.length > 0) {
            setOpenRouteDialog(true);
        }
    }, [calculatedRoutes]);


    useEffect(() => {
        if (spotifyPlayList && spotifyPlayList !== "") {
            handlePlaylistSubmit();
        }
    }, [spotifyPlayList]);

    let handlePlaylistSubmit = async () => {

        if (!userLocation) {
            alert("we will need your location to find concerts closest to you, please give location permission");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => { setUserLocation(position); }, (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        alert("You can't look for concerts without providing your location, please enable location services in your browser");
                        return;
                    }
                });
            }
        }


        const url = spotifyPlayList;
        const urlValidate = new RegExp("^https://open\\.spotify\\.com/playlist/[a-zA-Z0-9]{22}(\\?si=.*)?$");
        if (!urlValidate.test(spotifyPlayList)) {
            alert("Please enter a valid Spotify playlist URL.");
            return;
        }

        if (startDate === endDate) {
            alert("Your trip start date and end date is on the same day, spread them out");
            return;
        }
        const startIndex = url.lastIndexOf("/") + 1;
        const endIndex = url.indexOf("?") !== -1 ? url.indexOf("?") : url.length;

        const extractedPlaylistId = url.substring(startIndex, endIndex);
        setIsArtistRequestTriggered(true);
        setActiveTab(1); // Switch to the second tab in the TaleSetup component 
        await fetch(`${process.env.REACT_APP_BACKEND}/GetSpotifyPlaylistArtistsWithGigs`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                playlistId: extractedPlaylistId,
                startDate: startDate,
                endDate: endDate
            }),
        }).then(async (res) => {
            console.log(`response status code: ${res.status}`);
            if (res.status === 200) {
                ClusterArtists(res, followedArtists, allConcerts, timeThreshold, distanceThreshold, userLocation, setPosterName, setFollowedArtists, setAllConcerts, setIsArtistRequestTriggered, setIsSuggestionRequestTriggered, setTripSuggestions, setCalculatedRoutes);
            }
            return;
        }).catch((err) => {
            console.log("Some error occured");
            console.log(err);
        });
    };

    return (
        <Stack container spacing={3} sx={{ flexDirection: 'column', paddingTop: 0 }}>
            <Card sx={{ backgroundColor: "#70afbf", mt: 1 }} variant="elevation" elevation={3}>
                <CardHeader sx={{ backgroundColor: "#5e97a5", color: "white" }} title="See who's on tour from your playlist" />
                <CardContent sx={{ backgroundColor: "#70afbf", color: "white" }}>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!spotifyPlayList) {
                            const text = await navigator.clipboard.readText();
                            setSpotifyPlaylist(text);
                        }
                    }}>
                        <Stack
                            direction={'row'}
                            spacing={2}
                            alignItems="center"
                            justifyContent={'center'}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary">
                                Share your Spotify playlist link
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
                                sx={{ minWidth: 0, padding: '6px', borderRadius: '50%', alignSelf: 'flex-end' }}
                                onClick={() => { setOpenShareInstructionDialog(true); }}>
                                <QuestionMark />
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
            <Dialog open={openShareInstructionDialog} width="100%">
                <DialogTitle>
                    <Typography variant="subtitle">How to get a Spotify playlist link</Typography>
                </DialogTitle>
                <DialogContent>
                    <Carousel
                        autoPlay={false}
                        navButtonsAlwaysVisible={true}
                        indicators={false}

                        sx={{ minWidth: 300, minHeight: 600, mb: 2 }}
                    >
                        <img
                            src={window.location.origin + "/ShareInstruction0.jpg"}
                            alt="Share Instruction 1"
                            style={{ width: '100%', borderRadius: 8 }}
                        />
                        <img
                            src={window.location.origin + "/ShareInstruction1.jpg"}
                            alt="Share Instruction 1"
                            style={{ width: '100%', borderRadius: 8 }}
                        />
                        <img
                            src={window.location.origin + "/ShareInstruction2.jpg"}
                            alt="Share Instruction 2"
                            style={{ width: '100%', borderRadius: 8 }}
                        />
                    </Carousel>
                </DialogContent>
                <DialogActions>
                    <DismissButton onClick={() => { setOpenShareInstructionDialog(false) }} />
                </DialogActions>
            </Dialog>

            <Dialog open={openRouteDialog || openRouteDialogFromParent} onClose={closeRouteDialog}>
                <DialogTitle>{"Choices Choices Choices..."}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        We figured out some cool routes based on your Spotify playlist. Feel free to pick one. Or make your own.
                    </DialogContentText>
                    <List>
                        {
                            <RouteChoiceList routes={calculatedRoutes} onRouteClick={setRoute} />
                        }
                    </List>
                    <DialogActions>
                        <DismissButton onClick={handleClose} />
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </Stack>);
}

export default GetSpotifyPlaylistArtistsWithShows;