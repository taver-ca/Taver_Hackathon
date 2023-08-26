const axios = require('axios');

const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const auth_token = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');

function getAuth() {
    'curl -X POST "https://accounts.spotify.com/api/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials&client_id=7d554dfc7bac43a59a011ad2ee5762e1&client_secret=9a657d6de9a84f8b91b6a673cdb4ae77"'

    'access_token":"BQD9eCDhiC8JznCbsrk_VNc7ARtRnfgSdruh3tZb25TeepU3OlYpKsuG0DeLeTN8qJ80cdmOKQSRr1hB7JhdBma9V_bys_0-FDNgsGkhT4XP8aV1nt4","token_type":"Bearer","expires_in":3600}'

    return `Bearer BQCB9c8-jfPF0jjm2YUYWhTYiimtj81bea2_wq-DM_1FevoxVZBsW5ayMHGB4RKQMrZAdqYawx9os1dYUrHBxQq4k6d8_v-X5zcoIgoQDj51QnoKJwk`;
}

module.exports = { getAuth };