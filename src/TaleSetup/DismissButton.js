import React from 'react';
import { Button } from '@mui/material';

const DismissButton = ({ onClick }) => {
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      Dismiss
    </Button>
  );
};

export default DismissButton;
