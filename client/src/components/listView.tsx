"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

interface ListViewProps {
  tasks: any[]
  onEdit: (task: any) => void
  onDelete: (taskId: string) => void
}

type SortField = "dueDate" | "priority"

const priorityOrder :{ low : number, medium: number, high: number} = { low: 1, medium: 2, high: 3 }

export function ListView({ tasks, onEdit, onDelete }: ListViewProps) {
  const [sortBy, setSortBy] = useState<SortField>("dueDate")
  const [sortAsc, setSortAsc] = useState(true)

  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal: any = a[sortBy]
    let bVal: any = b[sortBy]

    if (sortBy === "priority") {
      aVal = priorityOrder[a.priority as keyof typeof priorityOrder]
      bVal = priorityOrder[b.priority as keyof typeof priorityOrder]
    }

    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortAsc ? result : -result
  })

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(field)
      setSortAsc(true)
    }
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <div className="border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("priority")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Priority
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("dueDate")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Due Date
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No tasks yet
              </TableCell>
            </TableRow>
          ) : (
            sortedTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50">
                <TableCell className="font-medium max-w-[150px] truncate">{task.title}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {task.description || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {task.status === "to-do" ? "To Do" : task.status === "in-progress" ? "In Progress" : "Done"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{format(new Date(task.dueDate), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(task.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
