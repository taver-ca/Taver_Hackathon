import React from 'react';
import { Grid, Button, Stack, Box } from "@mui/material";
// Import other components
import SharePage from "./SharePage.js";
import html2canvas from "html2canvas";
import canvas2image from "@reglendo/canvas2image";


function capitalizeFirstChar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function transformSpecificChildKeys(obj, targetKey) {
    if (Array.isArray(obj)) {
        return obj.map(item => transformSpecificChildKeys(item, targetKey));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            if (key === targetKey && obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                acc[key] = Object.keys(obj[key]).reduce((childAcc, childKey) => {
                    const uppercaseChildKey = capitalizeFirstChar(childKey);
                    childAcc[uppercaseChildKey] = obj[key][childKey];
                    return childAcc;
                }, {});
            } else {
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    } else {
        return obj;
    }
}




const Odyssey = ({
    concerts,
    userLocation,
    mapStyle,
    setPosterName,
    posterName,
    startDate,
    endDate,
    shareId,
    setShareId
}) => {
    const handleShareAsLink = async function () {
        //gather json for artists, map coordinates, share page schedules, concert list, trip name, map style id, start date, end date
        try {

            //I have encountered problems parsing image property in the gig list
            //converting all child property name to start with upper case letter in the image property in the gig list
            //not a great solution but this will work for now.
            var processedConcerts = transformSpecificChildKeys(concerts, 'image')
            let res = await fetch(`${process.env.REACT_APP_BACKEND}/SaveTrips`, {
                method: "POST",
                headers: {
                    "content-type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    shareId: shareId,
                    ownerUsername: "",
                    startingPoint: userLocation,
                    gigs: processedConcerts,
                    tripName: posterName,
                    startDate: startDate,
                    mapStyleId: mapStyle,
                    endDate: endDate
                })
            });

            if (res.status === 200) {
                let talesLink = await res.json();

                if (document.hasFocus()) {
                    //we will not create a new entry into the database once a shareId is present.
                    setShareId(talesLink.shareId);
                    let link = `https://taver.ca/tales/${talesLink.shareId}`;
                    navigator.clipboard.writeText(link).then(function () {
                        alert(`The link to your journey is ${link}, now go tell your friends all about it!`);
                    }).catch(function (err) {
                        console.error('Could not copy text: ', err);
                    });
                } else {
                    console.error('Document is not focused');
                }

            } else {
                console.log("Some error occured");
            }
        } catch (err) {
            console.log(err);
        }
        //make a request to taverondemand.azurewebsites.net/api/SaveTrips
    };
    const handleDownloadImage = async function () {
        const element = document.getElementById("sharepage");
        html2canvas(element, {
            logging: true,
            proxy: `${process.env.REACT_APP_BACKEND}/GetImage`,
            backgroundColor: "#282c34",

            ignoreElements: (node) => {
                return node.nodeName === "IFRAME";
            },
            scrollY: window.scrollY * -1,
        }).then((canvas) => {
            let finalPosterName = posterName || "poster";
            canvas2image.saveAsPNG(canvas, finalPosterName, canvas.width, canvas.height);
        });
    };

    return (
        <Grid sx={{ container: true }} >
            <div id="sharepage">
                <SharePage
                    concerts={concerts}
                    userLocation={userLocation}
                    mapStyle={mapStyle}
                    setPosterName={setPosterName}
                />
            </div>

            <Stack
                container
                sx={{
                    justifyContent: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' }, // Change direction based on screen size
                    gap: 2
                }}
            >
                <Button
                    id="sharelinkbutton"
                    color="primary"
                    disabled={concerts.length === 0}
                    onClick={handleShareAsLink}
                    variant="contained">
                    Share As Link
                </Button>

                <Button
                    id="sharebutton"
                    color="primary"
                    disabled={concerts.length === 0}
                    onClick={handleDownloadImage}
                    variant="contained"
                >
                    Share As Image
                </Button>
            </Stack>
        </Grid>
    );
};

export default Odyssey;



