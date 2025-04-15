export const FetchArtist = async (artistName, startDate, endDate) => {
  const response = await fetch(
    `${process.env.REACT_APP_BACKEND}/GetArtistsByName`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=utf-8",
      },

      body: JSON.stringify({
        artistName: artistName,
        startDate: startDate,
        endDate: endDate
      })
    }
  );
  console.log(`response status code: ${response.status}`);
  if (response.status === 200) {
    let resJson = await response.json();
    console.log(`artist count: ${resJson.length}`);
    resJson = resJson.filter((value) => value.images.length > 0);
    console.log(`artist count after removing artists with no profile picture: ${resJson.length}`);
    return resJson;
  }
  return;
};
