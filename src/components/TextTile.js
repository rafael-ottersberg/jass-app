import React from 'react';
import Tile from './Tile';
import { CardContent, Typography } from '@mui/material';

const TextTile = (props) => {
  return (
    <Tile>
      <CardContent>
        <Typography variant="h4" sx={{ display: { xs: 'none', md: 'flex' } }}>
          {props.title}
        </Typography>
        <Typography variant="h6" sx={{ display: { xs: 'flex', md: 'none' } }}>
          {props.title}
        </Typography>
        <Typography>{props.text}</Typography>
      </CardContent>
    </Tile>
  );
};

export default TextTile;
