
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

console.log("Checking API Key:", API_KEY ? "Present (" + API_KEY.substring(0, 5) + "...)" : "Missing");

async function testGemini() {
    if (!API_KEY) {
        console.error("No API key found in .env.local");
        return;
    }

    // NOTE: The code uses "gemini-flash-latest". 
    // Standard valid models are "gemini-1.5-flash", "gemini-1.5-pro", or "gemini-pro" (legacy).
    // "gemini-flash-latest" might be invalid.
    const modelName = "gemini-flash-latest";
    console.log("Testing Model:", modelName);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        const prompt = "Explain what a playlist is in 5 words.";
        const result = await model.generateContent(prompt);
        console.log("AI Response:", result.response.text());
    } catch (error) {
        console.error("AI Error:", error.message);
        if (error.response) {
            console.error("Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
