import React from 'react';
import Stack from '@mui/material/Stack';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';




const SharePage = ({concerts, userLocation, mapStyle}) => {
    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });


    const renderConcertList = concerts.map((concert, index) => {
        return (
            <ListItem
                key={index}
                disablePadding
                sx={{ width: '100%', maxWidth: 360 }}
            >
                <ListItemButton>
                    <ListItemAvatar>
                        <Avatar
                            alt={`${concert.artist}`}
                            src={`${concert.image.url}`}
                        />
                    </ListItemAvatar>
                    <ListItemText
                        primary={`${concert.title}`}
                        secondary={
                            <React.Fragment>
                                <Stack direction="row" spacing={1}>
                                    <Chip color="primary" label={`${concert.location.name}`} />
                                    <Chip color="primary" label={`${concert.date}`} />
                                </Stack>
                            </React.Fragment>
                        } />
                </ListItemButton>
            </ListItem>
        );
    });

    return (
        <Stack spacing={2}>
            <div>{isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}</div>
            <div><List
                dense
                sx={{ width: '100%', maxWidth: 360 }}>
                {renderConcertList}
            </List></div>
        </Stack>
    );
};

export default SharePage;