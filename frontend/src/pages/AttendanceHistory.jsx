import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

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

function AttendanceHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await apiRequest('/attendance/my')
        setRecords(data)
      } catch (err) {
        setError(err.message || 'Failed to load attendance history.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Attendance History</h1>
          <p>Review your previous work-from-home attendance submissions.</p>
        </div>

        <Link
          to="/employee/attendance"
          className="history-action-button"
        >
          Submit Attendance
        </Link>
      </div>

      <section className="content-card history-card">
        <div className="section-heading">
          <div>
            <h2>My Attendance Records</h2>
            <p>
              {records.length} attendance record
              {records.length !== 1 ? 's' : ''} found.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="history-message">
            Loading attendance history...
          </div>
        ) : error ? (
          <div className="login-error" role="alert">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>No attendance records yet</h3>
            <p>Your submitted attendance will appear here.</p>
            <Link
              to="/employee/attendance"
              className="history-empty-link"
            >
              Submit your first attendance
            </Link>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Attendance Date</th>
                  <th>Submitted Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.attendanceDate)}</td>
                    <td>{formatTime(record.submittedAt)} WIB</td>
                    <td className="history-notes">
                      {record.notes || 'No notes provided'}
                    </td>
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
    </>
  )
}

export default AttendanceHistory