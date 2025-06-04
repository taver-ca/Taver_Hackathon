
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

export const ShareAsLink = async function
    (
        concerts,
        userLocation,
        mapStyle,
        posterName,
        startDate,
        endDate,
        shareId,
        setShareId,
        selectedPlaylist,
        setIsLoading) {
    setIsLoading(true);
    //gather json for artists, map coordinates, share page schedules, concert list, trip name, map style id, start date, end date
    try {

        if (startDate === endDate) {
            alert("Your trip start date and end date is on the same day, spread them out");
            return;
        }

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
                endDate: endDate,
                playlistId: selectedPlaylist.id
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
                    alert('Failed to copy the link to your clipboard, please try again!');
                    console.error('Could not copy text: ', err);
                });
            } else {
                console.error('Document is not focused');
                alert('Oh no, it looks like you have switched to another tab, please try again!');
            }

        } else {
            console.log("Backend error: ", res.status);
            alert('Looks like our server isn\'t working at the moment, please try again later.');
        }
    } catch (err) {
        console.log(err);
        alert('Looks like our server isn\'t working at the moment, please try again later.');
    }
    //make a request to taverondemand.azurewebsites.net/api/SaveTrips
    setIsLoading(false);
};