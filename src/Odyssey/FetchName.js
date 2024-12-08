export const FetchName = async (concerts) => {    
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
      if (response.status === 200) {
        let resJson = await response.json();    
        return resJson;    
      }
      return;
};
