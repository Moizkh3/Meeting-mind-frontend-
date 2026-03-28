import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, Check } from 'lucide-react'

const notes = [
  {
    id: 1, time: '10:04 AM', isActive: false,
    text: 'Reviewing previous quarter milestones and budget allocation for R&D.',
  },
  {
    id: 2, time: '10:08 AM', isActive: true,
    text: 'The team discussed expanding into the APAC region with a focus on localized logistics hubs and partnership modeling for Q3 2024.',
  },
  {
    id: 3, time: '10:12 AM', isActive: false,
    text: 'Decision made to delay the Seattle warehouse opening until the supply chain audit is finalized in November.',
  },
]

const todayActions = [
  { id: 1, text: 'Finalize APAC compliance document by EOD Friday.', done: false },
  { id: 2, text: 'Schedule follow-up with Logistics leads in Singapore.', done: false },
  { id: 3, text: 'Update Q4 budget forecast based on current R&D burn rate.', done: false },
  { id: 4, text: 'Distribute Q3 retrospective slides to stakeholders.', done: true },
]

const LiveNotes = () => {
  const [correctionText, setCorrectionText] = useState('')

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Top bar — dark */}
      <div className="h-12 bg-[#1e2d47] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-white">Current Topic:</span>
          <span className="text-[14px] font-semibold text-blue-400">[Strategic Q4 Growth Sync]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[12px] font-semibold text-white tracking-wider uppercase">LIVE PARTICIPATION</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left — Notes Panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">
            <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-5">LIVE NOTES</h2>
            
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`border rounded-sm p-5 transition-all ${
                    note.isActive
                      ? 'border-orange-400 bg-white shadow-sm'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[12px] font-semibold ${note.isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                      {note.time}{note.isActive ? ' • ACTIVE SELECTION' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-300 hover:text-gray-500 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Note text */}
                  <p className={`text-[14px] leading-relaxed ${note.isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                    {note.text}
                  </p>

                  {/* Correction input for active */}
                  {note.isActive && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">REQUESTED CORRECTION</p>
                      <div className="flex gap-3">
                        <input
                          value={correctionText}
                          onChange={(e) => setCorrectionText(e.target.value)}
                          placeholder="Type the corrected text here..."
                          className="flex-1 border border-gray-200 px-4 py-2.5 text-[14px] text-gray-700 outline-none focus:border-blue-400 placeholder-gray-300"
                        />
                        <button className="px-6 py-2.5 bg-[#1e2d47] text-white text-[13px] font-semibold hover:bg-[#2c3e5a] transition-colors whitespace-nowrap">
                          Submit Correction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* Footer */}
      <div className="h-12 bg-[#1e2d47] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          <span>USER: EXECUTIVE PARTICIPANT</span>
          <span className="text-gray-600">•</span>
          <span>CONNECTED</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          <Link to="/attendee/support" className="hover:text-white transition-colors">SUPPORT</Link>
          <Link to="/attendee/settings" className="hover:text-white transition-colors">SETTINGS</Link>
        </div>
      </div>
    </div>
  )
}

export default LiveNotes
