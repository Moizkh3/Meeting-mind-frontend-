import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    title: user?.role || 'Attendee',
    email: user?.email || '',
    bio: '',
    phone: '',
    location: ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [profilePic, setProfilePic] = useState(user?.profilePicture?.url || null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(220,230,245,0.6)',
        }}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage your personal information</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
              isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-black'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-10 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div
            className="md:col-span-1 p-8 rounded-3xl flex flex-col items-center text-center shadow-xl shadow-slate-900/5"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(210, 225, 245, 0.8)',
            }}
          >
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-slate-400">{initials}</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{profile.name || 'Your Name'}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{profile.title}</p>

            <div className="w-full h-px bg-slate-100 my-6"/>

            <div className="w-full text-left space-y-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{profile.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-sm font-semibold text-slate-700">{profile.location || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-8">
            <div
              className="p-8 rounded-3xl shadow-xl shadow-blue-500/5"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(210, 225, 245, 0.8)',
              }}
            >
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.2em] mb-6">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{profile.name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                  <p className="text-sm font-bold text-slate-700 capitalize">{profile.title}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Biography</label>
                  {isEditing ? (
                    <textarea
                      rows="4"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{profile.bio || 'No bio added yet'}</p>
                  )}
                </div>
              </div>
            </div>

            <div
              className="p-8 rounded-3xl shadow-xl shadow-blue-500/5"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(210, 225, 245, 0.8)',
              }}
            >
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.2em] mb-6">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{profile.phone || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Office Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
                      placeholder="Your location"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{profile.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
