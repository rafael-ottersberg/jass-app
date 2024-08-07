import React from 'react';
import Tile from './Tile';
import { CardMedia } from '@mui/material';

const ImageTile = (props) => {
  return (
    <Tile>
      <CardMedia component="img" src={props.image} />
    </Tile>
  );
};

export default ImageTile;
