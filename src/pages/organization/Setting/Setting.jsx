import { useState, useRef, useEffect } from "react";
import { CloudUpload, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function Settings() {
  const { user, fetchUser, updateUser } = useAuth();

  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    if (user) {
      setOrgName(user.name || "");
      setEmail(user.email || "");

      // Flexible extraction of the profile photo URL (handles objects and strings)
      const photoUrl = 
        user.profilePicture?.url || 
        (typeof user.profilePicture === 'string' ? user.profilePicture : null) || 
        user.logo?.url || 
        (typeof user.logo === 'string' ? user.logo : null);
      
      if (photoUrl) {
        setLogo(photoUrl);
      }
    }
  }, [user]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
      setLogoFile(file);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      alert("Organization deleted.");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", orgName);
      formData.append("email", email);
      if (logoFile) {
        formData.append("profilePicture", logoFile);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/auth/updateProfile`,
        formData,
        { withCredentials: true }
      );

      // Force context to fetch fresh data directly from MongoDB 
      await fetchUser();
      
      // Manually trigger a context update to ensure UI reflects changes immediately
      if (response.data && response.data.user) {
        updateUser(response.data.user);
      }
      
      showToast("success", response.data?.message || "Settings updated in database successfully!");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast("error", "All password fields are required");
    }
    if (newPassword !== confirmPassword) {
      return showToast("error", "Passwords do not match");
    }
    if (newPassword.length < 6) {
      return showToast("error", "New password must be at least 6 characters");
    }

    setPassLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/changePassword`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      showToast("success", response.data?.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("error", err.response?.data?.message || err.message || "Failed to update password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] p-8 relative">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-[13px] font-semibold transition-all
            ${toast.type === "success"
              ? "bg-[#eafaf1] border border-[#6fcf97] text-[#1a7a45]"
              : "bg-[#fff5f5] border border-[#f5c0c0] text-[#c0392b]"
            }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <h1 className="text-[20px] font-bold text-[#2c3a4f] mb-1">Settings</h1>
      <p className="text-[13px] text-[#8a99b0] mb-6">
        Manage your organization profile and preferences
      </p>

      <div className="flex gap-6">
        <div className="flex-1 bg-white border border-[#e2e7ef] rounded-xl p-6">

          {/* Basic Info */}
          <h2 className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase mb-4">
            Basic Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] focus:outline-none focus:border-[#4a6fa5] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border border-[#e2e7ef] bg-[#f7f9fc] text-[#8a99b0] cursor-not-allowed rounded-lg px-4 py-2.5 text-[13px] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Branding */}
          <h2 className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase mb-4">
            Branding
          </h2>

          <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-2">
            Logo / Profile Picture
          </label>
          <div
            onClick={() => fileRef.current.click()}
            className="w-36 h-28 border-2 border-dashed border-[#d0d7e2] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#4a6fa5] hover:bg-[#f7f9fc] transition-colors mb-1 overflow-hidden"
          >
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <>
                <CloudUpload size={24} className="text-[#8a99b0] mb-1" />
                <span className="text-[12px] text-[#8a99b0]">Upload Logo</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          <p className="text-[11px] text-[#8a99b0] italic mb-6">
            Recommended size: 512×512px. PNG or SVG preferred.
          </p>

          {/* Security / Password section */}
          <div className="border-t border-slate-100 pt-6 mb-6">
            <h2 className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase mb-4 flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              Security & Authentication
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] focus:outline-none focus:border-[#4a6fa5] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] focus:outline-none focus:border-[#4a6fa5] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-[#7a8699] uppercase mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] focus:outline-none focus:border-[#4a6fa5] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-2 border border-[#4a6fa5] bg-[#f7f9fc] rounded-lg text-[11px] font-bold tracking-widest text-[#4a6fa5] uppercase hover:bg-[#4a6fa5] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {passLoading && <Loader2 size={13} className="animate-spin" />}
                {passLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="border border-[#f5c0c0] bg-[#fff5f5] rounded-lg p-4">
            <p className="text-[12px] font-black tracking-widest text-[#c0392b] uppercase mb-1">
              Danger Zone
            </p>
            <p className="text-[12px] text-[#c0392b] mb-3">
              Permanently delete your organization and all associated meeting data, transcripts, and analytics.
              This action cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-[#c0392b] rounded-lg text-[11px] font-black tracking-widest text-[#c0392b] uppercase hover:bg-[#fde8e8] transition-colors"
            >
              Delete Organization
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-[#2c3a4f] text-white text-[13px] font-bold rounded-lg hover:bg-[#3d4f66] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}