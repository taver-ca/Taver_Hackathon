const { AzureOpenAI } = require("openai");
// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
const apiKey = process.env["AZURE_OPENAI_API_KEY"];
const instructions = process.env["AI_INSTRUCTIONS"];
const apiVersion = "2024-08-01-preview";
const deployment = "gpt-4o-mini"; //This must match your deployment name.

export const FetchName = async (concerts) => {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

    let inputstring = concerts.map(concert => JSON.stringify(concert)).join(', ');
    const result = await client.chat.completions.create({
        response_format:{ "type": "json_object" },
        messages: [
            { role: "system", content: instructions },
            { role: "user", content: inputstring },
        ],
        model: "",
    }).catch((err) => {
        console.error("The sample encountered an error:", err);
    });
    ;

    for (const choice of result.choices) {
        console.log(choice.title);
    }

    return result;

};
