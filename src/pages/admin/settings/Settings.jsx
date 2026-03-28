import { useState, useEffect, useRef } from "react";
import { 
  ChevronRight, 
  User, 
  Shield, 
  CheckCircle, 
  Loader2, 
  Mail, 
  AlertCircle,
  Camera,
  Upload,
  Lock
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axiosinstance";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture?.url || "");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email
      });
      setPreviewUrl(user.profilePicture?.url || "");
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (profileFile) {
        data.append("profilePicture", profileFile);
      }

      // Backend expects PUT for updateProfile
      const response = await axiosInstance.put("/auth/updateProfile", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setProfileFile(null);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }

    setPassSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axiosInstance.post("/auth/changePassword", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Password update failed." });
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar/10 pb-20 font-display">
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-border/10">
          <div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
              <span>Admin Dashboard</span>
              <ChevronRight size={12} />
              <span className="text-primary font-bold">Preferences</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">Account Settings</h1>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-8 max-w-[900px] mx-auto">
        {message.text && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}>
            <div className="flex items-center gap-3">
              {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-bold uppercase tracking-tight">{message.text}</span>
            </div>
            <button onClick={() => setMessage({ type: "", text: "" })} className="text-xs font-bold opacity-50 uppercase">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-border flex items-center gap-3">
              <User size={16} className="text-slate-500" />
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Profile Identity</span>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-sidebar/50 border-2 border-border/50 flex items-center justify-center relative shadow-inner">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-300" />}
                    <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-charcoal/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer">
                      <Camera className="text-white" size={20} />
                      <span className="text-[9px] font-bold text-white uppercase mt-1">Change</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">Avatar Image</h3>
                  <p className="text-xs text-slate-400 mt-1 italic">Click the image or "Upload" to select a new professional photo.</p>
                  <button type="button" onClick={() => fileInputRef.current.click()} className="mt-3 px-4 py-2 border border-border text-[10px] uppercase font-bold rounded hover:bg-sidebar transition-all flex items-center gap-2 mx-auto md:mx-0 tracking-widest">
                    <Upload size={12} /> Upload New
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/10">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/10 focus:ring-1 focus:ring-primary focus:outline-none font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/10 focus:ring-1 focus:ring-primary focus:outline-none font-medium" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-charcoal text-white text-[11px] font-bold uppercase rounded shadow-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {saving ? "Saving..." : "Update Details"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Real Change Password Form */}
        <form onSubmit={handleChangePassword}>
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-border flex items-center gap-3">
              <Shield size={16} className="text-slate-500" />
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-widest">Security Credentials</span>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Current Password</label>
                  <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/10 focus:ring-1 focus:ring-primary focus:outline-none font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">New Password</label>
                  <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/10 focus:ring-1 focus:ring-primary focus:outline-none font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Confirm New</label>
                  <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-sidebar/10 focus:ring-1 focus:ring-primary focus:outline-none font-medium" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={passSaving} className="px-6 py-3 border border-charcoal text-charcoal text-[11px] font-bold uppercase rounded hover:bg-sidebar flex items-center gap-2 tracking-widest disabled:opacity-50">
                  {passSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={12} />}
                  {passSaving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
