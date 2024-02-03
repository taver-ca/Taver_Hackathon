import { useState, forwardRef, useImperativeHandle, useEffect } from "react";

const mapStyles = [
  { mapId: "1fc21c527f198d4e", displayName: "Default Theme", buttonColorCss: "0070d2" },
  { mapId: "53a5c2c14f51f10b", displayName: "Dark Theme", buttonColorCss: "#404040" },
];




const Input = forwardRef(({ setConcerts, setUserLocation, setMapStyle, startDate, endDate }, ref) => {

  useEffect(() => {
    function showPosition(position) {
      setUserLocation(position);
      console.log("home position: " + position.coords.latitude + "," + position.coords.longitude);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("failed");
    }
  }, []);

  useImperativeHandle(ref, () => ({
    handleRequestFromParent: (artistName) => {
      submitArtist(artistName);
    },
  }));

  const [artistName, setArtistName] = useState("Taylor Swift");



  const submitArtist = async (incomingArtistName) => {
    try {
      let res = await fetch(`${process.env.REACT_APP_BACKEND}/concerts`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          artistName: incomingArtistName,
          startDate: startDate,
          endDate: endDate
        }),
      });

      let resJson = await res.json();
      if (res.status === 200) {
        setConcerts((prev) => prev.concat(resJson));
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    submitArtist(artistName);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter Artist Name:</label>
        <div>
          <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>
        Map Style:{" "}
        <select name="mapStyle" id="mapStyle" onChange={(event) => setMapStyle(event.target.value)}>
          {mapStyles.map((mapStyle) => (
            <option key={mapStyle.mapId} value={mapStyle.mapId}>
              {mapStyle.displayName}
            </option>
          ))}
        </select>
      </div>      
    </div>
  );
});

export default Input;
