import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const api = () => {
  return SpotifyApi.withClientCredentials(
    process.env.SPOTIFY_CLIENT_ID,
    process.env.SPOTIFY_CLIENT_SECRET,
  );
};

export const getToken = async (code, code_verifier) => {
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.PLAYLISTIC_REDIRECT_URI,
      code_verifier: code_verifier,
    }),
  };

  const body = await fetch('https://accounts.spotify.com/api/token', payload);
  console.log('status: ');
  console.log(body.status);
  if (body.status == 200) {
    const response = await body.json();
    return response;
  }
  throw new Error('bad response for access token');
};

export const userApi = async (code: string, code_verifier: string) => {
  const token = await getToken(code, code_verifier);
  return SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID,
    token.access_token,
  );
};
export default api;
