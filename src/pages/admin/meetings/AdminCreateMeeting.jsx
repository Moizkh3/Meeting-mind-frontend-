import { useState } from "react";
import {
  Info,
  Users,
  Calendar,
} from "lucide-react";

const DEPARTMENTS = ["Operations", "Engineering", "Finance", "Marketing", "HR", "Product"];
const SCRIBES     = ["AI Scribe - Alpha", "AI Scribe - Beta", "AI Scribe - Gamma"];
const DAYS        = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_KEYS    = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];


export default function AdminCreateMeeting() {
  // Section 1
  const [title, setTitle]       = useState("");
  const [objective, setObj]     = useState("");
  const [location, setLocation] = useState("");
  const [department, setDept]   = useState("Operations");

  // Section 2
  const [scribe, setScribe]     = useState("");
  const [emailInput, setEmail]  = useState("");
  const [attendees, setAtt]     = useState([
    "j.smith@enterprise.com",
    "board-admin@corp.org",
  ]);

  // Section 3
  const [activeDays, setDays]   = useState({ mon: true, tue: false, wed: true, thu: false, fri: true, sat: false, sun: false });
  const [limitDate, setLimit]   = useState("2024-12-31");

  const toggleDay = (key) => setDays(p => ({ ...p, [key]: !p[key] }));

  const handleEmailKey = (e) => {
    if (e.key === "Enter" && emailInput.trim()) {
      setAtt(p => [...p, emailInput.trim()]);
      setEmail("");
    }
  };

  const removeAttendee = (email) => setAtt(p => p.filter(a => a !== email));

  const handleSaveDraft = () => alert("Draft saved!");
  const handleFinalize  = () => {
    if (!title) return alert("Please enter a meeting title.");
    alert(`Meeting "${title}" scheduled!`);
  };

  return (
    <div
      className="min-h-screen bg-[#f4f6fa] rounded-xl p-8"
    >
      <div className="p-5 mx-auto">
        {/* Page Header */}
        <h1 className="text-[16px] font-black tracking-widest text-[#2c3a4f] uppercase mb-1">
          Schedule New Meeting
        </h1>
        <p className="text-[13px] text-[#8a99b0] mb-6">
          Configure complex meeting details, participant recurrence, and global scribe assignment.
        </p>

        {/* ─── SECTION 1 ─── */}
        <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Info size={17} className="text-[#4a6fa5]" />
            <span className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase">
              Section 1: Meeting Details
            </span>
          </div>

          {/* Meeting Title */}
          <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
            Meeting Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Quarterly Strategic Alignment"
            className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] focus:outline-none focus:border-[#4a6fa5] transition-colors mb-4"
          />

          {/* Meeting Objective */}
          <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
            Meeting Objective
          </label>
          <textarea
            value={objective}
            onChange={e => setObj(e.target.value)}
            placeholder="Enter the primary goal or agenda of this meeting..."
            rows={4}
            className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] focus:outline-none focus:border-[#4a6fa5] transition-colors resize-y mb-4"
          />

          {/* Location + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                Location / Link
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Meeting Room A or Zoom Link"
                className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] focus:outline-none focus:border-[#4a6fa5] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={e => setDept(e.target.value)}
                className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] bg-white focus:outline-none focus:border-[#4a6fa5] transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238a99b0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2 ─── */}
        <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Users size={17} className="text-[#4a6fa5]" />
            <span className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase">
              Section 2: Participants
            </span>
          </div>

          {/* Global Scribe */}
          <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
            Global Scribe Selection
          </label>
          <select
            value={scribe}
            onChange={e => setScribe(e.target.value)}
            className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] bg-white focus:outline-none focus:border-[#4a6fa5] transition-colors appearance-none cursor-pointer mb-1"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238a99b0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
          >
            <option value="">Select an automated scribe...</option>
            {SCRIBES.map(s => <option key={s}>{s}</option>)}
          </select>
          <p className="text-[11px] text-[#8a99b0] italic mb-4">
            The scribe will handle automated minute-taking and action item extraction.
          </p>

          {/* Attendee Invitations */}
          <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
            Attendee Invitations
          </label>
          <div className="flex flex-wrap items-center gap-2 border border-[#e2e7ef] rounded-lg px-3 py-2 focus-within:border-[#4a6fa5] transition-colors min-h-[44px]">
            {attendees.map(a => (
              <span
                key={a}
                className="flex items-center gap-1 bg-[#eef0f5] border border-[#dde1ea] rounded px-2 py-1 text-[12px] text-[#2c3a4f] font-medium"
              >
                {a}
                <button
                  onClick={() => removeAttendee(a)}
                  className="text-[#8a99b0] hover:text-[#e07b2a] transition-colors ml-0.5 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleEmailKey}
              placeholder="Add email and press enter..."
              className="flex-1 min-w-[180px] text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* ─── SECTION 3 ─── */}
        <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={17} className="text-[#4a6fa5]" />
            <span className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase">
              Section 3: Recurrence Engine
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Days of Week */}
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-2">
                Frequency (Days of Week)
              </label>
              <div className="flex gap-2">
                {DAYS.map((d, i) => {
                  const key = DAY_KEYS[i];
                  const active = activeDays[key];
                  return (
                    <button
                      key={key + i}
                      onClick={() => toggleDay(key)}
                      className={`w-8 h-8 rounded-md text-[12px] font-bold transition-colors ${
                        active
                          ? "bg-[#2c3a4f] text-white"
                          : "bg-[#eef0f5] text-[#8a99b0] hover:bg-[#dde1ea]"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recurrence Limit Date */}
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-2">
                Recurrence Limit Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={limitDate}
                  onChange={e => setLimit(e.target.value)}
                  className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] focus:outline-none focus:border-[#4a6fa5] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#8a99b0] mt-1">
                Maximum schedule duration is 12 months from start date.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Footer Buttons ─── */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2.5 text-[13px] font-bold tracking-wide text-[#2c3a4f] border border-[#d0d7e2] rounded-lg bg-white hover:bg-[#f4f6fa] transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleFinalize}
            className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold tracking-wide text-white bg-[#2c3a4f] rounded-lg hover:bg-[#3d4f66] transition-colors"
          >
            Finalize Schedule
            <span className="text-base">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
