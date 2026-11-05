import { useLocation } from 'react-router-dom'

function Topbar({ onMenuClick }) {
  const location = useLocation()

  const pageNames = {
    '/employee/dashboard': 'Dashboard',
    '/employee/attendance': 'Attendance',
    '/employee/history': 'History',
  }

  const pageTitle = pageNames[location.pathname] || 'Dashboard'

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
          <div className="profile-avatar">JD</div>
          <div className="profile-info">
            <strong>John Doe</strong>
            <span>Employee</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar