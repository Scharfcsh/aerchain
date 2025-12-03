"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import { format } from "date-fns"
import type { Task } from "@/lib/types"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, task: Task) => void
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function TaskCard({ task, onEdit, onDelete, draggable = false, onDragStart }: TaskCardProps) {
  const dueDate = new Date(task.dueDate)
  const isOverdue = dueDate < new Date() && task.status !== "done"

  return (
    <Card
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${isOverdue ? "border-red-400" : ""}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2 flex-1">{task.title}</h3>
          <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        </div>

        {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{format(dueDate, "MMM d, yyyy h:mm a")}</span>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)} className="flex-1">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
