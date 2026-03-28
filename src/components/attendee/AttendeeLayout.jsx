import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AttendeeSidebar from './AttendeeSidebar'

const AttendeeLayout = () => {
  const [isNavOpen, setIsNavOpen] = useState(window.innerWidth >= 1024)

  const toggleNav = () => setIsNavOpen(!isNavOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar with toggle transition */}
      <div 
        className={`fixed inset-y-0 left-0 z-[60] h-full transition-all duration-300 ease-in-out lg:relative ${
          isNavOpen ? 'translate-x-0 w-64 opacity-100' : '-translate-x-full w-0 lg:w-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="w-64 h-full"> {/* Inner div to maintain sidebar width while parent collapses */}
          <AttendeeSidebar />
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[55] lg:hidden transition-opacity duration-300"
          onClick={toggleNav}
        />
      )}

      {/* Main Content Area */}
      <main 
        className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-white"
      >
        <Outlet context={{ toggleNav, isNavOpen }} />
      </main>
    </div>
  )
}

export default AttendeeLayout
