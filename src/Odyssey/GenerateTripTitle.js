import { FetchName } from "./FetchName";

export const GenerateTripTitle = async function (posterNameSuggestions,
    concerts,
    posterName,
    setPosterName,
    setPosterNameSuggestions,
    setIsLoading) {

    if (posterNameSuggestions.length < 1 && !posterName) {
        // send a request to openAI
        // attach the conerts, but strip the GPS data, that is not very useful for suggesting trip titles
        // New list with only 'title', 'artist', 'venue', 'city' and 'date' fields 
        const newList = concerts.map(({ title, artist, location, date }) => ({ title, artist, date, venue: location.name, city: location.address }));
        setIsLoading(true);
        // now make a request and send it to open AI
        var suggestions = await FetchName(newList);
        if (suggestions.length >= 1) {
            setPosterName(suggestions[0].title);
        }
        if (suggestions.length >= 2) {
            setPosterNameSuggestions(suggestions.slice(1));
        }
        setIsLoading(false);
    }
    else {
        if(!posterName)
        {
            setPosterName(posterNameSuggestions[0].title);
            setPosterNameSuggestions(posterNameSuggestions => posterNameSuggestions.slice(1));
        }       
    }
};