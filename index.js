import 'dotenv/config';
import express, { text } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen (PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if(!Array.isArray(conversation)) throw new Error('Conversation must be an array.');

        const contents = conversation.map(({ role, text }) => ({ 
            role, 
            parts: [{ text }] 
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
        });
        
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: 'Failed to generate text' });
    }
});