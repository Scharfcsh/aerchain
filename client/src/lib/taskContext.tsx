"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Task, TaskFormData } from "./types"

interface TaskContextType {
  tasks: Task[]
  addTask: (formData: TaskFormData) => void
  updateTask: (id: string, formData: TaskFormData) => void
  deleteTask: (id: string) => void
  getTaskById: (id: string) => Task | undefined
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design new landing page",
      description: "Create mockups and wireframes for the new marketing site",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-12-10T17:00:00",
      createdAt: "2025-12-03T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
    {
      id: "2",
      title: "Review pull requests",
      description: "Check and approve pending code reviews from the team",
      status: "to-do",
      priority: "medium",
      dueDate: "2025-12-05T14:00:00",
      createdAt: "2025-12-03T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
    {
      id: "3",
      title: "Complete project report",
      description: "Finish the quarterly project report and send to manager",
      status: "done",
      priority: "high",
      dueDate: "2025-12-01T18:00:00",
      createdAt: "2025-12-01T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
    {
      id: "4",
      title: "Complete project report",
      description: "Finish the quarterly project report and send to manager",
      status: "done",
      priority: "high",
      dueDate: "2025-12-01T18:00:00",
      createdAt: "2025-12-01T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
    {
      id: "5",
      title: "Complete project report",
      description: "Finish the quarterly project report and send to manager",
      status: "done",
      priority: "high",
      dueDate: "2025-12-01T18:00:00",
      createdAt: "2025-12-01T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
    {
      id: "6",
      title: "Complete project report",
      description: "Finish the quarterly project report and send to manager",
      status: "done",
      priority: "high",
      dueDate: "2025-12-01T18:00:00",
      createdAt: "2025-12-01T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
    {
      id: "7",
      title: "Complete project report",
      description: "Finish the quarterly project report and send to manager",
      status: "done",
      priority: "high",
      dueDate: "2025-12-01T18:00:00",
      createdAt: "2025-12-01T09:00:00",
      updatedAt: "2025-12-03T09:00:00",
    },
  ])

  const addTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prevTasks) => [newTask, ...prevTasks])
  }, [])

  const updateTask = useCallback((id: string, formData: TaskFormData) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, ...formData, updatedAt: new Date().toISOString() } : task)),
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
  }, [])

  const getTaskById = useCallback((id: string) => tasks.find((task) => task.id === id), [tasks])

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTaskById }}>
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
