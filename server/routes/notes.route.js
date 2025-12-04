import express from "express";
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from "../controller/notes.controller.js";

const noteRouter = express.Router();

// Notes CRUD
noteRouter.post("/notes", createNote);
noteRouter.get("/notes", getNotes);
noteRouter.get("/notes/:id", getNoteById);
noteRouter.put("/notes/:id", updateNote);
noteRouter.patch("/notes/:id", updateNote);
noteRouter.delete("/notes/:id", deleteNote);

export default noteRouter;
