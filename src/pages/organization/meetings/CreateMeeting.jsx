import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Bell,
  User as UserIcon,
  LayoutGrid,
  Loader2,
  UserPlus,
  ShieldCheck,
  X,
  Clock,
  MapPin,
  Link2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosinstance";
import AttendeePicker from "../../../components/common/AttendeePicker";

const DEPARTMENTS = ["Operations", "Engineering", "Finance", "Marketing", "HR", "Product"];

const steps = [
  { number: 1, label: "MEETING INFO", active: true },
  { number: 2, label: "PARTICIPANTS", active: false },
  { number: 3, label: "RECURRENCE", active: false },
];

const CreateMeeting = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  // Picker Modals
  const [isAttendeePickerOpen, setIsAttendeePickerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    objective: "",
    location: "",
    meetingLink: "",
    meetingType: "onsite",
    department: "Operations",
    startDate: "",
    startTime: "10:00",
    isRecurring: false,
    recurringDuration: 10,
    recurringFrequency: 1,
    scribe: null,
    attendees: [],
    limitDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchMeeting = async () => {
        try {
          const response = await axiosInstance.get(`/meetings/id/${id}`);
          const m = response.data.data.meeting;
          
          setFormData({
            title: m.agenda || "",
            objective: m.description || "",
            location: m.location || "",
            meetingLink: m.meetingLink || "",
            meetingType: m.meetingType || "onsite",
            department: m.department || "Operations",
            startDate: m.startAt ? new Date(m.startAt).toISOString().split('T')[0] : "",
            startTime: m.startAt ? new Date(m.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "10:00",
            recurringFrequency: m.recurringFrequency || 1,
            attendees: m.attendees?.map(a => ({
              ...(a.user || {}),
              _id: a.user?._id || a._id,
              external: !a.isRegistered,
              isScriber: a.isScriber,
              name: a.nameForUnregisteredAttendee || a.user?.name,
              email: a.emailForUnregisteredAttendee || a.user?.email
            })) || [],
            scribe: m.attendees?.find(a => a.isScriber) ? {
              name: m.attendees.find(a => a.isScriber).nameForUnregisteredAttendee || m.attendees.find(a => a.isScriber).user?.name,
              _id: m.attendees.find(a => a.isScriber).user?._id || m.attendees.find(a => a.isScriber)._id
            } : null,
            limitDate: m.startAt && m.recurringDuration 
              ? new Date(new Date(m.startAt).getTime() + (m.recurringDuration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] 
              : "",
          });
        } catch (err) {
          console.error("Failed to fetch meeting:", err);
          setError("Failed to load meeting data.");
        }
      };
      fetchMeeting();
    }
  }, [isEditMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleAddAttendees = (selected) => {
    setFormData(prev => {
      const existingIds = prev.attendees.map(a => a._id);
      const newAttendees = selected.filter(s => !existingIds.includes(s._id));
      return {
        ...prev,
        attendees: [...prev.attendees, ...newAttendees]
      };
    });
    setIsAttendeePickerOpen(false);
  };

  const toggleScribe = (attendeeId) => {
    setFormData(prev => {
      const updatedAttendees = prev.attendees.map(a => ({
        ...a,
        isScriber: a._id === attendeeId ? !a.isScriber : false
      }));
      const newScribe = updatedAttendees.find(a => a.isScriber);
      return {
        ...prev,
        attendees: updatedAttendees,
        scribe: newScribe || null
      };
    });
  };

  const removeAttendee = (id) => {
    setFormData(prev => {
      const isRemovedScribe = prev.scribe?._id === id;
      return {
        ...prev,
        attendees: prev.attendees.filter(a => a._id !== id),
        scribe: isRemovedScribe ? null : prev.scribe
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return setError("Please enter a meeting title.");
    if (!formData.startDate) return setError("Please select a start date.");
    if (!formData.scribe) return setError("Please assign a scribe.");
    if (formData.attendees.length === 0) return setError("Please invite at least one attendee.");
    if (formData.meetingType === "onsite" && !formData.location) return setError("Please enter a location for onsite meetings.");
    if (formData.meetingType === "online" && !formData.meetingLink) return setError("Please enter a meeting link for online meetings.");
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const startAt = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();

      const attendeeList = formData.attendees.map(a => ({
        isRegistered: !a.external,
        isScriber: !!a.isScriber,
        ...(a.external
          ? { emailForUnregisteredAttendee: a.email, nameForUnregisteredAttendee: a.name }
          : { user: a._id }
        )
      }));

      const payload = {
        agenda: formData.title,
        description: formData.objective,
        startAt,
        meetingType: formData.meetingType,
        isRecurring: formData.isRecurring,
        attendees: attendeeList,
        ...(formData.meetingType === "onsite" ? { location: formData.location } : { meetingLink: formData.meetingLink }),
        ...(formData.isRecurring ? {
          recurringDuration: formData.limitDate ? Math.ceil((new Date(formData.limitDate).getTime() - new Date(startAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          recurringFrequency: Number(formData.recurringFrequency) || 1
        } : {})
      };

      if (isEditMode) {
        await axiosInstance.put(`/meetings/edit/${id}`, payload);
        setSuccess("Meeting updated successfully! Redirecting...");
      } else {
        await axiosInstance.post("/meetings/create", payload);
        setSuccess("Meeting scheduled successfully! Redirecting...");
      }
      setTimeout(() => navigate("/organization/meetings"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to schedule meeting. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar/10">
      <AttendeePicker 
        isOpen={isAttendeePickerOpen}
        onClose={() => setIsAttendeePickerOpen(false)}
        onAssign={handleAddAttendees}
        title="Invite Organization Attendees"
        singleSelect={false}
      />

      {/* Header */}
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            <LayoutGrid size={18} className="shrink-0" />
            <span>Organization</span>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-charcoal">Meeting Workspace</span>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-primary font-bold">New Session</span>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <UserIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-0">
        <div className="max-w-[900px] mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="flex items-center gap-3 mb-10 group no-underline"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-border text-slate-400 group-hover:text-charcoal group-hover:border-charcoal/20 group-hover:bg-slate-50 transition-all duration-300 shadow-sm">
              <ChevronLeft size={18} />
            </div>
            <div className="flex flex-col items-start translate-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Return to</span>
              <span className="text-[11px] font-bold text-charcoal uppercase tracking-widest leading-none">Meeting Workspace</span>
            </div>
          </button>

          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              {isEditMode ? "Modify Scheduled Meeting" : "Schedule New Meeting"}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium italic">
              Picking system identifiers for synchronized minute-taking.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${
                    step.active ? "bg-charcoal text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                    step.active ? "text-charcoal" : "text-slate-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && <div className="w-6 md:w-12 h-[1px] bg-border" />}
              </div>
            ))}
          </div>

          {/* Alerts */}
          {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-bold shadow-sm">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-sm font-bold shadow-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6 pb-20">
            {/* Section 1: Meeting Context */}
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-border flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Info className="text-charcoal" size={16} />
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500">
                  Section 1: Meeting Context
                </span>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Quarterly Strategic Alignment"
                    className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                      Department / Unit
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                      Meeting Type
                    </label>
                    <div className="flex gap-3">
                      {["onsite", "online"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, meetingType: type }))}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                            formData.meetingType === type
                              ? "bg-charcoal text-white border-charcoal"
                              : "bg-white text-slate-500 border-border hover:bg-sidebar"
                          }`}
                        >
                          {type === "onsite" ? <MapPin size={13} /> : <Link2 size={13} />}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                    Meeting Objective
                  </label>
                  <textarea
                    name="objective"
                    value={formData.objective}
                    onChange={handleChange}
                    placeholder="Define the primary agenda and anticipated outcomes..."
                    rows={4}
                    className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium resize-none"
                  />
                </div>

                {formData.meetingType === "onsite" ? (
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Conference Room A, HQ"
                      className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Meeting Link</label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      placeholder="https://zoom.us/j/..."
                      className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Start Time</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Participants & Scribes */}
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-border flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Users className="text-charcoal" size={16} />
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500">
                  Section 2: Participants & Scribes
                </span>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Minute Taker Status Indicator */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                      Minute Taker Assignment
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.scribe ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {formData.scribe ? "Synchronized" : "Pending Selection"}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border-2 transition-all ${formData.scribe ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex items-center gap-4">
                      {formData.scribe ? (
                        <>
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-charcoal">{formData.scribe.name}</p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Assigned Minute Taker</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                            <Clock size={20} />
                          </div>
                          <p className="text-xs font-medium text-slate-400 italic">No participant identified as scribe yet. Use the toggle on attendee cards below.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-border/50"></div>

                {/* Attendee Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                      Attendee Invitations
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAttendeePickerOpen(true)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      <UserPlus size={14} />
                      Browse Directory
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.attendees.map(a => {
                      const isScriber = formData.scribe?._id === a._id;
                      return (
                        <div key={a._id} className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-200 group ${
                          isScriber 
                            ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                            : "bg-white border-border hover:border-charcoal/20"
                        }`}>
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors shadow-sm ${
                              isScriber ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                              {a.name?.[0] || "?"}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <p className={`text-xs font-bold truncate ${isScriber ? "text-emerald-900" : "text-charcoal"}`}>{a.name}</p>
                                {a.external && (
                                  <span className="bg-primary/10 text-primary text-[8px] font-bold px-1 rounded uppercase">EXternal</span>
                                )}
                                {isScriber && (
                                  <span className="bg-emerald-500/20 text-emerald-600 text-[8px] font-bold px-1 rounded uppercase">Scribe</span>
                                )}
                              </div>
                              <p className={`text-[10px] truncate lowercase ${isScriber ? "text-emerald-600/70" : "text-slate-400"}`}>{a.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              type="button"
                              onClick={() => toggleScribe(a._id)}
                              title={isScriber ? "Unset Scribe" : "Assign as Scribe"}
                              className={`p-1.5 rounded-lg transition-all ${
                                isScriber 
                                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                                  : "text-slate-300 hover:text-emerald-500 hover:bg-emerald-50"
                              }`}
                            >
                              <ShieldCheck size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAttendee(a._id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsAttendeePickerOpen(true)}
                      className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-lg hover:bg-sidebar/30 text-slate-400 transition-all group"
                    >
                      <UserPlus size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add Stakeholder</span>
                    </button>
                  </div>
                </div>
              </div>

            {/* Section 3: Recurrence Engine */}
            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calendar className="text-charcoal" size={16} />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500">
                    Section 3: Recurrence Engine
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enable Module</span>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${formData.isRecurring ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className={`p-6 md:p-8 transition-all duration-300 ${!formData.isRecurring ? "opacity-40 grayscale pointer-events-none bg-slate-50/30" : "opacity-100"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                      Frequency protocol
                    </label>
                    <div className="relative">
                       <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input
                         type="number"
                         min="1"
                         name="recurringFrequency"
                         value={formData.recurringFrequency}
                         onChange={handleChange}
                         placeholder="e.g. 7 for weekly"
                         className="w-full pl-9 pr-14 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium italic">How many days between each session? Set to 7 for weekly, 1 for daily.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                      Recurrence Limit Date
                    </label>
                    <input
                      type="date"
                      name="limitDate"
                      value={formData.limitDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/20 text-charcoal focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                    />
                    <p className="text-[9px] text-slate-400 font-medium italic">Final date of the series. Backend will generate meetings until this cap.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-border pt-8 mt-8">
              <button
                type="button"
                onClick={() => navigate("/organization/meetings")}
                className="w-full sm:w-auto px-8 py-3 text-[11px] font-bold text-charcoal border border-border rounded-lg bg-white hover:bg-sidebar transition-all uppercase tracking-widest"
              >
                Discard Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 text-[11px] font-bold text-white bg-charcoal rounded-lg hover:opacity-95 transition-all shadow-lg active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Initializing..." : "Finalize Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;