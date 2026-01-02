
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("No .env.local found");
    process.exit(1);
}

const key = process.env.GOOGLE_GEMINI_API_KEY;
if (!key) {
    console.error("No GOOGLE_GEMINI_API_KEY found in .env.local");
    process.exit(1);
}


async function check() {
    console.log("Testing specific candidates from the available list...");
    const genAI = new GoogleGenerativeAI(key);
    const candidates = ["gemini-2.0-flash", "gemini-flash-latest"];

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS! (Response: ${response.text().substring(0, 20)}...)`);
        } catch (error) {
            console.log(`❌ Error: ${error.message.split('\n')[0]}`);
        }
    }
}

check();
