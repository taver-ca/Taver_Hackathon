export const FetchName = async (concerts, setPosterName, setPosterNameSuggestions) => {    
    const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/GetTripTitleSuggestion`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(concerts),
        }
      );
      console.log(`response status code: ${response.status}`);
      if (response.status === 200) {
        let resJson = await response.json();        
        setPosterName(resJson[0]);
        setPosterNameSuggestions(resJson);
      }
      return;
};
