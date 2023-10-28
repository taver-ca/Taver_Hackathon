import React, { useState } from "react";
import { GoogleMap, InfoWindow, MarkerF } from "@react-google-maps/api";

const concertToMarker = (concert) => {
  return {
    id: concert.title,
    name: concert.title,
    position: {
      lat: concert.location.latitude,
      lng: concert.location.longitude
    }
  };
}

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
  };

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
    </GoogleMap>
  );
}

export default Map;
