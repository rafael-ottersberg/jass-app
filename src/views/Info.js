import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  Typography,
  Tab,
  Link,
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

import { TabContext, TabList, TabPanel } from '@mui/lab';

import { ExpandMore } from '@mui/icons-material';
import React from 'react';
import lastSupper from '../assets/img/last-supper.png';

import workshops from '../assets/workshops.json';

const Info = () => {
  return (
    <Box sx={{ pt: 2 }}>
      <Workshops></Workshops>
      <Contacts></Contacts>
      <Box
        key="last-supper"
        component="img"
        sx={{
          mt: 1,
          width: '100%',
        }}
        src={lastSupper}
        borderRadius="5px"
      />
    </Box>
  );
};
export default Info;


const Workshops = () => {
  const categories = [
    'Sport',
    'Kreativ',
    'Outdoor',
    'Glaube',
    'Gesellschaft',
    'Persönlichkeit',
    'Schulung',
  ];
  const [value, setValue] = React.useState(categories[0]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const workshopPerCategory = {};
  categories.map((cat) => (workshopPerCategory[cat] = [])); // initialize Object

  for (let i = 0; i < workshops.workshops.length; i++) {
    let workshop = workshops.workshops[i];
    workshopPerCategory[workshop.category].push(workshop);
  }

  return (
    <Accordion key="workshops">
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Workshops</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleChange}
              aria-label="program-days"
              variant="scrollable"
              scrollButtons
            >
              {categories.map((category) => (
                <Tab label={category} value={category} key={category} />
              ))}
            </TabList>
          </Box>
          {categories.map((category) => (
            <TabPanel value={category} key={category}>
              {workshopPerCategory[category].map((workshop) => (
                <Box key={workshop.title}>
                  <Typography variant="h7">{workshop.title}</Typography>
                  <Typography
                    dangerouslySetInnerHTML={{ __html: workshop.description }}
                  ></Typography>
                  <Typography>
                    <i>
                      {workshop.name} - {workshop.day}
                    </i>
                  </Typography>
                  <Divider sx={{ my: 1 }}></Divider>
                </Box>
              ))}
            </TabPanel>
          ))}
        </TabContext>
      </AccordionDetails>
    </Accordion>
  );
};


const Contacts = () => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Wichtige Kontakte</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" sx={{ textAlign: 'center' }}>
          <Link
            href="tel:+41774459567"
            display="flex"
            sx={{
              mt: 2,
              mb: 1,
              mx: 'auto',
            }}
          >
            <Typography sx={{ mr: 1 }}>Telefon</Typography>
            <PhoneIcon />
          </Link>
        </Box>
        
        <Box display="flex" sx={{ textAlign: 'center' }}>
          <Link
            href="mailto:camp4five@methodisten.ch"
            display="flex"
            sx={{
              mt: 2,
              mb: 1,
              mx: 'auto',
            }}
          >
            <Typography sx={{ mr: 1 }}>Email</Typography>
            <EmailIcon />
          </Link>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

