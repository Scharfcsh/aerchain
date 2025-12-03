import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";

configDotenv();

// Express controller for POST /api/v1/speech
export async function parseSpeechTask(req, res) {
  try {
    const {text} = req.body;
    // console.log("Received text:", text);
    if (!text ) {
      return res.status(400).json({ error: "Text is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a task parser. Extract the following fields and return ONLY strict JSON:
- title
- description
- dueDate (ISO format)
- priority (low/medium/high)

Text: "${text}"

Rules:
- Return only a JSON object, no markdown, code fences, or explanation
- Use ISO 8601 for dueDate
- priority must be one of: low, medium, high
Example format:
{
  "title": "Send project report",
  "description": "Send the project report to the manager",
  "dueDate": "2025-12-03T09:00:00Z",
  "priority": "high"
}`;

console.log("Prompt sent to model:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const responseText = response.text;
    console.log("Model response:", responseText);

    const cleaned = responseText.replace("/^```json\s*|\s*```$/g", "").trim();
    console.log("Cleaned model response:", cleaned);

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: "Model did not return JSON", raw: responseText });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(502).json({ error: "Invalid JSON from model", raw: responseText });
    }

    const priority = String(parsed.priority || "").toLowerCase();
    const normalized = {
      title: String(parsed.title || "").trim(),
      description: String(parsed.description || "").trim(),
      dueDate: parsed.dueDate ? String(parsed.dueDate) : null,
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
    };

    if (!normalized.title) {
      return res.status(422).json({ error: "Parsed title is empty" });
    }

    if (normalized.dueDate) {
      const d = new Date(normalized.dueDate);
      if (isNaN(d.getTime())) {
        normalized.dueDate = null;
      } else {
        normalized.dueDate = d.toISOString();
      }
    }
    console.log("Normalized parsed task:", normalized);

    return res.status(200).json(normalized);
  } catch (err) {
    console.error("Parse-task error:", err);
    return res.status(500).json({ error: "Failed to parse task", details: err?.message || String(err) });
  }
}
