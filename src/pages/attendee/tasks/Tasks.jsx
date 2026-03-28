import { useState } from "react"
import {
  Search,
  CheckCircle2,
  Circle,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

const statusConfig = {
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600 border border-red-200' },
  'in-progress': { label: 'In Progress', className: 'bg-amber-50 text-amber-600 border border-amber-200' },
  todo: { label: 'To-Do', className: 'bg-slate-50 text-slate-600 border border-slate-200' },
  done: { label: 'Done', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
}

const Tasks = () => {
  const { toggleNav } = useOutletContext() || {}
  const [tasks] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Status')
  const [meetingFilter, setMeetingFilter] = useState('Meeting Source')

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === 'Status' ||
      (statusFilter === 'To-Do' && t.status === 'todo') ||
      (statusFilter === 'In Progress' && t.status === 'in-progress') ||
      (statusFilter === 'Done' && t.status === 'done')
    return matchSearch && matchStatus
  })

  const pendingCount = tasks.filter((t) => t.status === 'todo' || t.status === 'in-progress').length
  const completedCount = tasks.filter((t) => t.status === 'done').length
  const overdueCount = tasks.filter((t) => t.status === 'overdue').length

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12">

        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <button 
              onClick={toggleNav}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
          </div>
          <p className="text-slate-500 mt-1 text-sm lg:pl-0 pl-1">Action items assigned to you from meeting scribes</p>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-shadow hover:shadow-md cursor-default">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Pending Tasks
            </span>
            <p className="text-4xl font-bold mt-2 text-slate-900">
              {pendingCount}
            </p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-shadow hover:shadow-md cursor-default">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Completed This Week
            </span>
            <p className="text-4xl font-bold mt-2 text-slate-900">
              {completedCount}
            </p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-shadow hover:shadow-md cursor-default">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Overdue
            </span>
            <p className="text-4xl font-bold mt-2 text-red-500">
              {overdueCount}
            </p>
          </div>
        </section>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-1 min-w-[300px] items-center bg-white px-3 py-1 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-slate-100 transition-all shadow-sm">
            <Search className="text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none focus:ring-0 text-sm py-2 px-3 placeholder:text-slate-400 outline-none bg-transparent"
              placeholder="Search tasks..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm appearance-none min-w-[140px] focus:ring-2 focus:ring-slate-100 outline-none font-medium text-slate-600"
            >
              <option>Status</option>
              <option>To-Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            <select
              value={meetingFilter}
              onChange={(e) => setMeetingFilter(e.target.value)}
              className="text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm appearance-none min-w-[160px] focus:ring-2 focus:ring-slate-100 outline-none font-medium text-slate-600"
            >
              <option>Meeting Source</option>
            </select>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 w-12">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-widest text-slate-400 text-[10px]">
                  Task Description
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-widest text-slate-400 text-[10px]">
                  Source Meeting
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-widest text-slate-400 text-[10px]">
                  Assigned
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-widest text-slate-400 text-[10px]">
                  Due Date
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-widest text-slate-400 text-center text-[10px]">
                  Status
                </th>
                <th className="py-4 px-6 font-bold uppercase tracking-widest text-slate-400 text-right text-[10px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <p className="text-sm font-bold text-slate-400">No tasks assigned yet</p>
                    <p className="text-xs text-slate-300 mt-1">Tasks from meeting scribes will appear here</p>
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr
                    key={task.id}
                    className={`transition-colors group hover:bg-slate-50/50 ${task.done ? 'opacity-60 bg-slate-50/30' : ''}`}
                  >
                    <td className="py-5 px-6">
                      <input
                        type="checkbox"
                        checked={task.done}
                        readOnly
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="py-5 px-4">
                      <p className={`text-slate-900 font-bold text-sm ${task.done ? 'line-through decoration-1 text-slate-500' : ''}`}>
                        {task.title}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-slate-500 text-sm font-medium">{task.meeting}</span>
                    </td>
                    <td className="py-5 px-4 text-sm text-slate-500 font-medium">{task.assigned}</td>
                    <td className={`py-5 px-4 text-sm font-semibold ${task.status === 'overdue' && !task.done ? 'text-red-500' : 'text-slate-500'}`}>
                      {task.due}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${statusConfig[task.status]?.className || ''}`}>
                        {statusConfig[task.status]?.label || task.status}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className={`p-1.5 transition-colors rounded-lg flex-shrink-0 focus:outline-none ${task.done ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                          title={task.done ? "Mark pending" : "Mark complete"}
                        >
                          {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 focus:outline-none"
                          title="Edit"
                        >
                          <FileEdit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Table Footer */}
          <div className="p-4 flex items-center justify-between border-t border-slate-200 bg-slate-50">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">
              Showing {filtered.length} of {tasks.length} tasks
            </span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all focus:outline-none">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm font-bold text-[10px] text-slate-900 focus:outline-none">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all focus:outline-none">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Tasks
