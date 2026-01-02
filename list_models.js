
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

async function listModels() {
    // We can't use the SDK's listModels easily without a specialized client sometimes, 
    // but let's try the direct REST call via fetch if SDK is opaque, 
    // OR just use the SDK if it exposes it. 
    // Actually the GoogleGenerativeAI class doesn't have listModels on the instance usually.

    // Let's use raw fetch to be sure.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
