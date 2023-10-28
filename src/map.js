import React, { useState } from "react";
import { GoogleMap, InfoWindow, MarkerF } from "@react-google-maps/api";

const concertToMarker = (concert) => {
  return {
    id: concert.title,
    name: concert.title,
    artistImageUrl: concert.image.url,
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
      {markers.map(({ id, name, position, artistImageUrl }) => (
        <MarkerF
          key={id}
          position={position}
          icon={{url: artistImageUrl, scaledSize: { width: 35, height: 35} }}
          onClick={(e) => { e.stop(); handleActiveMarker(id)}}
        >
          { activeMarker === id ? 
          (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div className="info">
                <img src={artistImageUrl} width={45} height={45} className="artist"/>
                <div>{name}</div>
              </div>
            </InfoWindow>
          ) : null}
        </MarkerF>
      ))}
    </GoogleMap>
  );
}

export default Map;
