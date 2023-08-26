import { useState } from "react";




export default function Input() {
    const [artistName, setArtistName] = useState("");
  
    let handleSubmit = async (e) => {
        e.preventDefault();
        try {
          let res = await fetch("/CreateMap", {
            method: "POST",
            body: JSON.stringify({
              artistName: artistName,
            }),
          });
          let resJson = await res.json();
          if (res.status === 200) {
            setName("");
            setEmail("");
            setMessage("User created successfully");
          } else {
            setMessage("Some error occured");
          }
        } catch (err) {
          console.log(err);
        }
      };

    return (
      <form onSubmit={handleSubmit}>
        <label>Enter Artist name: 
          <input
            type="text" 
            value={name}
            onChange={(e) => setArtistName(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    )
  }
