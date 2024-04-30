import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { GoogleMap, InfoWindowF, MarkerF, PolylineF, MarkerClusterer } from "@react-google-maps/api";

const concertToMarker = (concert) => {
  return {
    id: concert.title + concert.date,
    name: concert.title,
    artistImageUrl: concert.image.url,
    address: concert.location.address,
    position: {
      lat: concert.location.latitude,
      lng: concert.location.longitude,
    },
  };
};



function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

function Map({ concerts, userLocation, mapStyle }) {
  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef(null);
  const mapBoundsRef = useRef(null);
  const freshBoundsRef = useRef(null);
  const polylineRef = useRef(null);
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
      bounds.extend({
        lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
        lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
      });
    }
    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
    console.log("Placed Markers" + markers);

    let pathOptions = {
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

    freshBoundsRef.current = new google.maps.LatLngBounds(); // eslint-disable-line
    mapBoundsRef.current = bounds;
    mapRef.current = map;
    polylineRef.current = new google.maps.Polyline(pathOptions); // eslint-disable-line
  };

  var path =
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
    if (mapRef.current !== null && mapBoundsRef.current !== null && freshBoundsRef.current !== null && polylineRef.current !== null) {
      mapBoundsRef.current = freshBoundsRef.current;
      markers.forEach(({ position }) => mapBoundsRef.current.extend(position));

      if (userLocation) {
        mapBoundsRef.current.extend({
          lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
          lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
        });
      }

      if (activeMarker === null) {
        mapRef.current.fitBounds(mapBoundsRef.current, 10);
        mapRef.current.setZoom(3);
      }
      else {
        var index = markers.findIndex(marker => marker.id === activeMarker);
        var centerMarker = markers[index];
        mapRef.current.setCenter(centerMarker.position);
        mapRef.current.setZoom(10);
      }

      polylineRef.current.setPath(path);
      polylineRef.current.setMap(mapRef.current);
      //mapRef.current.setCenter(freshBoundsRef.current.getCenter());
    }
  }, [markers]);
  const [width, height] = useWindowSize();
  const output = concerts.map((concert) => ({ artist: concert.artist, date: concert.date, location: concert.location, address: concert.location.address }));

  console.log(output);

  return (
    <GoogleMap
      style={{ overflow: "visible" }}
      key={[mapStyle]}
      onLoad={handleOnLoad}
      // onClick={() => setActiveMarker(null)}
      options={{
        mapId: mapStyle,
        minZoom: 1,
        maxZoom: 20,
        disableDefaultUI: true
      }}
      mapContainerStyle={(width / height) >= 1 ? { width: "100wh", height: "50vh" } : { width: "100wh", height: "75vh" }}
    >
      {userLocation && (
        <MarkerF
          position={{
            lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
            // Changed from toLocale to toFixed for consistency
            lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
          }}
          icon={{
            url: "https://cdn-icons-png.flaticon.com/512/6676/6676575.png",
            scaledSize: { width: 35, height: 35 },
          }}
        />
      )}

      <MarkerClusterer
        ignoreHidden={false}
        onClusteringEnd={(clusterer) => {

          // build the clusteringPolyline
          // get cluster center points
          var markerClusters = clusterer.clusters;
          var markerClusterCenters = markerClusters.map((cluster) => {
            return cluster.getCenter();
          });        

          var clusterPath =
            userLocation !== null
              ? [
                {
                  lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
                  lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
                }
              ]
              : [];

          clusterPath = clusterPath.concat(markerClusterCenters);
          polylineRef.current.setPath(clusterPath);
        }}
      >
        {(clusterer) => (
          <div>
            {markers &&
              markers.map(({ id, name, position, artistImageUrl, address }) => (
                <MarkerF
                  key={id}
                  position={position}
                  icon={{ url: artistImageUrl, scaledSize: { width: 35, height: 35 } }}
                  clusterer={clusterer}
                  onClick={(e) => {
                    e.stop()
                    handleActiveMarker(id)
                  }}
                >
                  {activeMarker === id ? (
                    <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                      <div className="info">
                        <img src={artistImageUrl} width={45} height={45} className="artist" alt={name} />
                        <div><p style={{ color: 'black' }}>{name}</p><p style={{ color: 'black' }}>{address}</p></div>
                      </div>
                    </InfoWindowF>
                  ) : null}
                </MarkerF>
              ))}
          </div>
        )}
      </MarkerClusterer>
    </GoogleMap>

  );
}

export default Map;
