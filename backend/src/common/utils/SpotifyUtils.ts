import axios from 'axios';
import cheerio from 'cheerio';
import api from '../spotifyApi';

export const getArtist = async (name: string) => {
  const items = await api().search(name, ['artist']);
  return items.artists.items[0];
};

export const getConcertData = async (id) => {
  try {
    const { data } = await axios.get(
      `https://open.spotify.com/artist/${id}/concerts`,
    );
    const $ = cheerio.load(data);
    const loaded = $('[type="application/ld+json"]');
    const obj = JSON.parse(loaded.text());

    const results = [];

    if (obj['@graph'].length > 1) {
      const concert_details = obj['@graph'][1];
      results.push({
        title: concert_details.name,
        date: concert_details.startDate,
        location: {
          name: concert_details.location.name,
          latitude: concert_details.location.latitude,
          longitude: concert_details.location.longitude,
        },
      });
    }
    return results;
  } catch (error) {
    throw error;
  }
};
