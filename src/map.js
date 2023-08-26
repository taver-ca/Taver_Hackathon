const axios = require('axios');
const cheerio = require('cheerio');

const getArtistTourInformation = async () => {
	try {
		const { data } = await axios.get(
			'https://open.spotify.com/artist/6h1s4i4XKIYv4ErDelLDN0/concerts'
		);
        const $ = cheerio.load(data);
        const loaded = $('[type="application/ld+json"]');
		const obj = JSON.parse(loaded.text());
		return obj;
	} catch (error) {
		throw error;
	}
};

var artistTourInformation;//parsed JSON file
//load pageSetup
window.onload=pageSetup;

function pageSetup() {

  artistTourInformation = getArtistTourInformation();
	
	searchByStopName(artistTourInformation);
}

function searchByStopName(parsedRecord)
{
    //set up table
    var output="<tr><th>Artist</th><th>Tour Name</th><th><th>Latitude</th><th>Longitude</th><th>Map</th></tr>";
    var stopname; 
    var gmap;//creates hyperlink
    //modify searchdata to include
    var position="";//Use this to enter latitude and longitude and add this as a value to the Select radio button
    //begin search
    for(var i=0;i<parsedRecord.length;i++)
    {
        var record=parsedRecord[i];
            //check
            stopname=record.stop_name;//assign
            if(stopname.startsWith(parsedRecord))//partial match on string
            {
                output+="<tr><td>";
                output+=record.stop_name;
                output+="</td><td>"
                output+=record.route_long_name;
                output+="</td><td>";
                output+=record.point.coordinates[1];
                //add latitude to postition
                position=record.point.coordinates[1];
                position+=","
                output+="</td><td>";
                output+=record.point.coordinates[0];
                //add longitude to position
                position+=record.point.coordinates[0];
                output+="</td><td>";

                //create hyperlink gmap
                gmap ="<a href=https://www.google.com/maps/search/?api=1&query="+position+" target=_blank>Click here to see map</a> ";              
                output+=gmap;
                output+="</td></tr>";
            }
    }
    document.getElementById("searchresults").innerHTML=output;

}