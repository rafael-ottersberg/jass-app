import React from 'react';
import Tile from './Tile';
import { CardMedia } from '@mui/material';

const VideoTile = (props) => {
  return (
    <Tile>
      <CardMedia
        component="video"
        src={props.video}
        controls
        type="video/mp4"
      />
    </Tile>
  );
};

export default VideoTile;
