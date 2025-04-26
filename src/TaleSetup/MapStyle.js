import * as React from 'react';
import { FormControl, InputLabel, NativeSelect } from '@mui/material';

const mapStyles = [
  { mapId: "1fc21c527f198d4e", displayName: "Default Theme", buttonColorCss: "0070d2" },
  { mapId: "53a5c2c14f51f10b", displayName: "Dark Theme", buttonColorCss: "#404040" },
];

const MapStyle = ({ setMapStyle }) => {

  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{
          color: 'white'
        }}
        variant="standard" htmlFor="mapStyle">
        Map Style:
      </InputLabel>
      <NativeSelect
        sx={{
          color: 'white',
          "& input": {
            color: "white",
          },
          "& label": {
            color: "white",
          },
          "& svg": {
            color: "white",
          }
        }}
        defaultValue={mapStyles[0]}
        id="mapStyle"
        onChange={(event) => setMapStyle(event.target.value)}>
        {mapStyles.map((mapStyle) => (
          <option style={{ backgroundColor: 'darkgrey' }} key={mapStyle.mapId} value={mapStyle.mapId}>
            {mapStyle.displayName}
          </option >
        ))}
      </NativeSelect>
    </FormControl>
  );
}

export default MapStyle;