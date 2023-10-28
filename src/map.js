import React, { useState } from "react";
import { GoogleMap, InfoWindow, MarkerF, PolylineF } from "@react-google-maps/api";

const concertToMarker = (concert) => {
  return {
    id: concert.title + concert.date,
    name: concert.title,
    position: {
      lat: concert.location.latitude,
      lng: concert.location.longitude
    }
  };
}

let pathOptions = {};

function Map({ artist, concerts }) {
  const [activeMarker, setActiveMarker] = useState(null);

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const markers = concerts.map(concertToMarker);

  const handleOnLoad = (map) => {
    const bounds = new google.maps.LatLngBounds(); // eslint-disable-line
    markers.forEach(({ position }) => bounds.extend(position));
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
          repeat: '20px',
        }
      ]
    };
  };

  const sortedConcerts = concerts.sort((a, b) => new Date(a.date) - new Date(b.date));
  const path = sortedConcerts.map(concert => (
    {
      lat: concert.location.latitude,
      lng: concert.location.longitude
    }
  ));

  console.log('Concerts' + JSON.stringify(concerts.map(concert => concert.date)));
  console.log('Path' + JSON.stringify(path));

  return (
    <GoogleMap
      key={artist}
      onLoad={handleOnLoad}
      onClick={() => setActiveMarker(null)}
      mapContainerStyle={{ width: "100vw", height: "100vh" }}
    >
      {markers.map(({ id, name, position }) => (
        <MarkerF
          key={id}
          position={position}
          onClick={() => handleActiveMarker(id)}
        >
          {activeMarker === id ? (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div>{name}</div>
            </InfoWindow>
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
