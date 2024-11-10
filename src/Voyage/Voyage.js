import { Stack, Typography } from "@mui/material";
import Map from "../Odyssey/map";
import SharePageList from "../Odyssey/SharePageList"
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api"
import CircularProgress from '@mui/material/CircularProgress'; import Box from '@mui/material/Box';
function toLowerCaseKeys(obj) { if (Array.isArray(obj)) { return obj.map(toLowerCaseKeys); } else if (obj !== null && obj.constructor === Object) { return Object.keys(obj).reduce((acc, key) => { const lowerCaseKey = key.charAt(0).toLowerCase() + key.slice(1); acc[lowerCaseKey] = toLowerCaseKeys(obj[key]); return acc; }, {}); } return obj; }



const Voyage = ({
    concerts,
    userLocation,
    style,
    posterName,
    setPosterName,
    setConcerts,
    setUserLocation,
    setStyle

}) => {
    const { guid } = useParams();
    const [loading, setLoading] = useState(true);
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });


    //get that row data from database
    //if unable to retrieve data redirect user to the main page, let them know first though
    useEffect(() => {
        // Fetch data from an API 
        console.log("requesting data from server");
        fetch(`${process.env.REACT_APP_BACKEND}/RetrieveTrip?tripId=${guid}`,
            {
                method: "GET",
                headers: {
                    "content-type": "application/json;charset=utf-8",
                },
            })
            .then(response => response.json())
            .then(data => {
                //these are json strings, will need to be deserialized
                var parsedConcerts = JSON.parse(data.ConcertJson);
                var transformedConcerts = toLowerCaseKeys(parsedConcerts);
                var coords = data.StartingLocation.match(/-?\d+\.\d+/g);
                var result = { coords: { longitude: parseFloat(coords[0]), latitude: parseFloat(coords[1]) } };

                setPosterName(data.TripName);
                setConcerts(transformedConcerts);
                setUserLocation(result);
                setStyle(data.mapStyleId);
                setLoading(false);
            });
    }, []);

    // ...
    if (loading) {
        //do a throbber here
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }} >
                <CircularProgress />
            </Box>);
    }


    const middleIndex = Math.ceil(concerts.length / 2);
    const concerts1 = concerts.slice(0, middleIndex);
    const concerts2 = concerts.slice(middleIndex);

    return (
        <Stack spacing={3} sx={{ width: { xs: '100%', sm: '90%', md: '50%' } }} >
            {isLoaded ? <Map concerts={concerts} userLocation={userLocation} mapStyle={style} /> : null}
            <Typography
                variant="h3"
            >{posterName}</Typography>
            <Stack justifyContent="center" container sx={{ flexDirection: { xs: "column", sm: "row", md: "row" } }} >
                <SharePageList concerts={concerts1} />
                <SharePageList concerts={concerts2} />
            </Stack>
        </Stack>);
};

export default Voyage;