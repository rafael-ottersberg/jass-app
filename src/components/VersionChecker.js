import { useEffect, useState } from 'react';
import { Button, Snackbar } from '@mui/material';

const localVersion = 'GIT_COMMIT_HASH'; // This will be replaced with the actual git commit hash during the CI build

export default function VersionChecker() {
  const [isNewerVersionAvailable, setIsNewerVersionAvailable] = useState(false);
  const [dismissedUpdate, setDismissedUpdate] = useState(false);
  useEffect(() => {
    if (dismissedUpdate) {
      return;
    }
    const intervalId = setInterval(() => {
      fetch('/version?time=' + Date.now()) // Add current timestamp to prevent caching
        .then((response) => response.text())
        .then((serverVersion) => serverVersion.trim())
        .then((untrimmedVersion) => {
          const serverVersion = untrimmedVersion.trim();
          if (serverVersion.length !== 40 || localVersion.length !== 40) {
            return Promise.reject(
              `Either local (${localVersion}) or server version (${serverVersion}) is not a valid git commit hash.`
            );
          } else if (serverVersion === localVersion) {
            return Promise.reject(
              'Local and server version match: ' + localVersion
            );
          } else {
            setIsNewerVersionAvailable(true);
          }
        })
        .catch((error) =>
          console.log('Do not show update dialog to user: ', error)
        );
    }, 15000);
    return () => clearInterval(intervalId);
  }, [setIsNewerVersionAvailable, dismissedUpdate]);

  return (
    <Snackbar
      open={isNewerVersionAvailable && !dismissedUpdate}
      onClose={() => setDismissedUpdate(true)}
      message="Neue Version verfügbar"
      action={
        <Button
          color="primary"
          size="small"
          onClick={() => window.location.reload()}
        >
          UPDATE
        </Button>
      }
    />
  );
}
