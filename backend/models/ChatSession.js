import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "ai"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatSession", ChatSessionSchema);
