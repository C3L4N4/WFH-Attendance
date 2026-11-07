import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/useAuth'

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

function EmployeeDashboard() {
  const { user } = useAuth()

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const data = await apiRequest('/attendance/my')
        setRecords(data)
      } catch (err) {
        setError(err.message || 'Failed to load attendance data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  const displayName = user?.employee?.fullName || 'Employee'
  const today = getJakartaDateParts()
  const todayKey = `${today.year}-${today.month}-${today.day}`
  const currentMonth = `${today.year}-${today.month}`

  const todayAttendance = records.find(
    (record) => getDateKey(record.attendanceDate) === todayKey,
  )

  const monthlyAttendance = records.filter((record) => {
    const dateParts = getJakartaDateParts(
      new Date(record.attendanceDate),
    )

    return `${dateParts.year}-${dateParts.month}` === currentMonth
  })

  const lastSubmission = records.length > 0 ? records[0] : null

  const recentRecords = records.slice(0, 5)

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
          <h1>Dashboard</h1>
          <p>
            Welcome back, {displayName}. Here's your attendance overview.
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
          <span className="stat-label">Attendance Status</span>

          <h2 className="stat-value">
            {loading
              ? 'Loading...'
              : error
                ? '-'
                : todayAttendance
                  ? 'Submitted'
                  : 'Not Submitted'}
          </h2>

          <span className="stat-description">
            Today's attendance
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Attendance</span>

          <h2 className="stat-value">
            {loading ? '...' : `${monthlyAttendance.length} Days`}
          </h2>

          <span className="stat-description">
            Recorded this month
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Last Submission</span>

          <h2 className="stat-value">
            {loading
              ? 'Loading...'
              : lastSubmission
                ? formatDate(lastSubmission.attendanceDate)
                : 'No records'}
          </h2>

          <span className="stat-description">
            {lastSubmission
              ? `${formatTime(lastSubmission.submittedAt)} WIB`
              : 'No previous submissions'}
          </span>
        </div>
      </section>

      <section className="content-card dashboard-recent-card">
        <div className="section-heading">
          <div>
            <h2>Recent Attendance</h2>
            <p>Your latest attendance records.</p>
          </div>

          <Link
            to="/employee/history"
            className="secondary-button dashboard-history-link"
          >
            View History
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading attendance records...</p>
          </div>
        ) : recentRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>No recent attendance</h3>
            <p>Your attendance submissions will appear here.</p>

            <Link
              to="/employee/attendance"
              className="history-empty-link"
            >
              Submit Attendance
            </Link>
          </div>
        ) : (
          <div className="dashboard-recent-list">
            {recentRecords.map((record) => (
              <div className="dashboard-recent-row" key={record.id}>
                <div className="dashboard-recent-date">
                  <strong>{formatDate(record.attendanceDate)}</strong>
                  <span>
                    {formatTime(record.submittedAt)} WIB
                  </span>
                </div>

                <div className="dashboard-recent-notes">
                  {record.notes || 'No notes provided'}
                </div>

                <span className="history-status">Submitted</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default EmployeeDashboard