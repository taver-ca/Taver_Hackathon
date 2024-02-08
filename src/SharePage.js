import React from 'react';
import { Stack, TextField, Box } from '@mui/material';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import SharePageList from './SharePageList';

const SharePage = ({ concerts, userLocation, mapStyle }) => {
    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0, middleIndex);
    const concerts2 = concerts.slice(middleIndex);

    return (
        <Stack sx={{ width: '100wh' }} spacing={2}  >
            <Stack >
                {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
            </Stack>
            <TextField variant="standard" placeholder="Write a cool name for your trip here" InputProps={{ sx: { '& input': { textAlign: 'center', color: 'white' } } }} />
            <Stack justifyContent="space-evenly" container spacing={{ xs: 2, md: 3 }} direction={'row'}>
                <SharePageList concerts={concerts1} />
                <SharePageList concerts={concerts2} />
            </Stack>
        </Stack>
    );
};

export default SharePage;