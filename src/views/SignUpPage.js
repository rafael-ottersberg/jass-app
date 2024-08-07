import React from 'react';
import { Container } from '@mui/material';
import Signup from './Signup';

const SignUpPage = () => {
  return (
    <Container
      maxWidth={'md'}
      display="flex"
      flexDirection="column"
      style={{
        overflow: 'hidden',
        overflowY: 'scroll', // added scroll
      }}
    >
      <Signup />
    </Container>
  );
};

export default SignUpPage;
