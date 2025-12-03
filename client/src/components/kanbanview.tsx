"use client"

import type React from "react"

import { useState } from "react"
import type { Task, TaskStatus } from "@/lib/types"
import { TaskCard } from "./cardView"

interface KanbanViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
}

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  "to-do": { label: "To Do", color: "bg-slate-50 dark:bg-slate-900" },
  "in-progress": { label: "In Progress", color: "bg-blue-50 dark:bg-blue-950" },
  done: { label: "Done", color: "bg-green-50 dark:bg-green-950" },
}

export function KanbanView({ tasks, onEdit, onDelete, onStatusChange }: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    if (draggedTask) {
      onStatusChange(draggedTask.id, status)
      setDraggedTask(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(Object.keys(statusConfig) as TaskStatus[]).map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status)
        const { label, color } = statusConfig[status]

        return (
          <div key={status} className="flex flex-col">
            <h2 className="font-semibold text-lg mb-4">{label}</h2>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex-1 space-y-3 p-4 rounded-lg border-2 border-dashed border-muted min-h-[500px] ${color}`}
            >
              {statusTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No tasks</p>
              ) : (
                statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
