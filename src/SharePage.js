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

    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0,middleIndex);
    const concerts2 = concerts.slice(middleIndex);


    const renderConcertList1 =
        concerts1.map((concert, index) => {
            return (
                <Grid item  key={index}>
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
    const renderConcertList2 = 
        concerts2.map((concert, index) => {
            return (
                <Grid item xs={12} sm={12} md={12} key={index}>
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
        <Stack spacing={2} >
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={mapStyle} /> : null}

            <Grid container spacing={{ xs: 2, md: 3 }} direction={'row'}>
                <List dense>
                    {renderConcertList1}
                </List>
                <List dense>
                    {renderConcertList2}
                </List>
            </Grid>

        </Stack>
    );
};

export default SharePage;