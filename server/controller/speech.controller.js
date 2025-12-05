import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";

configDotenv();

// Utility: Get current date-time in Indian Standard Time formatted like
// "Fri Dec 05 2025 04:11:14 GMT+0530 (India Standard Time)"
function getISTNowString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((p) => [p.type, p.value])
  );

  // IST is always GMT+0530 with no DST
  const tzSuffix = "GMT+0530 (India Standard Time)";
  return `${parts.weekday} ${parts.month} ${parts.day} ${parts.year} ${parts.hour}:${parts.minute}:${parts.second} ${tzSuffix}`;
}

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
    const today = new Date();

    // Optional: Use IST now string if needed in prompts/logs
    const istNow = getISTNowString();

    const prompt = `You are a task parser. Extract the following fields and return ONLY strict JSON:
- title
- description
- dueDate (ISO 8601 format in UTC)
- priority (low/medium/high)

TODAY'S DATE: ${today.toISOString().split("T")[0]}  
(IST Now: ${istNow})
(Must be used as the reference point for all date reasoning.)

Rules for dates:
- All dates MUST be in the future relative to today's date.
- Interpret relative dates correctly (e.g., "tomorrow", "next Monday", "this Friday evening", “before noon”, “by end of day”).
- If the user mentions a past date, shift it to the *next logical future occurrence*.
- If no date is mentioned, set dueDate to null.
- Due date MUST be in full ISO string including time (e.g., "2025-12-06T09:00:00Z").

Rules for output:
- Return only a JSON object, no markdown, no code fences.
- The title must be a short command-style summary.
- The description must be a complete, fully descriptive sentence explaining the task clearly.
- priority must be one of: low, medium, high. Default is medium if unclear.

Input:
"${text}"

Example output:
{
  "title": "Send project report",
  "description": "Send the full project report to the manager before the specified deadline.",
  "dueDate": "2025-12-03T09:00:00Z",
  "priority": "high"
}
`;

    console.log("Prompt sent to model (IST now):", istNow);

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
