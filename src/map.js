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

function Map({ artist, concerts, userLocation }) {
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
          repeat: '100px',
        }
      ]
    };
  };

  const sortedConcerts = concerts.sort((a, b) => new Date(a.date) - new Date(b.date));
  const path = userLocation != null ? [
    { 
      lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
      lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)) 
    }, ...sortedConcerts.map(concert => (
    {
      lat: concert.location.latitude,
      lng: concert.location.longitude
    }
  ))] : sortedConcerts.map(concert => (
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
