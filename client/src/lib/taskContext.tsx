"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Task, TaskFormData } from "./types"

const BASE_URL = "https://aerchain-server.vercel.app";

interface TaskContextType {
  tasks: Task[]
  addTask: (formData: TaskFormData) => Promise<void>
  updateTask: (id: string, formData: TaskFormData) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  getTaskById: (id: string) => Task | undefined
  refresh: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  const mapNoteToTask = (note: any): Task => ({
    id: note._id || note.id,
    title: note.title,
    description: note.description,
    status: note.status,
    priority: note.priority,
    dueDate: typeof note.dueDate === "string" ? note.dueDate : new Date(note.dueDate).toISOString(),
    createdAt: typeof note.createdAt === "string" ? note.createdAt : new Date(note.createdAt).toISOString(),
    updatedAt: typeof note.updatedAt === "string" ? note.updatedAt : new Date(note.updatedAt).toISOString(),
  })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/notes`, { method: "GET" })
      if (!res.ok) throw new Error(`Failed to fetch notes: ${res.status}`)
      const data = await res.json()
      const mapped: Task[] = Array.isArray(data) ? data.map(mapNoteToTask) : []
      setTasks(mapped)
    } catch (e) {
      console.error("Refresh notes error", e)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addTask = useCallback(async (formData: TaskFormData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
      }
      const res = await fetch(`${BASE_URL}/api/v1/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Failed to create note: ${res.status}`)
      const created = await res.json()
      setTasks((prev) => [mapNoteToTask(created), ...prev])
    } catch (e) {
      console.error("Create note error", e)
    }
  }, [])

  const updateTask = useCallback(async (id: string, formData: TaskFormData) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      })
      if (!res.ok) throw new Error(`Failed to update note: ${res.status}`)
      const updated = await res.json()
      const mapped = mapNoteToTask(updated)
      setTasks((prev) => prev.map((t) => (t.id === id ? mapped : t)))
    } catch (e) {
      console.error("Update note error", e)
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/notes/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error(`Failed to delete note: ${res.status}`)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      console.error("Delete note error", e)
    }
  }, [])

  const getTaskById = useCallback((id: string) => tasks.find((task) => task.id === id), [tasks])

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTaskById, refresh }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider")
  }
  return context
}
