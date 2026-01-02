
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

console.log("Checking API Key:", API_KEY ? "Present" : "Missing");

async function testGemini() {
    if (!API_KEY) return;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Use 1.5-flash which is standard now? Or 1.5-pro? 
    // Code uses "gemini-flash-latest". Let's verify if that model name exists or if we should use "gemini-1.5-flash"

    console.log("Testing Model: gemini-flash-latest");

    try {
        const prompt = "Explain what a playlist is in 5 words.";
        const result = await model.generateContent(prompt);
        console.log("AI Response:", result.response.text());
    } catch (error) {
        console.error("AI Error:", error);
    }
}

testGemini();
