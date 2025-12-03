"use client"

import { useState } from "react"
import { TaskFormDialog } from "@/components/taskForm"
import { KanbanView } from "@/components/kanbanview"
import { ListView } from "@/components/listView"
import { TaskFilters } from "@/components/taskFilter"
import { VoiceInput } from "@/components/voiceIn"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Layout, List } from "lucide-react"
import type { Task, TaskPriority, TaskStatus } from "./lib/types"
import { TaskProvider, useTaskContext } from "./lib/taskContext"

(function enableConsoleForwarding() {
  const originalLog = console.log;

  console.log = (...args) => {
    originalLog(...args);

    fetch("/__log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: args }),
    }).catch(() => {});
  };
})();


function TaskManagerContent() {
  const { tasks, updateTask, deleteTask } = useTaskContext()
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeletingTask, setIsDeletingTask] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([])
  const [dueDateRange, setDueDateRange] = useState<[string, string]>(["", ""])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(task.status)
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority)

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleDelete = (taskId: string) => {
    setIsDeletingTask(taskId)
  }

  const confirmDelete = () => {
    if (isDeletingTask) {
      deleteTask(isDeletingTask)
      setIsDeletingTask(null)
    }
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      updateTask(taskId, { ...task, status: newStatus })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Task Manager</h1>
          <p className="text-muted-foreground">Organize, track, and manage your tasks efficiently</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <VoiceInput />
          <Button
            onClick={() => {
              setEditingTask(undefined)
              setIsFormOpen(true)
            }}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>

          <div className="flex gap-2 ml-auto">
            <Button
              onClick={() => setViewMode("kanban")}
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Layout className="h-4 w-4" />
              Kanban
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
          selectedPriorities={selectedPriorities}
          onPriorityChange={setSelectedPriorities}
          dueDateRange={dueDateRange}
          onDueDateRangeChange={setDueDateRange}
        />

        {/* View Content */}
        <div className="mt-8">
          {viewMode === "kanban" ? (
            <KanbanView
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <ListView tasks={filteredTasks} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <TaskFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} task={editingTask} />

      <AlertDialog open={!!isDeletingTask} onOpenChange={() => setIsDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel onClick={() => setIsDeletingTask(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function HomePage() {
  return (
    <TaskProvider>
      <TaskManagerContent />
    </TaskProvider>
  )
}
