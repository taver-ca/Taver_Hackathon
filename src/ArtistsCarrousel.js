import React, { useState } from 'react';
import { Stack, Chip } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const CHUNK_SIZE_CHIPS = 1

function SwipeableTextMobileStepper({ groupedNames, handleArtistClick }) {
  const artistsClicked = (artist) => {
    handleArtistClick(artist)
  }

  const [disableAutoScroll, setDisableAutoScroll] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [toltipOpen, setToltipOpen] = useState(false)

  const handleLetterClick = (letter) => {
    setDisableAutoScroll(true)
    setToltipOpen(letter)
  }
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const chunkCarrousel = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  const chunk = chunkCarrousel(Object.keys(groupedNames), CHUNK_SIZE_CHIPS);


  const artistChips = (letter) => groupedNames[letter].map((artist) =>
  (<Stack key={artist.name + 'artist'} direction={'column'} spacing={1} style={{ minHeight: '45px' }}>
    <ClickAwayListener onClickAway={() => { setToltipOpen(0); }}>
      <Chip key={artist.name} sx={{ background: "limegreen" }} label={artist.name} color="success" onClick={() => artistsClicked(artist)} />
    </ClickAwayListener>
  </Stack>)
  )
  const artistChipsByChunks = chunk.map((letters, index) => {
    return (
      <Stack key={index} >
        {letters.map((letter) =>
          <Tooltip key={letter + 'tooltip'}
            TransitionComponent={Zoom}
            title={artistChips(letter)}
            placement="right-start"
            open={toltipOpen === letter}
          >
            <Chip key={letter + "chip"} sx={{ background: "limegreen" }} label={letter} color="success" onClick={() => handleLetterClick(letter)} />
          </Tooltip>
        )}
      </Stack>
    );
  });

  return (
    <Stack spacing={2} direction={'row'} useFlexGap flexWrap="wrap"  sx={{ padding:"10px", justifyContent:"center"}}>
      {artistChipsByChunks}
    </Stack>
  );
}

export default SwipeableTextMobileStepper;
