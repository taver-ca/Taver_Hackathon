import React from 'react';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const RouteChoiceList = ({ routes, onRouteClick }) => {

  return (
    <List>
      {routes.map((route, index) => (
        <ListItem key={index}>
          <ListItemButton onClick={() => onRouteClick(route)}>
            <ListItemText
              primary={`${route.posterName}`}
            ></ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default RouteChoiceList;