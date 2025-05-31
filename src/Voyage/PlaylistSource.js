const PlaylistSource = ({ playlistId }) => {






    return (<div>
        {playlistId && <img width='200px' src={`https://scannables.scdn.co/uri/plain/jpeg/e2e900/black/640/spotify:user:spotify:playlist:${playlistId}`}></img>}
    </div>
    );
}



export default PlaylistSource;