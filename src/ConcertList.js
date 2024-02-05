import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';


class ConcertList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //pass concerts from maps into here
            concerts: this.props.concerts
        }
    }


    componentDidUpdate(prevProps) {
        if (prevProps.concerts !== this.props.concerts) {
            this.setState({
                concerts: this.props.concerts
            });
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
                                    <React.Fragment>
                                        <Stack direction="row" spacing={1}>
                                            <Chip color="primary" label={`${concert.location.name}`} />
                                            <Chip color="primary" label={`${concert.date}`} />
                                            <IconButton onClick={
                                                () => {
                                                    //alert(`You clicked the button! artist is ${concert.artist}`);
                                                    //remove concerts of artist from local copy of concert list 
                                                    console.log(`who we are deleting: ${concert.artist}`);                                                    
                                                    var newConcerts = this.state.concerts;
                                                    console.log(`concerts length before operation: ${newConcerts.length}`);
                                                    var filteredConcerts = newConcerts.filter((concertInQuestion) => 
                                                    {
                                                        console.log(`${concertInQuestion.artist} vs ${concert.artist}`);
                                                        return concertInQuestion.artist !== concert.artist;
                                                    });
                                                    console.log(`concerts length after operation: ${filteredConcerts.length}`);
                                                    this.componentDidUpdate(filteredConcerts);
                                                    //set the new concert list 
                                                    this.props.setConcerts(filteredConcerts);
                                                    this.props.setAllConcerts((prev) => prev.filter((concertInQuestion) => concertInQuestion.artist !== concert.artist));
                                                }
                                            } aria-label="delete">
                                                <DeleteIcon sx={{ color: "red" }}/>
                                            </IconButton>
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
