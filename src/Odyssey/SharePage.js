import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import SharePageList from './SharePageList';
import { FetchName } from './FetchName.js';

const SharePage = ({ concerts, userLocation, mapStyle, setPosterName, posterName }) => {


    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0, middleIndex);
    const concerts2 = concerts.slice(middleIndex);

    const GenerateTripTitle = async function () {
        //send a request to openAI
        //attach the conerts, but strip the GPS data, that is not very useful for suggesting trip titles
        // New list with only 'title', 'artist', and location fields 
        const newList = concerts.map(({ title, artist, location, date }) => ({ title, artist, date, venue: location.name, city: location.address }));
        // now make a request and send it to open AI
        var suggestions = await FetchName(newList);
        console.log(`poster name is: ${suggestions[0].title}`);
        setPosterName(suggestions[0].title);
    };

    return (
        <Stack disablePadding spacing={3}>
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
            <Stack spacing={5} direction={'row'} sx={{ width: '100%' }}>
                <TextField
                    variant="standard"
                    placeholder="Write a cool name for your trip here"
                    InputProps={{ sx: { 'input': { textAlign: 'center', color: 'white' } } }}
                    value={posterName}
                    onChange={(e) => setPosterName(e.target.value)} />
                <Button
                    color="primary"
                    onClick={GenerateTripTitle}
                    disabled={concerts.length === 0}
                    variant="contained">
                    Generate
                </Button>
            </Stack>
            <Stack justifyContent="center" container sx={{ flexDirection: { xs: "column", sm: "row", md: "row" } }} >
                <SharePageList concerts={concerts1} />
                <SharePageList concerts={concerts2} />
            </Stack>
        </Stack>
    );
};

export default SharePage;
