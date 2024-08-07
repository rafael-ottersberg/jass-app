import React, { useEffect, useRef } from 'react';
import Tick from '@pqina/flip';
import '@pqina/flip/dist/flip.min.css';
import { styled } from '@mui/system';

const StyledTick = styled('div', (name = 'styled-tick'))`
  font-size: 2rem;
`;

const Flip = ({ value }) => {
  const divRef = useRef();
  const tickRef = useRef();

  useEffect(() => {
    const didInit = (tick) => {
      tickRef.current = tick;
    };

    const currDiv = divRef.current;
    const tickValue = tickRef.current;
    Tick.DOM.create(currDiv, {
      value,
      didInit,
    });
    return () => Tick.DOM.destroy(tickValue);
  });

  useEffect(() => {
    if (tickRef.current) {
      tickRef.current.value = value;
    }
  }, [value]);

  return (
    <StyledTick ref={divRef} className="tick">
      <div data-repeat="true">
        <span data-view="flip">Tick</span>
      </div>
    </StyledTick>
  );
};

export default Flip;
