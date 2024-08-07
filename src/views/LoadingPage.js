import React from 'react';
import loadingGif from '../assets/img/loading.gif';

export default function LoadingPage() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <img src={loadingGif} alt="..." style={{ height: '60px' }} />
      </div>
    </div>
  );
}
