"use client"
import type { TaskStatus, TaskPriority } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface TaskFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatuses: TaskStatus[]
  onStatusChange: (statuses: TaskStatus[]) => void
  selectedPriorities: TaskPriority[]
  onPriorityChange: (priorities: TaskPriority[]) => void
  dueDateRange: [string, string]
  onDueDateRangeChange: (range: [string, string]) => void
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedPriorities,
  onPriorityChange,
  dueDateRange,
  onDueDateRangeChange,
}: TaskFiltersProps) {
  const statuses: TaskStatus[] = ["to-do", "in-progress", "done"]
  const priorities: TaskPriority[] = ["low", "medium", "high"]

  const toggleStatus = (status: TaskStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status))
    } else {
      onStatusChange([...selectedStatuses, status])
    }
  }

  const togglePriority = (priority: TaskPriority) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter((p) => p !== priority))
    } else {
      onPriorityChange([...selectedPriorities, priority])
    }
  }

  const hasActiveFilters =
    searchQuery || selectedStatuses.length > 0 || selectedPriorities.length > 0 || (dueDateRange[0] && dueDateRange[1])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                {status === "to-do" ? "To Do" : status === "in-progress" ? "In Progress" : "Done"}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {priorities.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={selectedPriorities.includes(priority)}
                onCheckedChange={() => togglePriority(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange("")
              onStatusChange([])
              onPriorityChange([])
              onDueDateRangeChange(["", ""])
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="cursor-pointer">
              Search: {searchQuery}
            </Badge>
          )}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary">
              {status === "to-do" ? "To Do" : status === "in-progress" ? "In Progress" : "Done"}
            </Badge>
          ))}
          {selectedPriorities.map((priority) => (
            <Badge key={priority} variant="secondary">
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
