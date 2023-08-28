import { useState } from "react";

export default function Input() {
  const [artistName, setArtistName] = useState("");
  const [message, setMessage] = useState("");

  let handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch("http://localhost:3001/concerts", {
        method: "POST",
        headers: {
          'content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          artistName: artistName,
        }),
      });
      let resJson = await res.json();
      if (res.status === 200) {
        message = resJson;
        setMessage("User created successfully"+message);
      } else {
        setMessage("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Enter Artist Name:
        <input
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  )
}
