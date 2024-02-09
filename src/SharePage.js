import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import SharePageList from './SharePageList';
import html2canvas from 'html2canvas';

const SharePage = ({ concerts, userLocation, mapStyle }) => {
    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });

    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0, middleIndex);
    const concerts2 = concerts.slice(middleIndex);

    const handleDownloadImage = async () => {
        const element = document.getElementById('SharePage'),
        canvas = await html2canvas(element),
        data = canvas.toDataURL('image/jpg'),
        link = document.createElement('a');
    
        link.href = data;
        link.download = 'downloaded-image.jpg';
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

    return (
        <Stack sx={{ width: '100wh' }} spacing={2}  >
            <div id="SharePage">
                <Stack >
                    {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}
                </Stack>
                <TextField variant="standard" placeholder="Write a cool name for your trip here" InputProps={{ sx: { '& input': { textAlign: 'center', color: 'white' } } }} />
                <Stack justifyContent="space-evenly" container spacing={{ xs: 2, md: 3 }} direction={'row'}>
                    <SharePageList concerts={concerts1} />
                    <SharePageList concerts={concerts2} />
                </Stack>
            </div>
                <Button onClick={handleDownloadImage} variant="contained">Share As Image</Button>
        </Stack>
    );
};

export default SharePage;