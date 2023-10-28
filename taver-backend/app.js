const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const dotenv = require("dotenv");

const { getAuth } = require('./auth');

dotenv.config();

const app = express()
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const port = 3001

const api = SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID,
    process.env.SPOTIFY_CLIENT_SECRET
);

const getArtist = async (query) => {
    const items = await api.search(query, ["artist"]);

    return items.artists.items[0];
};

const getConcertData = async (id) => {
    try {
        const { data } = await axios.get(
            `https://open.spotify.com/artist/${id}/concerts`
        );
        const $ = cheerio.load(data);
        const loaded = $('[type="application/ld+json"]');
        const obj = JSON.parse(loaded.text());

        let results = [];

        for (let i = 1; i < obj['@graph'].length - 1; i++) {
            const concert_details = obj['@graph'][i];
            results.push({
                title: concert_details.name,
                date: concert_details.startDate,
                location: {
                    name: concert_details.location.name,
                    latitude: concert_details.location.latitude,
                    longitude: concert_details.location.longitude,
                }
            });
        }
        return results;
    } catch (error) {
        throw error;
    }
};

app.post('/concerts', async function (req, res) {
    try {
        console.log(req.body.artistName);
        let query = req.body.artistName;

        // const spotify_config = {
        //     headers: {
        //         'Authorization': getAuth()
        //     }
        // };
        // let response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist`, spotify_config);
        // const artist = response.data.artists.items[0]

        const artist = await getArtist(query);
        let concert_response = await getConcertData(artist.id);
        res.send(concert_response)
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500);
    }

})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})