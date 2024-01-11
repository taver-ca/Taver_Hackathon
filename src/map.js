import React, { useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, PolylineF } from "@react-google-maps/api";

const concertToMarker = (concert) => {
  return {
    id: concert.title + concert.date,
    name: concert.title,
    artistImageUrl: concert.image.url,
    position: {
      lat: concert.location.latitude,
      lng: concert.location.longitude
    }
  };
}

let pathOptions = {};

let result = [];

function sortConcerts(concerts, startingLocation) {

  console.log("concerts left to go:");
  console.log(concerts);
  console.log("concert 0 location:");
  //console.log(concerts[0].location);
  console.log("starting location:");
  console.log(startingLocation);


  if (concerts.length === 0) {
    return;
  }

  concerts = concerts.sort((a, b) => {
    if (new Date(a.date) === new Date(b.date)) {
      return getDistance(startingLocation.lat, startingLocation.lng, a.lat, a.lng) - getDistance(startingLocation.lat, startingLocation.lng, b.lat, b.lng);
    }
    return new Date(a.date) - new Date(b.date);
  });
  
  // go to this concert 
  result.push(concerts[0]);

  sortConcerts(concerts.filter(concert => concert.artist != concerts[0].artist), concerts[0].location)
}

// Convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Calculate the distance between two points using the haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  var earthRadius = 6371; // Radius of the earth in km
  var dLat = degreesToRadians(lat2 - lat1); // Difference of latitude in radians
  var dLon = degreesToRadians(lon2 - lon1); // Difference of longitude in radians
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2); // Haversine formula
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Angular distance in radians
  var d = earthRadius * c; // Distance in km
  return d;
}

function Map({ concerts, userLocation }) {
  const [activeMarker, setActiveMarker] = useState(null);
  // clear the concert corting from before, so the path can be recalculated
  result = [];
  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  sortConcerts(concerts, userLocation);


  const markers = result.map(concertToMarker);

  const handleOnLoad = (map) => {
    const bounds = new google.maps.LatLngBounds(); // eslint-disable-line
    markers.forEach(({ position }) => bounds.extend(position));

    if (userLocation) {
      bounds.extend({
        lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
        lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4))
      });
    }

    map.fitBounds(bounds);
    console.log('Placed Markers' + markers);

    pathOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      radius: 30000,
      zIndex: 1,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, // eslint-disable-line
            fillColor: '#FF0000',
            strokeColor: '#FF0000',
          },
          offset: '100%',
          repeat: '100px',
        }
      ]
    };
  };


  const path = userLocation != null ? [
    {
      lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
      lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4))
    }, ...result.map(concert => (
      {
        lat: concert.location.latitude,
        lng: concert.location.longitude
      }
    ))] : result.map(concert => (
      {
        lat: concert.location.latitude,
        lng: concert.location.longitude
      }
    ));

  //console.log('Concerts' + JSON.stringify(result.map(concert => {concert.date, concert.location, concert.art})));
  const output = result.map(concert => ({ artist: concert.artist, date: concert.date, location: concert.location }));

  console.log(output);

  return (
    <GoogleMap
      onLoad={handleOnLoad}
      onClick={() => setActiveMarker(null)}
      options={{ mapId: "1fc21c527f198d4e" }}
      mapContainerStyle={{ width: "100vw", height: "100vh" }}
    >{
        userLocation &&
        <MarkerF
          position={{ lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)), lng: Number(parseFloat(userLocation.coords.longitude).toLocaleString(4)) }}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/6676/6676575.png',
            scaledSize: { width: 35, height: 35 }
          }}
        />
      }

      {markers && markers.map(({ id, name, position, artistImageUrl }) => (
        <MarkerF
          key={id}
          position={position}
          icon={{ url: artistImageUrl, scaledSize: { width: 35, height: 35 } }}
          onClick={(e) => { e.stop(); handleActiveMarker(id) }}
        >
          {activeMarker === id ? (
            <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
              <div className="info">
                <img src={artistImageUrl} width={45} height={45} className="artist" alt={name} />
                <div>{name}</div>
              </div>
            </InfoWindowF>
          ) : null}
        </MarkerF>
      ))}

      <PolylineF
        path={path}
        options={pathOptions}
      />
    </GoogleMap>

  );
}

export default Map;
