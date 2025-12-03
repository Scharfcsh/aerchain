import express from "express";
import { parseSpeechTask } from "../controller/speech.controller.js";

const SpeechRouter = express.Router();

// Health check or info
SpeechRouter.get("/speech", (req, res) => {
  res.json({ message: "Speech Recognition API" });
});

// Parse task from text
SpeechRouter.post("/speech", parseSpeechTask);

export default SpeechRouter;
