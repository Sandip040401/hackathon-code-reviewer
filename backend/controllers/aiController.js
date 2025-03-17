import { OpenAI } from "openai";
import ChatSession from "../models/ChatSession.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const startChatSession = async (req, res) => {
  const sessionId = uuidv4();
  const newSession = new ChatSession({ sessionId, messages: [] });
  await newSession.save();
  res.json({ sessionId });
};

export const chatWithAI = async (req, res) => {
  const { sessionId, userMessage } = req.body;

  if (!sessionId || !userMessage) {
    return res.status(400).json({ error: "Session ID and message are required" });
  }

  try {
    let session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Add user message to session history
    session.messages.push({ role: "user", content: userMessage });
    await session.save();

    // Format messages for OpenAI
    const formattedMessages = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call OpenAI API
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: formattedMessages,
      temperature: 0.7,
    });

    const aiMessage = aiResponse.choices[0]?.message?.content || "No response from AI";

    // Store AI response in session
    session.messages.push({ role: "assistant", content: aiMessage });
    await session.save();

    res.json({ aiResponse: aiMessage, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI processing failed" });
  }
};
