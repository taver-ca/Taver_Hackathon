
function AuthorizeSpotify() {

    const generateRandomString = (length) => {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    };

    const sha256 = async (plain) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest("SHA-256", data);
    };

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    };

    async function getCodeCallenge() {
        const codeVerifier = generateRandomString(64);
        window.localStorage.setItem("code_verifier", codeVerifier);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);
        return codeChallenge;
    }

    let handleSpotifySignIn = () => {
        getCodeCallenge().then((result) => {
            window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_SPOTIFY_CLIENTID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.REACT_APP_REDIRECT_URL)}&scope=user-top-read%20&code_challenge_method=S256&code_challenge=${result}`;
        });
    };

    // Display spotify token 
    return (
        <div>
            <p>Authorize Spotify: </p>
            <button onClick={handleSpotifySignIn}>Sign in to Spotify</button>
        </div>
    );
}

export default AuthorizeSpotify;