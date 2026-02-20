import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==========================
// AI TUTOR
// ==========================
app.post("/ask", async (req, res) => {
  const { question, subject } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are an exam tutor for ${subject}.` },
        { role: "user", content: question }
      ]
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI tutor failed" });
  }
});

// ==========================
// AI VOICE OUTPUT
// ==========================
app.post("/voice", async (req, res) => {
  const { text } = req.body;
  try {
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

// ==========================
// MOCK EXAMS
// ==========================
app.post("/mock-exam", async (req, res) => {
  const { subject } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Generate 5 multiple-choice questions for ${subject} in JSON format like:
[{"question":"...","options":["A","B","C","D"],"answer":0}]`
        }
      ]
    });
    res.json({ exam: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mock exam generation failed" });
  }
});

// ==========================
// REVISION NOTES
// ==========================
app.post("/revision-notes", async (req, res) => {
  const { subject, topic } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Create exam-focused revision notes for ${topic} in ${subject}. 
Include key formulas, definitions, common mistakes, and memory tips.`
        }
      ]
    });
    res.json({ notes: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Revision notes generation failed" });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EduNova backend running on port ${PORT}`));
