import Note from "../models/notes.model.js";
import mongoose from "mongoose";

// Create a new note
export async function createNote(req, res) {
  try {
    const { title, description, status = "to-do", priority = "low", dueDate } = req.body || {};

    if (!title || !description || !dueDate) {
      return res.status(400).json({ error: "title, description and dueDate are required" });
    }

    const note = await Note.create({ title, description, status, priority, dueDate });
    return res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    return res.status(500).json({ error: "Failed to create note", details: err?.message || String(err) });
  }
}

// Get all notes (optional filters via query)
export async function getNotes(req, res) {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const notes = await Note.find(filter).sort({ dueDate: 1, createdAt: -1 });
    return res.status(200).json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    return res.status(500).json({ error: "Failed to fetch notes", details: err?.message || String(err) });
  }
}

// Get a single note by id
export async function getNoteById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    return res.status(200).json(note);
  } catch (err) {
    console.error("Get note error:", err);
    return res.status(500).json({ error: "Failed to fetch note", details: err?.message || String(err) });
  }
}

// Update a note (PUT replaces fields, PATCH partial)
export async function updateNote(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const updates = req.body || {};
    updates.updatedAt = new Date();

    const note = await Note.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!note) return res.status(404).json({ error: "Note not found" });

    return res.status(200).json(note);
  } catch (err) {
    console.error("Update note error:", err);
    return res.status(500).json({ error: "Failed to update note", details: err?.message || String(err) });
  }
}

// Delete a note
export async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const note = await Note.findByIdAndDelete(id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    return res.status(204).send();
  } catch (err) {
    console.error("Delete note error:", err);
    return res.status(500).json({ error: "Failed to delete note", details: err?.message || String(err) });
  }
}
