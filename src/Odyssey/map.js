import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { GoogleMap, InfoWindowF, MarkerF, MarkerClusterer } from "@react-google-maps/api";
import { Card, Avatar, CardHeader } from "@mui/material";
import Box from '@mui/material/Box';

const screenWidth = window.innerWidth;
// Offset by a percentage of screen width (e.g., 10%)
const panAmount = screenWidth > 600 ? -(screenWidth * 0.1) : 0; // Moves left by 10% of screen width

function UpdateMapZoomAndPath(mapRef, mapBoundsRef, polylineRef, userLocation, markers, mapStyleId, activeMarker, path) {

  console.log(`map styleId: ${mapStyleId}`);
  mapBoundsRef.current = new window.google.maps.LatLngBounds();
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
    mapRef.current.panBy(panAmount, 0);
  });

  if (activeMarker === null) {
    console.log("fitBounds");
    mapRef.current.fitBounds(mapBoundsRef.current, 20);
  }
  else {
    var index = markers.findIndex(marker => marker.id === activeMarker);
    if (index !== -1) {
      var centerMarker = markers[index];
      mapRef.current.setCenter(centerMarker.position);
      mapRef.current.setZoom(17);
    }
    else {
      mapRef.current.fitBounds(mapBoundsRef.current, 20);
    }
  }

  console.log("updating path");
  polylineRef.current.setPath(path);
  polylineRef.current.setMap(mapRef.current);
}

function ResetMapView(mapRef, mapBoundsRef) {
  mapRef.current.fitBounds(mapBoundsRef.current, 20);
  mapRef.current.panBy(panAmount, 0);
}


const concertToMarker = (concert, index) => {
  return {
    id: index,
    name: concert.title,
    artistImageUrl: concert.image != null ? concert.image.url : window.location.origin + "/Taver.png",
    address: concert.location.name,
    position: {
      lat: concert.location.gpsCoordinate.coords.latitude,
      lng: concert.location.gpsCoordinate.coords.longitude,
    },
  };
};

const containerStyle = {
  width: "100vw",  // Full width of screen
  height: "100vh", // Full height of screen
  position: "relative",
};

const mapContainerStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};


const adjustCoordinates = (markers) => {
  const offsetAmount = 0.0005; // Tiny shift (~11 meters)
  const randomFactor = () => (Math.random() - 0.5) * offsetAmount * 2; // Random value between -offsetAmount and +offsetAmount

  return markers.map((marker, index, arr) => {
    const duplicates = arr.filter((m) =>
      m.position.lat === marker.position.lat && m.position.lng === marker.position.lng
    );

    if (duplicates.length > 1) {
      return {
        ...marker,
        position: {
          lat: marker.position.lat + randomFactor(),
          lng: marker.position.lng + randomFactor(),
        },
      };
    }

    return marker;
  });
};

const Map = forwardRef(({ concerts, userLocation, mapStyle }, ref) => {

  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef(null);
  const mapBoundsRef = useRef(null);
  const polylineRef = useRef(null);
  const rawMarkers = concerts.map(concertToMarker);
  //filter out duplicate shows 
  let markers = rawMarkers.filter((item, index, self) => index === self.findIndex((t) => (t.name === item.name && t.address === item.address)));

  //artifically adjust coordinates to avoid marker overlap
  markers = adjustCoordinates(markers);


  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };


  //allow outside components to call these functions
  useImperativeHandle(ref, () => ({
    handleResetMapView: () => {
      ResetMapView(mapRef, mapBoundsRef, markers);
    },
    handleShowActiveConcert: (index) => {
      if (!index) { handleActiveMarker(null); }
      handleActiveMarker(index);
    },
    handleClearActiveMarker: () => {
      setActiveMarker(null);
    }
  }));



  const mapStyleId = mapStyle;
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

    mapBoundsRef.current = bounds;
    mapRef.current = map;
    polylineRef.current = new google.maps.Polyline(pathOptions); // eslint-disable-line
    UpdateMapZoomAndPath(mapRef, mapBoundsRef, polylineRef, userLocation, markers, mapStyleId, activeMarker, path);
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
    console.log("condition check");
    if (mapRef.current !== null && mapBoundsRef.current !== null && polylineRef.current !== null) {
      UpdateMapZoomAndPath(mapRef, mapBoundsRef, polylineRef, userLocation, markers, mapStyleId, activeMarker, path);
    }
  }, [markers, mapStyleId]);

  return (
    <Box sx={containerStyle}>
      <GoogleMap
        style={{ overflow: "visible" }}
        key={[mapStyle]}
        onLoad={handleOnLoad}
        options={{
          mapId: mapStyle,
          minZoom: 0,
          maxZoom: 17,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          restriction: {
            latLngBounds: {
              west: 180,
              east: -180,
              north: 90,   // North Pole
              south: -90,  // South Pole
            },
            strictBounds: true,
          },
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
          gridSize={20}
          maxZoom={10}
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
                        <Card sx={{ display: "flex", alignItems: "center", maxWidth: 345, position: "relative" }}>
                          <CardHeader
                            avatar={<Avatar src={artistImageUrl} alt={name} sx={{ width: 45, height: 45 }} />}
                            title={name}
                            subheader={address}
                          >
                          </CardHeader>
                        </Card>
                      </InfoWindowF>
                    ) : null}
                  </MarkerF>
                ))}
            </div>
          )}
        </MarkerClusterer>
      </GoogleMap>
    </Box>);
});

export default Map;
