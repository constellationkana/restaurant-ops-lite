import { useState, useEffect } from "react"

type Page = "Home" | "Checklist" | "Stock" | "Alerts" | "Notes" | "Manager"

type Task = {
  id: number
  title: string
  detail: string
  shift: string
  completed: boolean
}

type NoteType = "General" | "Inventory" | "Customer Issue" | "Staff" | "Cleaning"

type ShiftNote = {
  id: number
  text: string
  type: NoteType
  timestamp: string
}

type ActivityLogEntry = {
  id: number
  timestamp: string
  actionType: "Task Completed" | "Task Uncompleted" | "Note Added"
  description: string
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Organize delivery orders",
    detail: "Dinner Rush • Delivery order station",
    shift: "Dinner Rush",
    completed: false,
  },
  {
    id: 2,
    title: "Restock cooked chicken",
    detail: "Dinner Rush • Chicken prep",
    shift: "Dinner Rush",
    completed: false,
  },
  {
    id: 3,
    title: "Clean prep stations",
    detail: "Opening • Cleaning",
    shift: "Opening",
    completed: false,
  },
  {
    id: 4,
    title: "Check sauce bottles",
    detail: "Lunch Rush • Sauces",
    shift: "Lunch Rush",
    completed: true,
  },
  {
    id: 5,
    title: "Wipe front counter",
    detail: "Closing • Cleaning",
    shift: "Closing",
    completed: true,
  },
]

type StockAmount = "Good" | "Medium" | "Low"

type StockItem = {
  id: number
  name: string
  amount: StockAmount
  detail: string
}

const initialStockItems: StockItem[] = [
  { id: 1, name: "Cooked chicken", amount: "Low", detail: "Below dinner par level" },
  { id: 2, name: "White sauce", amount: "Medium", detail: "Enough for current shift" },
  { id: 3, name: "Rice trays", amount: "Low", detail: "Prep needed before rush" },
  { id: 4, name: "Takeout bags", amount: "Good", detail: "No action needed" },
]

const initialNotes: ShiftNote[] = [
  {
    id: 1,
    text: "Customer reported missing sauce on delivery order.",
    type: "Customer Issue",
    timestamp: "2:30 PM",
  },
  {
    id: 2,
    text: "Rice prep ran behind during lunch rush.",
    type: "Staff",
    timestamp: "1:15 PM",
  },
  {
    id: 3,
    text: "Need extra takeout containers before weekend.",
    type: "Inventory",
    timestamp: "12:45 PM",
  },
]

const initialActivityLog: ActivityLogEntry[] = []

function StatCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-white/20 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-orange-100">{label}</p>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
}: {
  task: Task
  onToggle: (id: number) => void
}) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      className={`w-full border-t px-4 py-3 text-left transition ${
        task.completed
          ? "border-emerald-100 bg-emerald-50"
          : "border-red-100 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${
            task.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-red-400 text-red-500"
          }`}
        >
          {task.completed ? "✓" : "!"}
        </span>

        <div>
          <p
            className={`font-semibold ${
              task.completed
                ? "text-emerald-800 line-through"
                : "text-red-800"
            }`}
          >
            {task.title}
          </p>
          <p
            className={`text-sm ${
              task.completed ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {task.detail}
          </p>
        </div>
      </div>
    </button>
  )
}

function BottomNav({
  currentPage,
  onChangePage,
}: {
  currentPage: Page
  onChangePage: (page: Page) => void
}) {
  const pages: Page[] = ["Home", "Checklist", "Stock", "Alerts", "Notes", "Manager"]

  return (
    <nav className="fixed bottom-0 left-1/2 grid w-full max-w-md -translate-x-1/2 grid-cols-6 border-t border-slate-200 bg-white text-xs shadow-lg">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChangePage(page)}
          className={`py-3 ${
            currentPage === page
              ? "bg-orange-50 font-bold text-orange-500"
              : "text-slate-500"
          }`}
        >
          <div className="text-lg">{currentPage === page ? "⌂" : "□"}</div>
          {page}
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("Home")
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("restaurant-tasks")
    return saved ? JSON.parse(saved) : initialTasks
  })
  const [notes, setNotes] = useState<ShiftNote[]>(() => {
    const saved = localStorage.getItem("restaurant-notes")
    return saved ? JSON.parse(saved) : initialNotes
  })
  const [newNoteText, setNewNoteText] = useState("")
  const [newNoteType, setNewNoteType] = useState<NoteType>("General")
  const [nextNoteId, setNextNoteId] = useState(4)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => {
    const saved = localStorage.getItem("restaurant-activity-log")
    return saved ? JSON.parse(saved) : initialActivityLog
  })
  const [nextActivityLogId, setNextActivityLogId] = useState(1)
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems)

  const lowStockCount = stockItems.filter((item) => item.amount === "Low").length

  function cycleStockAmount(amount: StockAmount): StockAmount {
    return amount === "Good" ? "Medium" : amount === "Medium" ? "Low" : "Good"
  }

  function handleStockClick(id: number) {
    setStockItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, amount: cycleStockAmount(item.amount) } : item
      )
    )
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const taskPercent = Math.round((completedTasks / totalTasks) * 100)
  const incompleteTasks = tasks.filter((task) => !task.completed)

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("restaurant-tasks", JSON.stringify(tasks))
  }, [tasks])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("restaurant-notes", JSON.stringify(notes))
  }, [notes])

  // Save activity log to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("restaurant-activity-log", JSON.stringify(activityLog))
  }, [activityLog])

  function formatTime(): string {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    const minutesStr = minutes < 10 ? "0" + minutes : minutes
    return `${hours}:${minutesStr} ${ampm}`
  }

  function addActivityLog(
    actionType: "Task Completed" | "Task Uncompleted" | "Note Added",
    description: string
  ) {
    const newEntry: ActivityLogEntry = {
      id: nextActivityLogId,
      timestamp: formatTime(),
      actionType,
      description,
    }
    setActivityLog([newEntry, ...activityLog])
    setNextActivityLogId(nextActivityLogId + 1)
  }

  function handleAddNote() {
    if (newNoteText.trim() === "") {
      return
    }

    const newNote: ShiftNote = {
      id: nextNoteId,
      text: newNoteText,
      type: newNoteType,
      timestamp: formatTime(),
    }

    setNotes([newNote, ...notes])
    addActivityLog("Note Added", `${newNoteType} - ${newNoteText.substring(0, 50)}${newNoteText.length > 50 ? "..." : ""}`)
    setNewNoteText("")
    setNewNoteType("General")
    setNextNoteId(nextNoteId + 1)
  }

  function toggleTask(id: number) {
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      
      // Add activity log entry
      const task = currentTasks.find((t) => t.id === id)
      if (task) {
        const wasCompleted = task.completed
        const actionType = wasCompleted ? "Task Uncompleted" : "Task Completed"
        addActivityLog(actionType, task.title)
      }
      
      return updatedTasks
    })
  }

  return (
    <main className="min-h-screen bg-orange-50 text-slate-900">
      <section className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <header className="bg-orange-500 px-6 py-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-2xl">
              🔥
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI-Halal Grill</h1>
              <p className="text-sm text-orange-100">Operations Dashboard</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-orange-100">Monday, May 25</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard value={`${taskPercent}%`} label="Tasks Done" />
            <StatCard value={String(lowStockCount)} label="Low Stock" />
            <StatCard value={String(incompleteTasks.length)} label="Open Issues" />
          </div>
        </header>

        <div className="space-y-6 px-5 py-5 pb-24">
          {currentPage === "Home" && (
            <>
              <button
                onClick={() => setCurrentPage("Checklist")}
                className="flex w-full items-center justify-between rounded-2xl bg-orange-500 px-5 py-4 text-left text-white shadow-md"
              >
                <div>
                  <p className="font-bold">Start Closing Checklist</p>
                  <p className="mt-1 text-sm text-orange-100">
                    {incompleteTasks.length} urgent tasks need attention
                  </p>
                </div>
                <span className="text-2xl">›</span>
              </button>

              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Shift Progress
                </h2>

                <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Overall Completion
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {taskPercent}%
                  </p>

                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${taskPercent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {completedTasks}/{totalTasks} tasks complete
                  </p>
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Business Impact
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                    <p className="text-2xl font-bold">$1,240</p>
                    <p className="mt-1 text-sm font-semibold">Estimated Savings</p>
                    <p className="mt-1 text-xs text-slate-500">
                      from avoided waste this month
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                    <p className="text-2xl font-bold">18</p>
                    <p className="mt-1 text-sm font-semibold">Follow-ups Completed</p>
                    <p className="mt-1 text-xs text-slate-500">
                      orders and tasks followed through
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          {currentPage === "Checklist" && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-orange-50 px-4 py-3">
                <h2 className="font-bold text-slate-900">Checklist</h2>
                <p className="text-sm text-slate-500">
                  Tap a task to mark it complete or incomplete.
                </p>
              </div>

              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </section>
          )}

          {currentPage === "Stock" && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Stock</h2>

              <div className="space-y-3">
                {stockItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleStockClick(item.id)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-orange-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{item.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.amount === "Low"
                            ? "bg-red-100 text-red-600"
                            : item.amount === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.amount}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {currentPage === "Alerts" && (
            <section className="overflow-hidden rounded-2xl border border-red-100 bg-red-50">
              <div className="flex items-center justify-between bg-red-100 px-4 py-3">
                <p className="font-bold text-red-700">Open Alerts</p>
                <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  {incompleteTasks.length}
                </span>
              </div>

              {incompleteTasks.length === 0 ? (
                <p className="px-4 py-5 text-sm text-emerald-700">
                  No open alerts. All tasks are complete.
                </p>
              ) : (
                incompleteTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                ))
              )}
            </section>
          )}

          {currentPage === "Notes" && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Shift Notes</h2>

              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Note Type
                  </label>
                  <select
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value as NoteType)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="General">General</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Customer Issue">Customer Issue</option>
                    <option value="Staff">Staff</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Note
                  </label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Write your shift note here..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleAddNote}
                  className="w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Add Note
                </button>
              </div>

              <div className="space-y-3">
                {notes.map((note) => {
                  const typeColors: Record<NoteType, string> = {
                    General: "bg-blue-100 text-blue-700",
                    Inventory: "bg-yellow-100 text-yellow-700",
                    "Customer Issue": "bg-red-100 text-red-700",
                    Staff: "bg-purple-100 text-purple-700",
                    Cleaning: "bg-green-100 text-green-700",
                  }

                  return (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${typeColors[note.type]}`}
                        >
                          {note.type}
                        </span>
                        <span className="text-xs text-slate-400">{note.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-700">{note.text}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {currentPage === "Manager" && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Manager View</h2>

              <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Today’s completion rate</p>
                <p className="mt-2 text-4xl font-bold text-orange-500">
                  {taskPercent}%
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {completedTasks} of {totalTasks} tasks completed.
                </p>
              </div>

              <div className="mt-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                <p className="font-bold">Manager Summary</p>
                <p className="mt-2 text-sm text-slate-500">
                  {incompleteTasks.length > 0
                    ? `${incompleteTasks.length} task(s) still need attention before close.`
                    : "All tracked tasks are complete for the current shift."}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Activity Log
                </h3>

                {activityLog.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-sm text-slate-500">No activities yet. Tasks and notes will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activityLog.map((entry) => {
                      const actionColors: Record<string, string> = {
                        "Task Completed": "bg-emerald-100 text-emerald-700",
                        "Task Uncompleted": "bg-slate-100 text-slate-600",
                        "Note Added": "bg-blue-100 text-blue-700",
                      }

                      return (
                        <div
                          key={entry.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`inline-block flex-shrink-0 rounded-full px-2 py-1 text-xs font-bold ${actionColors[entry.actionType]}`}
                            >
                              {entry.actionType}
                            </span>
                            <span className="text-xs text-slate-400">{entry.timestamp}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <BottomNav currentPage={currentPage} onChangePage={setCurrentPage} />
      </section>
    </main>
  )
}