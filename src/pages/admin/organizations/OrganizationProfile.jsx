import {
  Building2,
  Calendar,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  Edit2,
  Loader2,
  AlertCircle,
  Users
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../../api/axiosinstance";

const OrganizationProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the organization
        const orgRes = await axiosInstance.get(`/organizations/${id}`);
        const orgPayload = orgRes.data?.organization || orgRes.data;
        const orgData = Array.isArray(orgPayload) ? orgPayload[0] : orgPayload;
        setOrg(orgData);

        // Fetch meetings for this org
        const meetingsRes = await axiosInstance.get("/meetings/getAllMeetings");
        const allMeetings = meetingsRes.data?.data || [];
        // Filter meetings organized by this org
        const orgMeetings = allMeetings.filter(
          (m) => m.organizedBy?._id === id || m.organizedBy === id
        );
        setMeetings(orgMeetings);

        // Fetch detailed meetings to get populated attendees
        const meetingDetailsPromises = orgMeetings.map((m) =>
          axiosInstance.get(`/meetings/id/${m._id}`).catch(() => null)
        );
        const detailedMeetingsRes = await Promise.all(meetingDetailsPromises);
        
        const uniqueAttendees = new Map();
        
        detailedMeetingsRes.forEach((res) => {
          if (!res) return;
          const meetingData = res.data?.data?.meeting || res.data?.data;
          if (meetingData?.attendees) {
            meetingData.attendees.forEach((att) => {
              const u = att.user;
              if (att.isRegistered && u) {
                if (!uniqueAttendees.has(u._id)) {
                  uniqueAttendees.set(u._id, {
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    role: u.role || "attendee",
                    isRegistered: true,
                    isScriber: att.isScriber,
                  });
                }
              } else if (!att.isRegistered && att.emailForUnregisteredAttendee) {
                if (!uniqueAttendees.has(att.emailForUnregisteredAttendee)) {
                  uniqueAttendees.set(att.emailForUnregisteredAttendee, {
                    id: att.emailForUnregisteredAttendee,
                    name: att.nameForUnregisteredAttendee,
                    email: att.emailForUnregisteredAttendee,
                    role: "attendee",
                    isRegistered: false,
                    isScriber: att.isScriber,
                  });
                }
              }
            });
          }
        });
        setAttendees(Array.from(uniqueAttendees.values()));
      } catch (err) {
        console.error("Failed to load organization profile:", err);
        setError("Could not load organization details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="text-rose-400" size={40} />
        <p className="text-slate-500 font-medium">{error || "Organization not found."}</p>
        <button
          onClick={() => navigate("/admin/organizations")}
          className="text-sm font-bold text-primary hover:underline"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const initials = org.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const scheduledCount = meetings.filter(
    (m) => new Date(m.startAt) > new Date()
  ).length;
  const completedCount = meetings.filter(
    (m) => new Date(m.startAt) <= new Date()
  ).length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/admin/organizations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-charcoal uppercase tracking-widest transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Directory
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          {org.logo?.url ? (
            <img
              src={org.logo.url}
              alt={org.name}
              className="w-16 h-16 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-border">
              <span className="text-xl font-bold text-slate-400">{initials}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-charcoal">{org.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{org._id}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {org.email && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail size={12} />
                  {org.email}
                </span>
              )}
              {org.phone && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone size={12} />
                  {org.phone}
                </span>
              )}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Globe size={12} />
                  {org.website}
                </a>
              )}
              {org.createdAt && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={12} />
                  Active since {new Date(org.createdAt).toLocaleDateString([], { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/admin/organizations/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-charcoal text-white rounded-lg hover:opacity-90 transition-all"
          >
            <Edit2 size={14} />
            Edit
          </button>
        </div>
      </div>

      {/* Meeting Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Meetings
          </p>
          <p className="text-3xl font-bold text-charcoal">{meetings.length}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Upcoming
          </p>
          <p className="text-3xl font-bold text-charcoal">{scheduledCount}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Completed
          </p>
          <p className="text-3xl font-bold text-charcoal">{completedCount}</p>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">
            Meeting History
          </h3>
        </div>
        {meetings.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Agenda
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {meetings.slice(0, 10).map((m) => {
                const isPast = new Date(m.startAt) <= new Date();
                return (
                  <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-charcoal">
                      {m.agenda || "Untitled Meeting"}
                    </td>
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(m.startAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-3 text-slate-500 capitalize">
                      {m.meetingType || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isPast
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isPast ? "Completed" : "Upcoming"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-16 text-center">
            <Building2 className="mx-auto text-slate-200 mb-3" size={40} />
            <p className="text-sm text-slate-400 italic">
              No meetings scheduled for this organization yet.
            </p>
          </div>
        )}
      </div>
      {/* Attendees */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            Attendees from all Meetings
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {attendees.length} Total
          </span>
        </div>
        {attendees.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Name</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Email</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Role</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendees.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-charcoal">{a.name || "—"}</td>
                  <td className="px-6 py-3 text-slate-500">{a.email}</td>
                  <td className="px-6 py-3 capitalize text-slate-500">{a.role}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.isRegistered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {a.isRegistered ? "Registered" : "Invited"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto text-slate-200 mb-3" size={40} />
            <p className="text-sm text-slate-400 italic">No attendees found for this organization.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationProfile;
