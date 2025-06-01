import Stack from '@mui/material/Stack';
import { useState, useEffect } from "react";

async function GetAccessToken() {
    try {
        const response = await fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': process.env.REACT_APP_SPOTIFY_CLIENTID,
                'client_secret': process.env.REACT_APP_SPOTIFY_CLIENTSECRET
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const expiresAt = Date.now() + data.expires_in * 1000;
        const accessToken = { ...data, expiresAt };

        localStorage.setItem('spotifyAccessToken', JSON.stringify(accessToken));

        return accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error);
        return null;
    }
}



const PlaylistSource = ({ playlistId }) => {

    const [playlistImageUrl, setPlaylistImageUrl] = useState('');

    useEffect(() => {
        const fetchPlaylistImage = async () => {
            let token = JSON.parse(localStorage.getItem('spotifyAccessToken'));

            if (!token || Date.now() >= token.expiresAt) {
                token = await GetAccessToken();
                if (!token) return; // Handle token fetch failure
            }

            try {
                const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                setPlaylistImageUrl(data[0]?.url || '');
            } catch (error) {
                console.error('Error fetching playlist image:', error);
            }
        };

        if (playlistId) fetchPlaylistImage();
    }, [playlistId]);




    return (
         <Stack spacing={2} alignItems="center">
             {playlistId && (
            <>
                {playlistImageUrl && (
                    <img
                        width="150px"
                        src={playlistImageUrl}
                        alt="Playlist Cover"
                        style={{ borderRadius: '8px' }}
                    />
                )}
                <img
                    width="150px"
                    src={`https://scannables.scdn.co/uri/plain/jpeg/e2e900/black/640/spotify:user:spotify:playlist:${playlistId}`}
                    alt="Spotify Code"
                    style={{ borderRadius: '8px' }}
                />
            </>
        )}
        </Stack>
    );
}



export default PlaylistSource;