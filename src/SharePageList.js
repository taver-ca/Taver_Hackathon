import React from 'react';
import { Stack } from '@mui/material';
import { List, ListItem, ListItemText, ListItemAvatar, ListItemButton, Avatar, Chip } from '@mui/material';
import moment from 'moment';

function formattedDate(incomingDate) {
    var date = new Date(incomingDate);
    return moment(date).format('YYYY/MM/DD');
}

const SharePageList = ({ concerts }) => {
    return (
        <List dense>
            {concerts.map((concert, index) => (
                <ListItem
                    key={index}
                    disablePadding>
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
                                    <Stack direction="row" spacing={1} justifyContent={'space-between'}>
                                        <Chip color="primary" label={`${concert.location.address}`} />
                                        <Chip color="primary" label={`${formattedDate(concert.date)}`} />
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
