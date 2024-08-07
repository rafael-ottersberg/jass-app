import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Container, Box } from '@mui/material';
import BottomNav from '../components/BottomNav';
import { isSupported, subscribe } from 'on-screen-keyboard-detector';
import Info from './Info';
import Home from './Home';
import QuestionPage from './QuestionPage';

const pageKey = 'SELECTED_PAGE';

const LandingPage = () => {
  const [selectedPage, setSelectedPage] = useState('Home');
  const [scrollContainerNode, setScrollContainerNode] = useState();

  const [keyboard, setKeyboard] = useState(false);

  const setPage = (page) => {
    setSelectedPage(page);
    localStorage.setItem(pageKey, page);
  };

  const checkSavedPage = () => {
    var page = localStorage.getItem(pageKey);
    if (page !== null) {
      setSelectedPage(page);
    }
  };

  useEffect(() => {
    checkSavedPage();
  });

  useEffect(() => {
    if (isSupported()) {
      const unsubscribe = subscribe((visibility) => {
        if (visibility === 'hidden') {
          setKeyboard(false);
        } else {
          // visibility === "visible"
          setKeyboard(true);
        }
      });
      return () => unsubscribe();
    }
  }, [setKeyboard]);
  let content;
  if (selectedPage === 'Home') {
    content = <Home />;
  } else if (selectedPage === 'Infos') {
    content = <Info />;
  } else if (selectedPage === 'Fragen') {
    content = <QuestionPage />;
  }

  let paddingBottom;
  if (keyboard) {
    paddingBottom = '10px';
  } else {
    paddingBottom = '60px';
  }

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Header
        color="primary"
        setPage={setPage}
        sx={{ flex: '0 0 auto', zIndex: 1 }}
        scrollTarget={scrollContainerNode}
      />
      <Box
        ref={(node) => {
          if (node) {
            setScrollContainerNode(node);
          }
        }}
        sx={{
          flex: '1 1 auto',
          overflow: 'auto',
        }}
      >
        <Container
          maxWidth={'md'}
          sx={{ pb: { xs: paddingBottom, md: '30px' }, pt: 2 }}
        >
          {content}
        </Container>
      </Box>
      {keyboard === false && (
        <BottomNav
          page={selectedPage}
          setPage={setPage}
          sx={{ paddingTop: 2 }}
        />
      )}
    </Box>
  );
};

export default LandingPage;
