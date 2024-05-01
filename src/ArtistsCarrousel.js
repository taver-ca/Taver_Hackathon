import React, { useState } from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const CHUNK_SIZE_CHIPS = 5

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function SwipeableTextMobileStepper({groupedNames, handleArtistClick}) {
  const artistsClicked = (artist) => {
    setToltipOpen(0)
    handleArtistClick(artist)
  }
  const theme = useTheme();
  const [disableAutoScroll, setDisableAutoScroll] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [toltipOpen, setToltipOpen] = useState(false)

  const handleLetterClick = (letter) =>{
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
  
  const chunk = chunkCarrousel(Object.keys(groupedNames), CHUNK_SIZE_CHIPS)

  const maxSteps = chunk.length;

  const artistChips = (letter) =>  groupedNames[letter].map((artist) => 
    (<Stack key={artist.name+'artist'}direction={'column'} spacing={1} style={{minHeight: '45px'}}>
      <ClickAwayListener onClickAway={()=>{setToltipOpen(0); setDisableAutoScroll(false)} }>
        <Chip key={artist.name} sx={{ background: "#1976d2" }} label={artist.name} color="success" onClick={() => artistsClicked(artist)} />
      </ClickAwayListener>
    </Stack>)
  )
  const artistChipsByChunks = chunk.map((letters, index) => {
    return (
      <Stack key={index} spacing={1} direction={'row'} useFlexGap flexWrap="wrap">
          {letters.map((letter) => 
            <Tooltip key={letter+'tooltip'} 
                     TransitionComponent={Zoom}
                     title={artistChips(letter)} 
                     placement="right-start"
                     open={toltipOpen === letter}
                    >
                <Chip key={letter+"chip"} sx={{ background: "gray" }} label={letter} color="success" onClick={() => handleLetterClick(letter)} />
            </Tooltip>
        )}
        </Stack>
    );
  });

  return (
    <Box sx={{flexGrow: 1 }}>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={disableAutoScroll ? null : handleStepChange}
        enableMouseEvents
      >
        {artistChipsByChunks.map((step, index) => (
          <div key={index}>
            {Math.abs(activeStep - index) <= 2 ? (
              <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
          >
                {step}
          </Box>
            ) : null}
          </div>
        ))}
      </SwipeableViews>
      
      <MobileStepper
        style={{ background:'transparent' }}
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            {theme.direction === 'rtl' ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    </Box>
  );
}

export default SwipeableTextMobileStepper;
