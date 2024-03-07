import { Grid, Chip, Box } from '@mui/material';

function YourSpotifyArtistsWithShows({artists, onChildClick}) {
    const handleClick = (artistName) => {
        onChildClick(artistName);
      };

    const commaSeparatedfollowedArtists = artists.map((artistName, index) => {
        return (
          <Grid item key={index}>
            <Chip sx={{ background: "limegreen" }} label={artistName} color="success" onClick={() => handleClick(artistName)} />
          </Grid>
        );
      });

    return (
        <Grid>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Grid xs={10} md={10} container spacing={1} direction="row" justifyContent="center">
                    {commaSeparatedfollowedArtists}
                </Grid>
            </Box>
        </Grid>
    );
}


export default YourSpotifyArtistsWithShows