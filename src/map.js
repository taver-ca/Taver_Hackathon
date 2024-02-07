import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, InfoWindowF, MarkerF, PolylineF } from "@react-google-maps/api";

const concertToMarker = (concert) => {
  return {
    id: concert.title + concert.date,
    name: concert.title,
    artistImageUrl: concert.image.url,
    position: {
      lat: concert.location.latitude,
      lng: concert.location.longitude,
    },
  };
};

let pathOptions = {};



function Map({ concerts, userLocation, mapStyle }) {
  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef(null);
  const mapBoundsRef = useRef(null);
  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const markers = concerts.map(concertToMarker);

  const handleOnLoad = (map) => {
    const bounds = new google.maps.LatLngBounds(); // eslint-disable-line
    if (userLocation) {
      bounds.current.extend({
        lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
        lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
      });
    }
    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
    console.log("Placed Markers" + markers);

    pathOptions = {
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
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
            fillColor: "#FF0000",
            strokeColor: "#FF0000",
          },
          offset: "100%",
          repeat: "100px",
        },
      ],
    };
    mapBoundsRef.current = bounds;
    mapRef.current = map;
  };

  const path =
    userLocation !== null
      ? [
        {
          lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
          lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
        },
        ...concerts.map((concert) => ({
          lat: concert.location.latitude,
          lng: concert.location.longitude,
        })),
      ]
      : concerts.map((concert) => ({
        lat: concert.location.latitude,
        lng: concert.location.longitude,
      }));



  useEffect(() => {
    if (mapRef.current !== null && mapBoundsRef.current !== null) {
      markers.forEach(({ position }) => mapBoundsRef.current.extend(position));

      if (userLocation) {
        mapBoundsRef.current.extend({
          lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
          lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
        });
      }
      mapRef.current.fitBounds(mapBoundsRef.current);
      mapRef.current.setCenter(mapBoundsRef.current.getCenter());
    }
  }, [markers]);

  const output = concerts.map((concert) => ({ artist: concert.artist, date: concert.date, location: concert.location }));

  console.log(output);

  return (
    <GoogleMap
      key={[mapStyle]}
      onLoad={handleOnLoad}
      onClick={() => setActiveMarker(null)}
      options={{ mapId: mapStyle, minZoom: 3, maxZoom: 5 }}
      mapContainerStyle={{ width: "100vw", height: "100vh" }} y
    >
      {userLocation && (
        <MarkerF
          position={{
            lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
            lng: Number(parseFloat(userLocation.coords.longitude).toLocaleString(4)),
          }}
          icon={{
            url: "https://cdn-icons-png.flaticon.com/512/6676/6676575.png",
            scaledSize: { width: 35, height: 35 },
          }}
        />
      )}

      {markers &&
        markers.map(({ id, name, position, artistImageUrl }) => (
          <MarkerF
            key={id}
            position={position}
            icon={{ url: artistImageUrl, scaledSize: { width: 35, height: 35 } }}
            onClick={(e) => {
              e.stop();
              handleActiveMarker(id);
            }}
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

      <PolylineF path={path} options={pathOptions} />
    </GoogleMap>
  );
}

export default Map;
