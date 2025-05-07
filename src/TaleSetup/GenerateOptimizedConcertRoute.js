// Convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function getTotalDistance(concerts, userLocation) {

  if (concerts.length <= 0) {
    return 0;
  }

  let totalDistance = 0;

  //consider distance between userlocation and the first location of the concert
  var originPoint = {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
  };
  //console.log(`concert: ${JSON.stringify(concerts[0])}`);

  var firstPoint = { latitude: concerts[0].location.latitude, longitude: concerts[0].location.longitude };


  totalDistance += distanceInKmBetweenEarthCoordinates(originPoint.latitude, originPoint.longitude, firstPoint.latitude, firstPoint.longitude);

  for (let i = 2; i < concerts.length; i++) {
    const prevPoint = { latitude: concerts[i - 1].location.latitude, longitude: concerts[i - 1].location.longitude };
    const currPoint = { latitude: concerts[i].location.latitude, longitude: concerts[i].location.longitude };

    totalDistance += distanceInKmBetweenEarthCoordinates(
      prevPoint.latitude, prevPoint.longitude,
      currPoint.latitude, currPoint.longitude
    );
  }
  return totalDistance;
}

// Calculate the distance in kilometers between two coordinates
function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}



function generateCombinations(dictionary) {
  const keys = Object.keys(dictionary);
  const result = [];

  function backtrack(combination, index, lastDate, lastLocation, lastTitle) {
    if (index === keys.length) {
      result.push([...combination]);
      return;
    }

    const key = keys[index];
    const values = dictionary[key];

    for (const value of values) {
      const concertDate = new Date(value.date);
      if (concertDate >= lastDate && (concertDate !== lastDate || (value.location.name === lastLocation.name && value.location.address === lastLocation.address && value.title === lastTitle))) {
        combination.push(value);
        backtrack(combination, index + 1, concertDate, value.location, value.title);
        combination.pop();
      }
    }
  }

  backtrack([], 0, new Date(0), { name: null, address: null }, null);
  return result;
}

export const GenerateOptimizedConcertRoute = (
    allConcerts,
    userLocation,
    artistWishlist,
    setArtistWishlist,
    setConcerts) => {
    //generate an optimized route based on existing concerts saved and the artist wishlist, with consideration to user current location
    //console.log(`generate optimized concert route for the current selected artist`);
    //console.log(JSON.stringify(artistWishlist));
    //filter out concerts that are not performed by the artists from the artist wish list
    //allow concert with duplicate id at this stage, inform user of the dupcliate at the end
    var initialFilteredConcerts = allConcerts.filter((concert) => {
        return artistWishlist.some(artistWishlistItem => artistWishlistItem.WishlistArtistId === concert.artistId)
    });
    //group the concerts by artistId
    var groupedByArtistConcertList = initialFilteredConcerts.reduce((r, a) => {
        r[a.artistId] = r[a.artistId] || [];
        r[a.artistId].push(a);
        return r;
    }, Object.create(null));

    //this should be a dictionary
    //console.log(`groupedbyartistconcertlist: ${JSON.stringify(groupedByArtistConcertList)}`);

    // figure out all the possible combination of the shows 
    // thanks stackoverflow, I'm not writing up this shit.
    // https://stackoverflow.com/questions/4331092/finding-all-combinations-cartesian-product-of-javascript-array-values
    // this needs to be a list of list
    var allCombinationOfConcerts = generateCombinations(groupedByArtistConcertList);

    if (allCombinationOfConcerts.length < 1) {
        alert(`Unable to schedule a plan for the artists you want to see, their schedules conflict with each other`);
        //remove the last attempted artist that was causing problem and run the optimization again
        setArtistWishlist(artistWishlist.slice(0, -1));
        GenerateOptimizedConcertRoute(allConcerts, userLocation, artistWishlist.slice(0, -1));
    }

    //now sort the remaining by max distance traveled
    allCombinationOfConcerts = allCombinationOfConcerts.sort((a, b) => {
        return getTotalDistance(a, userLocation) - getTotalDistance(b, userLocation);
    });

    //pick the route with the shortest distance
    // this need to be a list
    console.log(`allCombinationOfConcerts[0]: ${JSON.stringify(allCombinationOfConcerts[0])}`);

    if (allCombinationOfConcerts.length > 1) {
        var optimizedConcerts = allCombinationOfConcerts[0];
        setConcerts(optimizedConcerts);
    }
}