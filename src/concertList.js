import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography'

class ConcertList extends React.Component {
    constructor(props) {
        super(props);
        this.renderConcertList = this.renderConcertList.bind(this);
        this.state = {
            //pass concerts from maps into here
            concerts : this.props.concerts
        }
    }

    renderConcertList(concerts) {
        concerts.map((concert, index) => {
            return (
                <ListItem
                    key={index}
                    disablePadding
                >
                    <ListItemButton>
                        <ListItemAvatar>
                            <Avatar
                                alt={`${concert.artist}`}
                                src={`${concert.artistImageUrl}`}
                            />
                        </ListItemAvatar>
                        <ListItemText primary={`${concert.title}`}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                >
                                    {`${concert.artist}`}
                                </Typography>
                                {`${concert.location} - ${concert.date}`}
                            </React.Fragment>
                        } />
                    </ListItemButton>
                </ListItem>
            );
        });
    }

    // Display spotify token 
    render()  {
        return <div>
            <p>Upcoming Concerts: </p>
            <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {this.renderConcertList(this.state.concerts)}
            </List>
        </div>;
    }

}

export default ConcertList;
