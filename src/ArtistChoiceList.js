import React from 'react';
import { List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar } from '@mui/material';

const ArtistChoiceList = ({ artists, onArtistClick }) => {
  const text = { color: 'red' }
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
              secondary={`${artist.gigCount} Gig(s)`}
              secondaryTypographyProps={{ style: text }}
            ></ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ArtistChoiceList;
