import React from 'react';
import { styled } from '@mui/system';
import { Box, Card } from '@mui/material';

const TileCard = styled(Card, {
  name: 'tile-card',
})`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TileContainer = styled(Box, {
  name: 'tile-container',
})`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Tile = (props) => {
  return (
    <TileContainer>
      <TileCard {...props} />
    </TileContainer>
  );
};

export default Tile;
