// Helper function: calculate Euclidean distance
function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2));
}

function calculateTimeDifference(timeA, timeB) {
    const millisecondsDiff = Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime());
    return millisecondsDiff / (1000 * 60 * 60); // Convert to hours
}

const EVENT_DURATION = 24; // Duration in hours (1 days)
const MIN_TIME_GAP = 48; // Minimum travel time allocation (2 day)
const MAX_TIME_GAP = 96; // Maximum travel time allocation (4 days)

function groupEfficiently(events, startLocation, baseDistance, baseTime) {
    // Sort events by proximity to the starting location first
    events.sort((a, b) => calculateDistance(startLocation, a.location.gpsCoordinate.coords) - calculateDistance(startLocation, b.location.gpsCoordinate.coords));

    const clusters = [];
    const visited = new Set();
    
    events.forEach(event => {
        if (!visited.has(event.id)) {
            let cluster = [event];
            let lastEvent = event;
            visited.add(event.id);

            events.forEach(otherEvent => {
                if (!visited.has(otherEvent.id)) {
                    const distance = calculateDistance(lastEvent.location.gpsCoordinate.coords, otherEvent.location.gpsCoordinate.coords);
                    const timeDifference = calculateTimeDifference(lastEvent.date, otherEvent.date);
                    
                    const adjustedTimeGap = timeDifference - EVENT_DURATION;
                    const scaledTimeThreshold = Math.min(
                        MAX_TIME_GAP, 
                        Math.max(MIN_TIME_GAP, baseTime * (distance / baseDistance))
                    );

                    if (distance <= baseDistance && adjustedTimeGap >= MIN_TIME_GAP && adjustedTimeGap <= scaledTimeThreshold) {
                        cluster.push(otherEvent);
                        visited.add(otherEvent.id);
                        lastEvent = otherEvent; // Maintain forward movement
                    }
                }
            });

            if (cluster.length > 2 && cluster.length < 7) {
                clusters.push(cluster);
            }
        }
    });

    return clusters;
}


export async function ClusterArtists(res,
    followedArtists,
    allConcerts,
    timeThreshold,
    distanceThreshold,
    startLocation,
    setPosterName,
    setFollowedArtists,
    setAllConcerts,
    setIsArtistRequestTriggered,
    setIsSuggestionRequestTriggered,
    setTripSuggestions,
    setCalculatedRoutes) {

    let resJson = await res.json();
    //console.table(resJson);
    const existingArtists = followedArtists;
    const incomingArtists = resJson.artistList;
    const existingGigs = allConcerts;
    const incomingGigs = resJson.artistGigList;
    const playlistName = resJson.playlistName;

    // Merge existing and incoming artists, removing duplicates by id
    const updatedArtists = [...existingArtists, ...incomingArtists].filter(
        (value, index, self) => self.findIndex(otherItem => otherItem.id === value.id) === index
    );

    // Merge existing and incoming gigs, removing duplicates by id
    const updatedGigs = [...existingGigs, ...incomingGigs].filter(
        (value, index, self) => self.findIndex(otherItem => otherItem.id === value.id) === index
    );

    if (incomingArtists.length < 1) {
        alert(`Oof, nobody from this playlist is on tour...`);
    }

    // Update initial state (artists and gigs list displayed)
    // Using new Promise to ensure state updates before proceeding (as in original code)
    await new Promise(resolve => {
        setPosterName(playlistName);
        setFollowedArtists(updatedArtists);
        setAllConcerts(updatedGigs);
        resolve();
    });

    // Indicate that artist request is done and suggestion request is starting
    setIsArtistRequestTriggered(false);
    setIsSuggestionRequestTriggered(true);

    // Clustering step
    let clusters = groupEfficiently(updatedGigs, startLocation, distanceThreshold, timeThreshold);

    // Process clusters: remove duplicates and sort
    clusters = clusters.map(cluster => {
        const seenIds = new Set();
        const seenArtistIds = new Set();
        // Filter out duplicates by `id` and `artistId` within each cluster
        return cluster.filter(gig => {
            if (seenArtistIds.has(gig.artistId)) return false;
            if (seenIds.has(gig.id)) return false;
            seenArtistIds.add(gig.artistId);
            seenIds.add(gig.id);
            return true;
        });
    });

    clusters = clusters.filter(cluster => cluster.length > 2);
    // Sort each cluster by date
    clusters = clusters.map(cluster =>
        cluster.sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date in ascending order
    );

    // Sort clusters themselves by length (descending)
    clusters = clusters.sort((a, b) => b.length - a.length);

    // --- NEW STEP 1: Set trip suggestions with default names ---
    // Add default posterName and nameSuggestions to clusters immediately
    const clustersWithDefaultNames = clusters.map((cluster, index) => ({
        gigs: cluster,
        posterName: `suggestion ${index + 1}`,
        nameSuggestions: [],
        id: index
    }));

    // Set the state with clusters having default names
    // This provides immediate feedback to the user
    setTripSuggestions(clustersWithDefaultNames);

    const clustersWithFetchedNames = await Promise.all(
        clusters.map(async (cluster, index) => {

            // Classic 'Sell this as a feature' moment
            let fetchedPosterName = `Click to Reveal`;
            let fetchedNameSuggestions = [{'title':`Suggestion ${index}`}];           

            // Return a new cluster object with default names
            return {
                gigs: cluster,
                posterName: fetchedPosterName,
                nameSuggestions: fetchedNameSuggestions,
                id: index
            };
        })
    );

    // --- NEW STEP 3: Update trip suggestions and set routes with fetched names ---
    // Set the state *again* with the clusters that now have fetched names
    setTripSuggestions(clustersWithFetchedNames);

    // Now set the calculated routes state with the final clusters (including fetched names)
    setCalculatedRoutes(clustersWithFetchedNames);

    // Indicate that suggestion request is complete
    setIsSuggestionRequestTriggered(false);
}