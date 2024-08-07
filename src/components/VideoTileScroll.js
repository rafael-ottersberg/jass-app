import React, { useEffect, useRef, useState } from 'react';
import Tile from './Tile';
import { CardMedia } from '@mui/material';
import { styled } from '@mui/system';

const CardVideo = styled(CardMedia, {
  name: 'card-video',
})`
width: 100%;}
`;

const VideoTile = (props) => {
  const [initialPlay, setInitialPlay] = useState(true);
  const videoRef = useRef();

  useEffect(() => {
    window.addEventListener('scroll', playVideo);

    return function cleanup() {
      window.removeEventListener('scroll', playVideo);
    };
  });

  const playVideo = () => {
    const windowsScrollTop = window.pageYOffset;
    if (window.innerHeight > 2 * props.playOnScroll) {
      videoRef.current.play();
      setInitialPlay(false);
    } else if (initialPlay) {
      if (windowsScrollTop > props.playOnScroll) {
        videoRef.current.play();
        setInitialPlay(false);
      }
    }
  };

  return (
    <Tile>
      <CardVideo
        component="video"
        src={props.video}
        controls
        ref={videoRef}
        muted
        playsInline
        type="video/mp4"
      />
    </Tile>
  );
};

export default VideoTile;
