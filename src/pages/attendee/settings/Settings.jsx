import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Camera, Loader2, Save, Key, CheckCircle2, AlertCircle, Menu, CloudUpload } from 'lucide-react'
import { updateProfile, changePassword } from '../../../api/user'
import { useOutletContext } from 'react-router-dom'

const Settings = () => {
  const { user, login } = useAuth()
  const { toggleNav } = useOutletContext() || {}
  const [loading, setLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' })
  
  // Profile States
  const [name, setName] = useState(user?.name || '')
  const [profileImage, setProfileImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture?.url || null)
  const fileInputRef = useRef(null)

  // Security States
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPreviewUrl(user.profilePicture?.url || null)
    }
  }, [user])

  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    return nameStr
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setProfileMsg({ type: 'error', text: 'Name is required' })
    
    setLoading(true)
    setProfileMsg({ type: '', text: '' })
    console.log("Starting profile update with:", { name, hasImage: !!profileImage });

    try {
      const formData = new FormData()
      formData.append('name', name)
      if (profileImage) {
        formData.append('profilePicture', profileImage)
      }

      const res = await updateProfile(formData)
      console.log("Profile update response:", res);
      
      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
        updateUser(res.user);
        if (fetchUser) await fetchUser();
      } else {
        setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile' })
      }
    } catch (error) {
      console.error("Profile update error details:", error);
      setProfileMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwords.oldPassword) return setSecurityMsg({ type: 'error', text: 'Current password is required' })
    if (passwords.newPassword.length < 6) return setSecurityMsg({ type: 'error', text: 'New password must be at least 6 characters' })
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setSecurityMsg({ type: 'error', text: 'Passwords do not match' })
    }
    
    setLoading(true)
    setSecurityMsg({ type: '', text: '' })
    try {
      const res = await changePassword({
        currentPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      })
      if (res.success) {
        setSecurityMsg({ type: 'success', text: 'Password changed successfully!' })
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      setSecurityMsg({ type: 'error', text: error.response?.data?.message || 'Failed to change password' })
    } finally {
      setLoading(false)
      setTimeout(() => setSecurityMsg({ type: '', text: '' }), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12">
        
        {/* Header */}
        <header className="mb-8 md:mb-10 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <button 
              onClick={toggleNav}
              className="lg:hidden mt-1 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#2c3a4f] tracking-tight">Settings</h1>
              <p className="text-slate-500 mt-1 text-xs md:text-sm">Manage your account details and security</p>
            </div>
          </div>
          {profileMsg.text && (
            <div className={`w-full sm:w-auto px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all shadow-sm ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {profileMsg.text}
            </div>
          )}
        </header>

        <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 md:p-8">
          {/* Basic Info */}
          <section className="mb-10">
            <h2 className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
              Basic Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#e2e7ef] rounded-lg px-4 py-3 text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email} 
                    disabled 
                    className="w-full border border-[#e2e7ef] bg-slate-50 text-slate-400 cursor-not-allowed rounded-lg px-4 py-3 text-[13px] font-semibold italic"
                  />
                </div>
              </div>

              {/* Branding (Profile Picture) */}
              <div className="space-y-4">
                <h2 className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase">
                  Branding
                </h2>
                
                <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Profile Picture
                </label>
                
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-40 h-32 border-2 border-dashed border-[#d0d7e2] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-all mb-1 overflow-hidden group bg-white"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Logo" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <CloudUpload size={28} className="text-slate-300 mb-2 group-hover:text-slate-400 transition-colors" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upload Photo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <p className="text-[11px] text-slate-400 italic">
                  Recommended size: 512×512px. PNG, JPG or SVG preferred.
                </p>
              </div>

              <div className="flex justify-start pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-70 shadow-md active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Security Section */}
        <section className="mt-12">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Security</h3>
          
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-1.5 max-w-md">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
              <input 
                type="password" 
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-200 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-200 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-200 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 pt-4">
              {securityMsg.text && (
                <div className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${securityMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {securityMsg.text}
                </div>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-70 shadow-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                Update Security
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  )
}

export default Settings
