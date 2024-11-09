import { Stack, TextField } from "@mui/material";
import Map from "../Odyssey/map";
import SharePageList from "../Odyssey/SharePageList"
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useLoadScript } from "@react-google-maps/api"

const Voyage = ({

}) => {
    const { guid } = useParams();
    const { retrievedConcerts, setRetrievedConcerts } = useState([])
    const { retrievedLocation, setRetrievedLocation } = useState(null);
    const { retrievedStyle, setRetrievedStyle } = useState('');
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GCP_KEY, // Add your API key
    });


    //get that row data from database
    //if unable to retrieve data redirect user to the main page, let them know first though
    useEffect(() => {
        // Fetch data from an API 
        fetch(`${process.env.REACT_APP_BACKEND}/RetrieveTrip?tripId=${guid}`,
            {
                method: "GET",
                headers: {
                    "content-type": "application/json;charset=utf-8",
                },
            })
            .then(response => response.json())
            .then(data =>{
                //these are json strings, will need to be deserialized
                
                setRetrievedConcerts(data.ConcertJson);
                setRetrievedLocation(data.StartingLocation);
                setRetrievedStyle(data.mapStyleId);
            } );


    }, []);

    const middleIndex = Math.ceil(retrievedConcerts.length / 2);
    const concerts1 = retrievedConcerts.slice(0, middleIndex);
    const concerts2 = retrievedConcerts.slice(middleIndex);

    return (<Stack disablePadding spacing={3}>
        {isLoaded ? <Map concerts={retrievedConcerts} userLocation={retrievedLocation} mapStyle={retrievedStyle} /> : null}
        <TextField
            variant="standard"
        />
        <Stack justifyContent="space-evenly" container sx={{ flexDirection: { xs: "column", sm: "row", md: "row" } }} >
            <SharePageList concerts={concerts1} />
            <SharePageList concerts={concerts2} />
        </Stack>
    </Stack>);
};

export default Voyage;