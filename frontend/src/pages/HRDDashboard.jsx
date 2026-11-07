import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function getJakartaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
}

function getDateKey(value) {
  const parts = getJakartaDateParts(new Date(value))
  return `${parts.year}-${parts.month}-${parts.day}`
}

function formatDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

function formatTime(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

function HRDDashboard() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [employeeData, attendanceData] = await Promise.all([
          apiRequest('/employees'),
          apiRequest('/attendance'),
        ])

        setEmployees(employeeData)
        setAttendance(attendanceData)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const today = getJakartaDateParts()
  const todayKey = `${today.year}-${today.month}-${today.day}`

  const todayAttendance = attendance.filter(
    (record) => getDateKey(record.attendanceDate) === todayKey,
  )

  const activeEmployees = employees.filter(
    (employee) => employee.isActive,
  )

  const recentAttendance = attendance.slice(0, 5)

  const currentDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date())

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>HRD Dashboard</h1>
          <p>
            Overview of employee information and attendance activity.
          </p>
        </div>

        <div className="current-date">{currentDate}</div>
      </div>

      {error && (
        <div className="login-error dashboard-error" role="alert">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <h2 className="stat-value">
            {loading ? '...' : employees.length}
          </h2>
          <span className="stat-description">
            Registered employees
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Employees</span>
          <h2 className="stat-value">
            {loading ? '...' : activeEmployees.length}
          </h2>
          <span className="stat-description">
            Currently active accounts
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Today's Submissions</span>
          <h2 className="stat-value">
            {loading ? '...' : todayAttendance.length}
          </h2>
          <span className="stat-description">
            Attendance records submitted today
          </span>
        </div>
      </section>

      <section className="content-card hrd-recent-card">
        <div className="section-heading">
          <div>
            <h2>Recent Attendance</h2>
            <p>Latest employee attendance submissions.</p>
          </div>

          <Link
            to="/hrd/attendance"
            className="secondary-button dashboard-history-link"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="history-message">
            Loading attendance records...
          </div>
        ) : recentAttendance.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>No attendance submissions yet</h3>
            <p>Employee submissions will appear here.</p>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table hrd-recent-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Attendance Date</th>
                  <th>Submitted Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentAttendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="monitoring-employee-cell">
                        <strong>{record.employee.fullName}</strong>
                        <span>{record.employee.employeeNumber}</span>
                      </div>
                    </td>

                    <td>{record.employee.department}</td>
                    <td>{formatDate(record.attendanceDate)}</td>
                    <td>{formatTime(record.submittedAt)} WIB</td>

                    <td>
                      <span className="history-status">
                        Submitted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="hrd-quick-links">
        <Link to="/hrd/employees" className="content-card hrd-quick-link">
          <div>
            <h3>Employee Management</h3>
            <p>Manage employee profiles and account access.</p>
          </div>
          <span>→</span>
        </Link>

        <Link to="/hrd/attendance" className="content-card hrd-quick-link">
          <div>
            <h3>Attendance Monitoring</h3>
            <p>Review submissions and inspect photo evidence.</p>
          </div>
          <span>→</span>
        </Link>
      </section>
    </>
  )
}

export default HRDDashboard