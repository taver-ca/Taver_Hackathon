const { AzureOpenAI } = require("openai");
// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "<endpoint>";
const apiKey = process.env["AZURE_OPENAI_API_KEY"] || "<api key>";
const apiVersion = "2024-05-01-preview";
const deployment = "gpt-4o"; //This must match your deployment name.

export const FetchName = async (concerts) => {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

    let inputstring = concerts.map(concert => JSON.stringify(concert)).join(', ');
    const result = await client.chat.completions.create({
        response_format:{ "type": "json_object" },
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: inputstring },
        ],
        model: "",
    }).catch((err) => {
        console.error("The sample encountered an error:", err);
    });
    ;

    for (const choice of result.choices) {
        console.log(choice.message);
    }



    const response = await fetch(
        `${REACT_APP_AI_URL}/GetArtistsByName/${artistName}`,
        {
            method: "GET",
            headers: {
                "content-type": "application/json;charset=utf-8",
            },
        }
    );
    console.log(`response status code: ${response.status}`);
    if (response.status === 200) {
        let resJson = await response.json();
        console.log(`artist count: ${resJson.length}`);
        resJson = resJson.filter((value) => value.images.length > 0);
        console.log(`artist count after removing artists with no profile picture: ${resJson.length}`);
        return resJson;
    }
    return;
};
