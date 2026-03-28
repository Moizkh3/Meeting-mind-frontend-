import { useState, useEffect } from 'react'
import { Link, useLocation, useOutletContext } from 'react-router-dom'
import {
  Search,
  Calendar,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Menu
} from 'lucide-react'
import { getAllMeetings } from '../../../api/meetings'
import { useAuth } from '../../../context/AuthContext'

// Helper to format date
const formatMeetingTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const isMeetingLive = (startAt) => {
  const now = new Date();
  const meetingTime = new Date(startAt);
  // Assume meeting is live if it started within the last hour or starts now
  const diff = now - meetingTime;
  return diff >= 0 && diff < 3600000; // 1 hour window
};

const Meetings = () => {
  const [search, setSearch] = useState('')
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // New Filter States
  const [selectedOrg, setSelectedOrg] = useState('All')
  const [selectedDateRange, setSelectedDateRange] = useState('All Dates')
  const [selectedSpecificDate, setSelectedSpecificDate] = useState('') // New state for calendar date

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const role = searchParams.get('role') // Fallback for manual links
  const { user } = useAuth()

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { toggleNav } = useOutletContext();

  useEffect(() => {
    setCurrentPage(1); // Reset page when filters or search changes
  }, [search, selectedOrg, selectedDateRange, selectedSpecificDate]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await getAllMeetings();
        console.log('DEBUG: Full Meetings Response:', response);
        if (response.success && Array.isArray(response.data)) {
          console.log(`DEBUG: Fetched ${response.data.length} meetings`);
          setMeetings(response.data);
        } else {
          console.warn('DEBUG: Response success is false or data is not an array', response);
          setError(response.message || 'Failed to fetch meetings');
        }
      } catch (err) {
        console.error('DEBUG: Fetch error:', err);
        setError('An error occurred while fetching meetings');
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  // Extract unique organizations for the filter
  const organizations = ['All', ...new Set(meetings.map(m => m.organizedBy?.name || m.department || m.organizationName || m.company || 'INTERNAL').filter(Boolean))];

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch =
      (meeting.agenda || '').toLowerCase().includes(search.toLowerCase()) ||
      (meeting.description || '').toLowerCase().includes(search.toLowerCase());

    // Fallback logic for organization
    const orgValue = meeting.organizedBy?.name || meeting.department || meeting.organizationName || meeting.company || 'INTERNAL';
    const matchesOrg = selectedOrg === 'All' || orgValue === selectedOrg;

    let matchesDate = true;
    if (meeting.startAt) {
      const meetingDate = new Date(meeting.startAt);
      const today = new Date();

      if (selectedSpecificDate) {
        // Filter by specific date from calendar
        matchesDate = meetingDate.toDateString() === new Date(selectedSpecificDate).toDateString();
      } else if (selectedDateRange === 'Today') {
        matchesDate = meetingDate.toDateString() === today.toDateString();
      } else if (selectedDateRange === 'This Week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        matchesDate = meetingDate >= weekAgo && meetingDate <= today;
      }
    } else if (selectedDateRange !== 'All Dates' || selectedSpecificDate) {
      // If no date and we are filtering by date, exclude it
      matchesDate = false;
    }

    return matchesSearch && matchesOrg && matchesDate;
  });

  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMeetings = filteredMeetings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Page Content */}
      <div className="p-4 md:p-10 max-w-[1280px] mx-auto w-full">
        {/* Header Section */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <button
              onClick={toggleNav}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Meetings</h2>
          </div>
          <p className="text-secondary font-medium text-xs md:text-sm mt-1 opacity-60 lg:pl-0 pl-1">View your upcoming scheduled meetings</p>
        </div>

        {/* Toolbar Container */}
        <div className="bg-white border border-[#c6c6c6]/30 p-4 mb-6 md:mb-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 shadow-sm">
          <div className="flex-1 lg:max-w-[320px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search upcoming meetings..."
              className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 outline-none focus:border-black rounded-sm text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:flex-1">
            <div className="relative group min-w-0">
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setSelectedSpecificDate('');
                }}
                className="w-full h-10 pl-10 pr-8 bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-[#1a1c1e] appearance-none cursor-pointer focus:border-black outline-none transition-colors shadow-sm rounded-sm truncate"
              >
                <option value="All Dates">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>

            <div className="relative h-10 group min-w-0">
              <input
                type="date"
                value={selectedSpecificDate}
                onChange={(e) => {
                  setSelectedSpecificDate(e.target.value);
                  setSelectedDateRange('All Dates');
                }}
                className="w-full h-full pl-10 pr-4 bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-[#1a1c1e] cursor-pointer focus:border-black outline-none transition-colors appearance-none shadow-sm rounded-sm truncate"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              {selectedSpecificDate && (
                <button
                  onClick={() => setSelectedSpecificDate('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-[10px] font-bold"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="relative group min-w-0">
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full h-10 pl-4 pr-10 bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-[#1a1c1e] appearance-none cursor-pointer focus:border-black outline-none transition-colors shadow-sm rounded-sm truncate"
              >
                {organizations.map(org => (
                  <option key={org} value={org}>{org === 'All' ? 'Organization: All' : org.toUpperCase()}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* Meetings Content */}
        <div className="space-y-4 md:space-y-0">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="bg-white p-10 text-center border border-slate-100 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-slate-400" size={24} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Meetings...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-10 text-center text-red-500 font-bold text-sm border border-slate-100">{error}</div>
            ) : currentMeetings.length === 0 ? (
              <div className="bg-white p-10 text-center text-slate-400 font-bold text-sm border border-slate-100">No meetings found</div>
            ) : (
              currentMeetings.map((meeting) => {
                const isLive = isMeetingLive(meeting.startAt) && meeting.meetingStatus !== 'completed' && meeting.meetingStatus !== 'cancelled';
                const isUserScribe = (meeting.scriber === (user?._id || user)) || 
                                     meeting.attendees?.some(a => String(a.user?._id || a.user || "") === String(user?._id || "") && a.isScriber);
                return (
                  <div key={meeting._id} className="bg-white border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-primary text-base tracking-tight">{meeting.agenda}</h3>
                        <p className="text-[10px] text-secondary font-bold mt-1 opacity-60">{meeting.organizedBy?.name || 'INTERNAL'}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-[0.1em] uppercase border ${meeting.meetingType === 'online' ? 'bg-blue-50 text-blue-600 border-blue-100/50' : 'bg-orange-50 text-orange-600 border-orange-100/50'
                        }`}>
                        {meeting.meetingType || 'ONLINE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Time</p>
                        <p className="text-xs font-bold text-primary">{formatMeetingTime(meeting.startAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {isLive || meeting.meetingStatus === 'continue' ? (
                        <>
                          <span className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-[10px] font-bold tracking-[0.1em] uppercase rounded-sm">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            LIVE NOW
                          </span>
                          <Link
                            to={isUserScribe ? `/attendee/live-canvas?meetingId=${meeting._id}&role=scribe` : `/attendee/live-session?meetingId=${meeting._id}${role ? `&role=${role}` : ''}`}
                            className="flex items-center justify-center px-6 py-3 bg-[#2c3a4f] text-white text-[10px] font-bold uppercase tracking-[0.2em] no-underline"
                          >
                            JOIN MEETING
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className={`flex items-center justify-center px-3 py-2 border text-[10px] font-bold tracking-[0.1em] uppercase rounded-sm ${meeting.meetingStatus === 'completed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                            meeting.meetingStatus === 'cancelled' ? 'border-red-200 text-red-600 bg-red-50' :
                              'border-slate-200 text-secondary'
                            }`}>
                            {meeting.meetingStatus?.toUpperCase() || 'SCHEDULED'}
                          </span>
                          {meeting.meetingStatus === 'completed' ? (
                            <>
                              {meeting.attendees?.find(a => String(a.user?._id || a.user) === String(user?._id))?.feedbackProvided ? (
                                <span className="flex items-center justify-center px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em]">
                                  FEEDBACK SUBMITTED
                                </span>
                              ) : (
                                <Link
                                  to={`/attendee/feedback/${meeting._id}`}
                                  className="flex items-center justify-center px-6 py-3 bg-[#1e293b] text-white text-[10px] font-bold uppercase tracking-[0.2em] no-underline"
                                >
                                  GIVE FEEDBACK
                                </Link>
                              )}
                            </>
                          ) : (
                            <button
                              disabled
                              className="flex items-center justify-center px-6 py-3 bg-slate-50 text-secondary/30 border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] cursor-not-allowed"
                            >
                              JOIN MEETING
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-[#c6c6c6]/30 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-[0.15em]">Meeting Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-[0.15em]">Organization</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-[0.15em]">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-[0.15em]">Scheduled Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary/60 uppercase tracking-[0.15em] text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-slate-400" size={24} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Meetings...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-red-500 font-bold text-sm">{error}</td>
                  </tr>
                ) : currentMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold text-sm">No meetings found</td>
                  </tr>
                ) : (
                  currentMeetings.map((meeting) => {
                    const isLive = isMeetingLive(meeting.startAt) && meeting.meetingStatus !== 'completed' && meeting.meetingStatus !== 'cancelled';
                    const isUserScribe = (meeting.scriber === (user?._id || user)) || 
                                         meeting.attendees?.some(a => String(a.user?._id || a.user || "") === String(user?._id || "") && a.isScriber);
                    return (
                      <tr key={meeting._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-6">
                          <p className="font-bold text-primary text-sm tracking-tight">{meeting.agenda}</p>
                          <p className="text-[10px] text-secondary font-bold mt-1 opacity-60 truncate max-w-[200px]">{meeting.description || 'No description available'}</p>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-[12px] font-bold text-secondary uppercase tracking-tight leading-6">
                            {meeting.organizedBy?.name || meeting.department || meeting.organizationName || meeting.company || 'INTERNAL'}
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[10px] font-bold tracking-[0.1em] uppercase border ${meeting.meetingType === 'online'
                            ? 'bg-blue-50 text-blue-600 border-blue-100/50'
                            : 'bg-orange-50 text-orange-600 border-orange-100/50'
                            }`}>
                            {meeting.meetingType || 'ONLINE'}
                          </span>
                        </td>
                        <td className="px-6 py-6 font-medium">
                          <p className="text-xs font-bold text-primary uppercase tracking-tight">{formatMeetingTime(meeting.startAt)}</p>
                          <p className="text-[9px] text-secondary font-bold mt-1 opacity-40">UTC Timezone</p>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3">
                            {isLive || meeting.meetingStatus === 'continue' ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold tracking-[0.1em] uppercase rounded-sm whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                  LIVE NOW
                                </span>
                                <Link
                                  to={isUserScribe ? `/attendee/live-canvas?meetingId=${meeting._id}&role=scribe` : `/attendee/live-session?meetingId=${meeting._id}${role ? `&role=${role}` : ''}`}
                                  className="inline-flex items-center justify-center px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-none shadow-sm no-underline bg-black text-white hover:bg-[#3d4f66] whitespace-nowrap"
                                >
                                  JOIN MEETING
                                </Link>
                              </>
                            ) : (
                              <>
                                <span className={`inline-flex items-center px-3 py-1 border text-[10px] font-bold tracking-[0.1em] uppercase rounded-sm whitespace-nowrap ${meeting.meetingStatus === 'completed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                  meeting.meetingStatus === 'cancelled' ? 'border-red-200 text-red-600 bg-red-50' :
                                    'border-slate-200 text-secondary'
                                  }`}>
                                  {meeting.meetingStatus?.toUpperCase() || 'SCHEDULED'}
                                </span>
                                {meeting.meetingStatus === 'completed' ? (
                                  <>
                                    {meeting.attendees?.find(a => {
                                      const attUserId = String(a.user?._id || a.user || "");
                                      const currentUserId = String(user?._id || "");
                                      return (attUserId === currentUserId) || (!a.isRegistered && a.emailForUnregisteredAttendee === user?.email);
                                    })?.feedbackProvided ? (
                                      <span className="inline-flex items-center justify-center px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-none shadow-sm no-underline bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
                                        FEEDBACK SUBMITTED
                                      </span>
                                    ) : (
                                      <Link
                                        to={`/attendee/feedback/${meeting._id}`}
                                        className="inline-flex items-center justify-center px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-none shadow-sm no-underline bg-black text-white hover:bg-black whitespace-nowrap"
                                      >
                                        GIVE FEEDBACK
                                      </Link>
                                    )}
                                  </>
                                ) : (
                                  <Link
                                    to="#"
                                    className="inline-flex items-center justify-center px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-none shadow-sm no-underline bg-slate-50 text-secondary/40 border border-slate-100 cursor-not-allowed pointer-events-none whitespace-nowrap"
                                  >
                                    JOIN MEETING
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination / Footer */}
          <div className="px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/20">
            <span className="text-[9px] md:text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMeetings.length)} of {filteredMeetings.length} meetings
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`w-7 h-7 flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-white transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold ${currentPage === i + 1 ? 'bg-black text-white px-3 w-auto' : 'border border-slate-200 text-secondary hover:bg-white'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`w-7 h-7 flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-white transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Meetings
