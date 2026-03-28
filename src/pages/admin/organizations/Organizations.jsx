import React, { useEffect, useState } from "react";
import { Search, Plus, Edit2, Eye, Loader2, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../../components/common/Pagination";
import axiosInstance from "../../../api/axiosinstance";

const statusBadge = (status) => {
  const styles = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    TERMINATED: "bg-rose-100 text-rose-700",
    organizer: "bg-blue-100 text-blue-700", // Default backend role/status
  };
  
  const displayStatus = status || "ACTIVE";
  const styleClass = styles[displayStatus] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${styleClass}`}
    >
      {displayStatus}
    </span>
  );
};

const Organizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredOrganizations.length / 10) || 1;

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/organizations");
      // Mapping backend data from response.data.organizations
      const orgsData = response.data.organizations || [];
      const mappedOrgs = orgsData.map(org => ({
        id: org._id,
        name: org.name,
        initials: org.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
        meetings: org.totalMeetings || 0,
        status: org.status || "ACTIVE",
        logo: org.logo?.url
      }));
      setOrganizations(mappedOrgs);
      setTotalCount(mappedOrgs.length);
    } catch (err) {
      setError("Failed to fetch organizations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDeleteConfirm = async () => {
    const { id, name } = deleteModal;
    try {
      // Optimistically update UI
      setOrganizations(prev => prev.filter(org => org.id !== id));
      setTotalCount(prev => prev - 1);
      
      // In a real app:
      // await axiosInstance.delete(`/organizations/${id}`);
      console.log(`Successfully deleted organization: ${name}`);
      setDeleteModal({ open: false, id: null, name: "" });
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete organization. Please try again.");
      fetchOrganizations(); // Rollback
      setDeleteModal({ open: false, id: null, name: "" });
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/organizations/edit/${id}`);
  };

  return (
    <div>
      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">Terminate Organization?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Are you sure you want to delete <span className="font-bold text-charcoal">{deleteModal.name}</span>? 
                This will move all associated data to the archive and restrict future access.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-border mt-2">
              <button 
                onClick={() => setDeleteModal({ open: false, id: null, name: "" })}
                className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors border-r border-border"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="py-4 text-xs font-bold text-rose-600 uppercase tracking-widest hover:bg-rose-50 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Organization Directory
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight">
                Manage enterprise partners and monitor client-level activity.
              </p>
              <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {filteredOrganizations.length} TOTAL
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search organizations..."
                className="pl-9 pr-4 py-2 bg-white border border-border rounded text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400 font-medium shadow-sm"
              />
            </div>
            <Link
              to="/admin/organizations/create"
              className="h-10 px-6 flex items-center justify-center gap-2 rounded bg-charcoal text-white text-[11px] font-bold hover:opacity-95 transition-all shadow-lg uppercase tracking-wider whitespace-nowrap"
            >
              <Plus size={18} />
              New Client
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 md:px-8 pb-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded text-sm">
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="border border-border rounded overflow-hidden mb-6 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-3 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                    Organization Name
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                    Total Meetings
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                    Current Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center text-slate-400">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                      Loading directory...
                    </td>
                  </tr>
                ) : filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-border last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/organizations/${org.id}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          {org.logo ? (
                            <img 
                              src={org.logo} 
                              alt={org.name} 
                              className="w-8 h-8 rounded object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400 font-bold text-[10px] border border-border shrink-0">
                              {org.initials}
                            </div>
                          )}
                          <span className="font-semibold text-charcoal truncate max-w-[150px] md:max-w-none">
                            {org.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{org.meetings}</td>
                      <td className="px-4 py-3">
                        {statusBadge(org.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleEdit(org.id)}
                            className="w-9 h-9 flex items-center justify-center rounded bg-sidebar hover:bg-charcoal/5 text-slate-500 hover:text-charcoal transition-all shadow-sm border border-border/50"
                            title="Edit Configuration"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ open: true, id: org.id, name: org.name })}
                            className="w-9 h-9 flex items-center justify-center rounded bg-rose-50 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-rose-100/50"
                            title="Delete Organization"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center text-slate-400 italic">
                      No organizations registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalResults={filteredOrganizations.length}
          label="organizations"
        />
      </div>
    </div>
  );
};

export default Organizations;
