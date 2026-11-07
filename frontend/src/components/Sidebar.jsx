import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Sidebar({ isOpen, onNavigate }) {
  const { user } = useAuth()

  const isHRD = user?.role === 'HRD'

  const displayName = user?.employee?.fullName || user?.email || 'User'

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navigation = isHRD
    ? [
        {
          label: 'OVERVIEW',
          items: [
            { name: 'Dashboard', icon: '▦', path: '/hrd/dashboard' },
          ],
        },
        {
          label: 'MANAGEMENT',
          items: [
            { name: 'Employees', icon: '♙', path: '/hrd/employees' },
            { name: 'Attendance', icon: '◷', path: '/hrd/attendance' },
          ],
        },
      ]
    : [
        {
          label: 'OVERVIEW',
          items: [
            { name: 'Dashboard', icon: '▦', path: '/employee/dashboard' },
          ],
        },
        {
          label: 'WORKSPACE',
          items: [
            { name: 'Attendance', icon: '◷', path: '/employee/attendance' },
            { name: 'History', icon: '▤', path: '/employee/history' },
          ],
        },
      ]

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">W</div>
        <div>
          <h2>WorkSpace</h2>
          <span>ATTENDANCE SYSTEM</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-label">{group.label}</p>

            {group.items.map((item) => (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                key={item.name}
                onClick={onNavigate}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>

        <div className="sidebar-user">
          <strong>{displayName}</strong>
          <span>{user?.role || 'Employee'}</span>
        </div>

        <span className="user-menu">···</span>
      </div>
    </aside>
  )
}

export default Sidebar