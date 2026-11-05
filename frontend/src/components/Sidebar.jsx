import { NavLink } from 'react-router-dom'

const navigation = [
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

function Sidebar({ isOpen, onNavigate }) {
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
        <div className="sidebar-avatar">JD</div>
        <div className="sidebar-user">
          <strong>John Doe</strong>
          <span>Employee</span>
        </div>
        <span className="user-menu">···</span>
      </div>
    </aside>
  )
}

export default Sidebar