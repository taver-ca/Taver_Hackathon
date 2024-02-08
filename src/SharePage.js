import React from 'react';
import { Stack, TextField } from '@mui/material';
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
        <Stack spacing={2} >
            <Stack container xs={6} sm={6} md={6}>
                {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
            </Stack>
            <TextField id="standard-basic" variant="standard" placeholder="Write a cool name for your trip here"  InputProps={{ sx: { '& input': { textAlign: 'center', color:'white' } } }}/>
            <Stack justifyContent="space-evenly" xs={12} sm={12} md={12} container spacing={{ xs: 2, md: 3 }} direction={'row'}>
                <SharePageList concerts={concerts1} />
                <SharePageList concerts={concerts2} />
            </Stack>

        </Stack>
    );
};

export default SharePage;