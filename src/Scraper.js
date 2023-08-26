const axios = require('axios');
const cheerio = require('cheerio');

const getPostTitles = async () => {
	try {
		const { data } = await axios.get(
			'https://open.spotify.com/artist/6h1s4i4XKIYv4ErDelLDN0/concerts'
		);
        const $ = cheerio.load(data);
        const loaded = $('[type="application/ld+json"]');
		const obj = JSON.parse(loaded.text());
		return obj['@graph'][1].location;
	} catch (error) {
		throw error;
	}
};

getPostTitles()
    .then((postTitles) => console.log(postTitles));