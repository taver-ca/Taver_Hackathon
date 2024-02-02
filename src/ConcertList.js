import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { Stack } from '@mui/material';
class ConcertList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //pass concerts from maps into here
            concerts: this.props.concerts
        }
    }

    // Display spotify token 
    render() {
        const renderConcertList =
            this.state.concerts.map((concert, index) => {
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
                                    <React.Fragment><Stack direction="row" spacing={1}>
                                        <Chip color="primary" label={`${concert.location.name}`} />
                                        <Chip color="primary" label={`${concert.date}`} />
                                    </Stack>
                                    </React.Fragment>
                                } />
                        </ListItemButton>
                    </ListItem>
                );
            });



        return <div>
                        <p>Upcoming Concerts: </p>
                        <List 
                        dense 
                        sx={{ width: '100%', maxWidth: 360 }}>
                            {renderConcertList}
                        </List>
        </div>;
    }
}

export default ConcertList;
