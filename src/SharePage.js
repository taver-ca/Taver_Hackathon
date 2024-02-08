import React from 'react';
import { Stack } from '@mui/material';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import SharePageList from './SharePageList';

const SharePage = ({ concerts, userLocation, mapStyle }) => {
    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0,middleIndex);
    const concerts2 = concerts.slice(middleIndex);

    return (
        <Stack spacing={2} >
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}

            <Stack container spacing={{ xs: 2, md: 3 }} direction={'row'}>
                <SharePageList concerts={concerts1} />
                <SharePageList concerts={concerts2} />
            </Stack>

        </Stack>
    );
};

export default SharePage;