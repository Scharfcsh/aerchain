import express from "express";
import { parseSpeechTask } from "../controller/speech.controller.js";
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from "../controller/notes.controller.js";

const noteRouter = express.Router();

// Health check or info
noteRouter.get("/speech", (req, res) => {
  res.json({ message: "Speech Recognition API" });
});

// Parse task from text
noteRouter.post("/speech", parseSpeechTask);

// Notes CRUD
noteRouter.post("/notes", createNote);
noteRouter.get("/notes", getNotes);
noteRouter.get("/notes/:id", getNoteById);
noteRouter.put("/notes/:id", updateNote);
noteRouter.patch("/notes/:id", updateNote);
noteRouter.delete("/notes/:id", deleteNote);

export default noteRouter;
