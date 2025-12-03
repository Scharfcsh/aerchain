import mongoose  from "mongoose";



const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["to-do", "in-progress", "done"], default: "to-do" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model("Note", noteSchema);

export default Note;