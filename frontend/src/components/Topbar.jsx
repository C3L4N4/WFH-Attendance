import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Topbar({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const pageNames = {
    '/employee/dashboard': 'Dashboard',
    '/employee/attendance': 'Attendance',
    '/employee/history': 'History',
    '/hrd/dashboard': 'Dashboard',
  }

  const pageTitle = pageNames[location.pathname] || 'Dashboard'

  const displayName = user?.employee?.fullName || user?.email || 'User'

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <span>/</span>
          <strong>{pageTitle}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications">
          ♧
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-profile">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <strong>{displayName}</strong>
            <span>{user?.role || 'User'}</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}

export default Topbar