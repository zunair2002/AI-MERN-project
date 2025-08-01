const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const cors = require('cors');
require('dotenv').config(); 

app.use(express.json());
app.use(cors());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("ERROR: API_KEY .env file mein nahi mili.");
    process.exit(1); 
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("Server is ready to accept requests.");

app.post('/getdata', async (req, res) => {
    const { prompt } = req.body; 

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ response: text });

    } catch (error) {
        console.error("Error during API call:", error); 
        res.status(500).json({ error: "Failed to get response from AI." });
    }
});

module.exports = app;