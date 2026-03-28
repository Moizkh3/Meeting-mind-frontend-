import { Outlet } from 'react-router-dom'

// No sidebar — standalone layout for pages with their own nav
const StandaloneLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  )
}

export default StandaloneLayout
