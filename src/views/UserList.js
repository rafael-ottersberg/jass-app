import HeaderSubpage from '../components/HeaderSubpage';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const FlexBox = styled(Box, {
  name: 'flex-box',
})`
  display: flex;
  flex-flow: column;
  height: 100vh;
  align-items: center;
`;

const FillSpaceBox = styled(Box, {
  name: 'fill-space-box',
})`
  flex: 1;
  /* 1 and it will fill whole space left if no flex value are set to other children*/
  overflow: auto;
  width: 100%;
  padding: 5px;
`;

const UserList = () => {
  const [userList, setUserList] = useState([]);

  const loadList = async () => {
    var localToken = localStorage.getItem('token');
    if (localToken !== null) {
      await axios
        .get('/api/user-list', { auth: { username: localToken, password: '' } })
        .then((response) => {
          setUserList(response.data[0].userList);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  return (
    <FlexBox>
      <HeaderSubpage color="primary" />
      <Typography variant="h6" textAlign={'center'} sx={{ pt: '5px' }}>
        Users
      </Typography>
      <FillSpaceBox>
        <UserTable rows={userList} />
      </FillSpaceBox>
    </FlexBox>
  );
};

export default UserList;

const UserTable = (props) => {
  let rows = props.rows;

  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'vorname',
      headerName: 'Vorname',
      width: 120,
    },
    {
      field: 'nachname',
      headerName: 'Nachname',
      width: 150,
    },
    {
      field: 'jahrgang',
      headerName: 'Jahrgang',
      width: 100,
    },
    {
      field: 'ort',
      headerName: 'Ort',
      width: 160,
    },
    {
      field: 'bemerkungen',
      headerName: 'Bemerkungen',
      width: 200,
    },
  ];

  return <DataGrid rows={rows} columns={columns} />;
};
