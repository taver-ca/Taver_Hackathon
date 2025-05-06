import React from 'react';
import { Stack } from '@mui/material';
import { List, ListItem, ListItemText, ListItemAvatar, ListItemButton, Avatar, Chip } from '@mui/material';
import moment from 'moment';

function formattedDate(incomingDate) {
    var date = new Date(incomingDate);
    return moment(date).format('YYYY/MM/DD');
}

const SharePageList = ({ concerts, showActiveConcert }) => {
    return (
        <List sx={{ width: {xs:'95%'}, alignContent: 'center', margin: 'auto', padding: 0 }}>
            {concerts.map((concert, index) => (
                <ListItem
                    sx={{ background: '#70afbf', borderRadius: 2, mb: 1, boxShadow: 2, padding: 0 }}
                    key={index}>
                    <ListItemButton
                        sx={{ borderRadius: 2, background: '#70afbf', '&:hover': { background: '#e2e900' } }}
                        onClick={() => {
                            showActiveConcert(index);
                        }}>
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
                                    <Stack direction={'row'} spacing={1} justifyContent={'space-between'}>
                                        <Chip style={{ flexGrow: 1 }} color="primary" label={`${concert.location.address}`} />
                                        <Chip style={{ flexGrow: 1 }} color="primary" label={`${formattedDate(concert.date)}`} />
                                    </Stack>
                                </React.Fragment>
                            } />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}
export default SharePageList
