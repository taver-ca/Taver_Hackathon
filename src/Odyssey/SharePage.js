import React from 'react';
import { Stack, TextField } from '@mui/material';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import SharePageList from './SharePageList';

const SharePage = ({ concerts, userLocation, mapStyle, setPosterName }) => {
    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0, middleIndex);
    const concerts2 = concerts.slice(middleIndex);


    return (
        <Stack disablePadding spacing={3}>
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
            <TextField
                variant="standard"
                placeholder="Write a cool name for your trip here"
                InputProps={{ sx: { 'input': { textAlign: 'center', color: 'white' } } }}
                onChange={(e) => setPosterName(e.target.value)} />
            <Stack justifyContent="space-evenly" container sx={{ flexDirection: { xs: "column", sm: "row", md: "row" } }} >
                <SharePageList concerts={concerts1} />
                <SharePageList concerts={concerts2} />
            </Stack>
        </Stack>
    );
};

export default SharePage;
