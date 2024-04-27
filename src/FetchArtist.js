export const FetchArtist = async (artistName) => {
  const response = await fetch(
    `${process.env.REACT_APP_BACKEND}/FindArtistWithShows/GetArtistsByName?artistName=${artistName}`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json;charset=utf-8",
      },
    }
  );
  console.log(`response status code: ${response.status}`);
  if (response.status === 200) {
    let resJson = await response.json();
    console.log(`artist count: ${resJson.length}`);
    resJson = resJson.filter((value) => value.images.length > 0);
    console.log(`artist count: ${resJson.length}`);
    return resJson;
  }
  return;
};
