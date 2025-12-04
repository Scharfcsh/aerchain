"use client";

import { useState} from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, AlertCircle, Square } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { useTaskContext } from "@/lib/taskContext";
import { startListening, stopListening } from "@/lib/script";
import type { TaskFormData } from "@/lib/types";
import { TaskFormDialog } from "./taskForm";

export function VoiceInput() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskFormData | undefined>(
    undefined
  );
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState<string>("");
  // const { addTask } = useTaskContext();

  const handleListening = async () => {
    console.log("Starting voice input...");
    setIsListening(true);
    setIsProcessing(true);

    try {
      //   const test = "Remind me to send the project proposal to the client by next Wednesday, it's high priority"
      const { transcript } = await startListening();
      console.log("Transcript:", transcript);
      setTranscriptPreview(transcript);

      const response = await fetch(
        "https://aerchain-server.vercel.app/api/v1/speech",
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript }),
        }
      );

      const json = await response.json();

      console.log("Response:", json);

      if (!response.ok) throw new Error("Failed to process speech");
      setIsFormOpen(true);
      setEditingTask({
        title: json.title,
        description: json.description,
        status: "to-do",
        priority: (json.priority || "medium").toLowerCase() as
          | "low"
          | "medium"
          | "high",
        dueDate:
          json.dueDate ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });

      setError(null);
    } catch (error: any) {
      console.error("Voice task creation error:", error);
      setError("Failed to create task from voice input");
      setTimeout(() => setError(null), 1000);
    } finally {
      stopListening();
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  const handleStop = () => {
    console.log("Stopping voice input...");
    stopListening();
    setIsListening(false);
    setIsProcessing(false);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Button
          onClick={handleListening}
          disabled={isListening || isProcessing}
          variant="default"
          size="lg"
          className="gap-2"
        >
          {isListening ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Listening...
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Voice Input
            </>
          )}
        </Button>

        {isListening && (
          <Button
            onClick={handleStop}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}
      </div>

      {transcriptPreview && (
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">Captured transcript:</span> {transcriptPreview}
        </div>
      )}

      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        newtask={true}
      />

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error
          </AlertDialogTitle>
          <AlertDialogDescription>{error}</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
