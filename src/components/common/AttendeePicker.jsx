import React, { useState, useEffect } from "react";
import { Search, X, UserPlus, Check, Loader2, AlertCircle, Plus, Mail } from "lucide-react";
import axiosInstance from "../../api/axiosinstance";

const AttendeePicker = ({ 
  isOpen, 
  onClose, 
  onAssign, 
  title = "Assign Scribe Role",
  singleSelect = true 
}) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      setSearch("");
      setSelectedUsers([]);
      setError("");
    }
  }, [isOpen]);

  const fetchUsers = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(`/auth/users?search=${query}&limit=20`);
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen) fetchUsers(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, isOpen]);

  const toggleSelection = (user) => {
    if (singleSelect) {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => 
        prev.some(u => u._id === user._id)
          ? prev.filter(u => u._id !== user._id)
          : [...prev, user]
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/80">
          <div>
            <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">
              {title}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
              {singleSelect ? "Select one user" : "Select multiple users"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-charcoal transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search directory by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-sidebar/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-slate-400 font-medium"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-primary" size={16} />
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50/30">
          {error ? (
            <div className="py-12 text-center text-rose-500 flex flex-col items-center gap-2">
              <AlertCircle size={24} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => {
              const isSelected = selectedUsers.some(u => u._id === user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => toggleSelection(user)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white border-primary/50 shadow-sm"
                      : "hover:bg-white border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.profilePicture?.url ? (
                      <img 
                        src={user.profilePicture.url} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-charcoal text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                        {(user.name || "U")[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-charcoal">
                        {user.name || "Anonymous User"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium lowercase">
                        {user.email} • <span className="text-primary/70 font-semibold uppercase">{user.role}</span>
                      </p>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="text-white" size={14} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border border-border rounded-full" />
                  )}
                </div>
              );
            })
          ) : !loading && search.includes("@") ? (
            <div 
              onClick={() => toggleSelection({ _id: search, name: search.split("@")[0], email: search, external: true })}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border bg-white border-primary/20 hover:border-primary/50 shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal uppercase tracking-tighter">Invite External</p>
                  <p className="text-xs text-slate-500 font-medium">{search}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                Add External
                <Plus size={14} />
              </div>
            </div>
          ) : !loading ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400 italic">No users matching your criteria.</p>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="p-4 bg-white border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-charcoal transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            disabled={selectedUsers.length === 0}
            onClick={() => onAssign(singleSelect ? selectedUsers[0] : selectedUsers)}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-2 rounded-lg text-xs font-bold hover:opacity-95 transition-all shadow-lg shadow-charcoal/20 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            <UserPlus size={16} />
            {singleSelect ? "Confirm Assignment" : `Invite ${selectedUsers.length} Attendees`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeePicker;
