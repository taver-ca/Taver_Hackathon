import React from 'react';
import { List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar } from '@mui/material';

const ArtistChoiceList = ({ artists, onArtistClick}) => {
    return (
        <List>
            {artists.map((artist, index) => (
                <ListItem key={index}>
                <ListItemButton onClick={() => onArtistClick(artist)}>
                  <ListItemAvatar>
                    <Avatar                      
                      alt={`${artist.name}`}
                      src={`${artist.images[1].url}`}
                    />
                  </ListItemAvatar>
                  <ListItemText
                                primary={`${artist.name}`}
                                ></ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
        </List>
    );
};

export default ArtistChoiceList;
    