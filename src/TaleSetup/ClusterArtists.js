import { FetchName } from './../Odyssey/FetchName.js';

// Helper function: calculate Euclidean distance
function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.location.gpsCoordinate.coords.latitude - b.location.gpsCoordinate.coords.latitude, 2) + Math.pow(a.location.gpsCoordinate.coords.longitude - b.location.gpsCoordinate.coords.longitude, 2));
}

// Helper function: calculate time difference
function calculateTimeDifference(timeA, timeB) {
    return Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime());
}
// Group events based on proximity, ensuring unique artistId in each cluster
function groupByProximityWithUniqueArtists(events, distanceThreshold, timeThreshold) {

    events.sort((a, b) => a.date.localeCompare(b.date)); // Sort by event time first
    const clusters = [];
    const visited = new Set();

    events.forEach(event => {
        if (!visited.has(event.id)) {
            let cluster = [event];
            let lastEvent = event;
            visited.add(event.id);

            events.forEach(otherEvent => {
                if (!visited.has(otherEvent.id)) {
                    const distance = calculateDistance(lastEvent, otherEvent);
                    const timeDifference = calculateTimeDifference(lastEvent.date, otherEvent.date);

                    if (distance <= distanceThreshold && timeDifference <= timeThreshold) {
                        cluster.push(otherEvent);
                        visited.add(otherEvent.id);
                        lastEvent = otherEvent; // Ensure we prioritize forward movement
                    }
                }
            });

            if (cluster.length > 2 && cluster.length < 6) {
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
    let clusters = groupByProximityWithUniqueArtists(updatedGigs, distanceThreshold, timeThreshold);

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

    clusters = clusters.filter(cluster => cluster.length > 1);
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
    // Note: We don't setCalculatedRoutes here yet, as it likely needs the fetched names

    // --- NEW STEP 2: Fetch names asynchronously for each cluster ---
    // Map over the clusters to asynchronously fetch names
    const clustersWithFetchedNames = await Promise.all(
        clusters.map(async (cluster, index) => {
            const nameInput = cluster.map(({ title, artist, location, date }) => ({
                title: title.substring(0, 250),
                artist,
                date,
                venue: location.name,
                city: location.address
            }));

            let fetchedPosterName = `suggestion ${index + 1}`; // Default if fetch fails
            let fetchedNameSuggestions = [];

            try {
                const suggestions = await FetchName(nameInput);
                if (suggestions && suggestions.length >= 1) {
                    fetchedPosterName = `${suggestions[0].title}`;
                    fetchedNameSuggestions = suggestions.slice(1);
                }
            } catch (error) {
                console.error(`Error fetching name for suggestion ${index + 1}:`, error);
                // Keep default name on error
            }

            // Return a new cluster object with fetched (or default) names
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