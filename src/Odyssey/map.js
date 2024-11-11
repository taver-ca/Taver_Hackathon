import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { GoogleMap, InfoWindowF, MarkerF, MarkerClusterer } from "@react-google-maps/api";
import Box from '@mui/material/Box';
import { Margin } from "@mui/icons-material";

const concertToMarker = (concert) => {
  return {
    id: concert.title + concert.date,
    name: concert.title,
    artistImageUrl: concert.image.url,
    address: concert.location.name,
    position: {
      lat: concert.location.gpsCoordinate.coords.latitude,
      lng: concert.location.gpsCoordinate.coords.longitude,
    },
  };
};

const containerStyle = {
  width: '100%',
  paddingTop: '66.67%', // 3:2 aspect ratio 
  position: 'relative',
};
const mapContainerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
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
          lat: concert.location.gpsCoordinate.coords.latitude,
          lng: concert.location.gpsCoordinate.coords.longitude,
        })),
      ]
      : concerts.map((concert) => ({
        lat: concert.location.gpsCoordinate.coords.latitude,
        lng: concert.location.gpsCoordinate.coords.longitude,
      }));


  useEffect(() => {
    if (mapRef.current !== null && mapBoundsRef.current !== null && freshBoundsRef.current !== null && polylineRef.current !== null) {
      mapBoundsRef.current = freshBoundsRef.current;
      markers.forEach(({ position }) => {
        mapBoundsRef.current.extend(position);
      });

      if (userLocation) {
        mapBoundsRef.current.extend({
          lat: Number(parseFloat(userLocation.coords.latitude).toFixed(4)),
          lng: Number(parseFloat(userLocation.coords.longitude).toFixed(4)),
        });
      }

      // Ensure the map has finished adjusting to the bounds before getting the zoom level 
      window.google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
        const zoomLevel = mapRef.current.getZoom();
        console.log('Zoom Level:', zoomLevel);
        mapRef.current.setZoom(zoomLevel - 0.5);
      });

      if (activeMarker === null) {
        mapRef.current.fitBounds(mapBoundsRef.current, 10);
        mapRef.current.setZoom(mapRef.current.getZoom() - 0.5);
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
    <Box sx={containerStyle}>
      <GoogleMap
        style={{ overflow: "visible" }}
        key={[mapStyle]}
        onLoad={handleOnLoad}
        // onClick={() => setActiveMarker(null)}
        onBoundsChanged={{}}
        options={{
          mapId: mapStyle,
          minZoom: 1,
          maxZoom: 20,
          disableDefaultUI: true
        }}
        mapContainerStyle={mapContainerStyle}
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
            var pathCopy = [...path];
            // build the clusteringPolyline
            // get markerclusters with more than one marker inside them
            var clustersGreaterThanOne = clusterer.clusters.filter((cluster) => cluster.markers.length > 1);
            //console.log(`total number of clusters: ${clusterer.clusters.length}`);
            //console.log("cluster with more than 1 marker: ");
            clustersGreaterThanOne.forEach(cluster => console.log(cluster));

            // replace all points in each cluster in path with the center point
            clustersGreaterThanOne.forEach((cluster) => {
              let centerPoint = cluster.getCenter();
              let cleanedUpCenterPoint = { lat: centerPoint.lat(), lng: centerPoint.lng() };

              let clusterPoints = cluster.markers.map((marker) => {
                let markerPosition = marker.getPosition();
                return { lat: markerPosition.lat(), lng: markerPosition.lng() };
              });


              pathCopy.forEach((point, index) => {
                clusterPoints.forEach((clusterPoint) => {
                  if (clusterPoint.lat === point.lat && clusterPoint.lng === point.lng) {
                    pathCopy[index] = cleanedUpCenterPoint;
                  }
                });
              });
            });

            polylineRef.current.setPath(pathCopy);
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
    </Box>
  );
}

export default Map;
