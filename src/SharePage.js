import React from 'react';
import { Grid, Stack } from '@mui/material';
import Map from "./map";
import { useLoadScript } from "@react-google-maps/api"
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import moment from 'moment';

function formattedDate(incomingDate) {
    var date = new Date(incomingDate);
    return moment(date).format('YYYY/MM/DD');
}

const SharePage = ({ concerts, userLocation, mapStyle }) => {
    // Your component logic goes here
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });


    const renderConcertList = concerts.map((concert, index) => {
        return (
            <Grid item xs={6} sm={6} md={6} key={index}>
                <ListItem
                    key={index}
                    disablePadding
                >
                    <ListItemButton>
                        <ListItemAvatar>
                            <Avatar
                                alt={`${concert.artist}`}
                                src={`${concert.image.url}`}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={`${concert.artist}`}
                            secondary={
                                <React.Fragment>
                                    <Stack direction="row" spacing={1}>
                                        <Chip color="primary" label={`${concert.location.name}`} />
                                        <Chip color="primary" label={`${formattedDate(concert.date)}`} />
                                    </Stack>
                                </React.Fragment>
                            } />
                    </ListItemButton>
                </ListItem>
            </Grid>
        );
    });

    return (
        <Stack spacing={2} alignItems={'flex-start'} justifyContent={'flex-start'}>
            <div>{isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}</div>
            <div><List
                dense>
                <Grid container spacing={{ xs: 2, md: 3 }} >
                    {renderConcertList}
                </Grid>
            </List></div>
        </Stack>
    );
};

export default SharePage;