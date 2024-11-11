import React from 'react';
import { Grid, Button, Stack, Container } from "@mui/material";
// Import other components
import SharePage from "./SharePage.js";
import html2canvas from "html2canvas";
import canvas2image from "@reglendo/canvas2image";

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
            let res = await fetch(`${process.env.REACT_APP_BACKEND}/SaveTrips`, {
                method: "POST",
                headers: {
                    "content-type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    shareId: shareId,
                    ownerUsername: "",
                    startingPoint: userLocation,
                    gigs: concerts,
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
        <Grid item xs={10} sm={10} md={10} lg={7} xl={8} direction={"row"}>
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



