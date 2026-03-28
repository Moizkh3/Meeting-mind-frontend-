import { useState, useEffect } from 'react'
import {
  Calendar,
  ChevronDown,
  Clock,
  Quote,
  Timer,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Search,
  Menu
} from 'lucide-react'
import { useOutletContext, Link } from 'react-router-dom'
import { getAllMeetings } from '../../../api/meetings'

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const MeetingArchive = () => {
  const { toggleNav } = useOutletContext() || {}
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedDateRange, setSelectedDateRange] = useState('All Dates')
  const itemsPerPage = 5

  // Helper to get date parameters for backend
  const getDateParams = (range) => {
    const today = new Date();
    let startDate = null;
    const endDate = new Date().toISOString();

    if (range === 'Today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      startDate = d.toISOString();
    } else if (range === 'This Week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString();
    } else if (range === 'This Month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      startDate = d.toISOString();
    }

    return startDate ? { startDate, endDate } : {};
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1) // Reset to first page when search changes
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true)
      try {
        const dateParams = getDateParams(selectedDateRange);
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          status: 'completed', // Only completed meetings in archive
          ...dateParams
        };

        if (debouncedSearch) {
          params.agenda = debouncedSearch;
        }

        console.log('DEBUG: Fetching archive with params:', params);
        const response = await getAllMeetings(params);
        console.log('DEBUG: Archive response:', response);
        
        if (response.success) {
          setMeetings(response.data || []);
          setTotalPages(response.pagination?.pages || 1);
          setTotalResults(response.pagination?.total || (response.data?.length || 0));
        }
      } catch (err) {
        console.error('Failed to fetch archive', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, [currentPage, debouncedSearch, selectedDateRange]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = meetings;

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">

        {/* Breadcrumb & Title */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-secondary mb-3">
            <span className="opacity-40">My Portal</span>
            <span className="opacity-40">/</span>
            <span className="text-primary">Archive</span>
          </div>
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <button 
              onClick={toggleNav}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Meeting Archive</h2>
          </div>
          <p className="text-secondary font-medium text-sm lg:pl-0 pl-1">History of all your attended meetings and transcripts</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full md:w-auto md:flex-1">
            <div className="relative group w-full sm:flex-1 sm:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search agenda or description..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 outline-none focus:border-black rounded-none text-sm transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative group w-full sm:w-auto">
              <select 
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto h-10 pl-10 pr-10 bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-primary appearance-none cursor-pointer focus:border-black outline-none transition-colors shadow-sm min-w-0 sm:min-w-[160px]"
              >
                <option value="All Dates">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="text-[10px] font-bold text-secondary uppercase tracking-widest pl-0 md:pl-4 self-end md:self-auto">
            {totalResults > 0
              ? `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalResults)} of ${totalResults} results`
              : 'No results'}
          </div>
        </div>

        {/* Meeting Cards List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-400 mb-2" size={24} />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Archive...</p>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 p-10 sm:p-16 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-400">No archived meetings found</p>
            <p className="text-xs text-slate-300 mt-1">Completed meetings will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentRecords.map((record) => (
              <div key={record._id} className="bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Card Header */}
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                  <div className="order-2 sm:order-1">
                    <h3 className="text-lg font-bold text-primary tracking-tight mb-1 flex items-center gap-3">
                      {record.agenda}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-secondary uppercase tracking-tight">
                      <span className="flex items-center gap-1.5 opacity-80 min-w-fit">
                        <Calendar size={14} /> {formatDate(record.startAt)}
                      </span>
                      <span className="flex items-center gap-1.5 opacity-80 min-w-fit">
                        <Clock size={14} /> {formatTime(record.startAt)}
                      </span>
                    </div>
                  </div>
                  <span className="order-1 sm:order-2 self-start bg-[#1e293b] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-none uppercase">
                    {record.meetingStatus?.toUpperCase() || 'COMPLETED'}
                  </span>
                </div>

                {/* Card Body (Description) */}
                {record.description && (
                  <div className="px-4 sm:px-6 py-4 mx-4 sm:mx-6 mb-6 bg-slate-50 border-l-2 border-slate-200 relative flex gap-4">
                    <Quote className="text-slate-300 absolute left-4 top-4 sm:top-5 opacity-40 shrink-0" size={16} />
                    <p className="text-[13px] sm:text-sm text-secondary leading-relaxed pl-6 sm:pl-8 italic font-medium pr-2 sm:pr-4">
                      {record.description}
                    </p>
                  </div>
                )}

                {/* Card Footer */}
                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-secondary/60 uppercase tracking-widest">
                    <span className="flex items-center gap-2 min-w-fit">
                      <Timer size={16} /> TYPE: {record.meetingType?.toUpperCase() || 'N/A'}
                    </span>
                    <span className="flex items-center gap-2 min-w-fit">
                      <ClipboardCheck size={16} /> ATTENDEES: {record.attendees?.length || 0}
                    </span>
                  </div>
                  <Link
                    to={`/attendee/archive/transcript?meetingId=${record._id}`}
                    className="w-full sm:w-auto text-center px-6 py-2.5 sm:py-2 border border-black text-black text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-all duration-200 rounded-none shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-between py-8 border-t border-slate-200">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors group ${currentPage === 1 ? 'text-secondary/40 cursor-not-allowed' : 'text-secondary hover:text-black'}`}
            >
              <ArrowLeft size={18} />
              PREVIOUS
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-black text-white' : 'text-secondary hover:bg-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors group ${currentPage === totalPages ? 'text-secondary/40 cursor-not-allowed' : 'text-secondary hover:text-black'}`}
            >
              NEXT
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default MeetingArchive
