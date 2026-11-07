import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL

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

function AttendanceMonitoring() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])

  const [dateFilter, setDateFilter] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [photoUrl, setPhotoUrl] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  async function fetchRecords(filters = {}) {
    setLoading(true)
    setError('')

    const params = new URLSearchParams()

    if (filters.date) {
      params.set('date', filters.date)
    }

    if (filters.employeeId) {
      params.set('employeeId', filters.employeeId)
    }

    const query = params.toString()

    try {
      const data = await apiRequest(
        `/attendance${query ? `?${query}` : ''}`,
      )

      setRecords(data)
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function initializePage() {
      try {
        const employeeData = await apiRequest('/employees')
        setEmployees(employeeData)
      } catch (err) {
        setError(err.message || 'Failed to load employee list.')
      }

      await fetchRecords()
    }

    initializePage()
  }, [])

  async function handleFilter(event) {
    event.preventDefault()

    await fetchRecords({
      date: dateFilter,
      employeeId: employeeFilter,
    })
  }

  async function handleReset() {
    setDateFilter('')
    setEmployeeFilter('')
    await fetchRecords()
  }

  async function handleViewPhoto(record) {
    setPhotoLoading(true)
    setPhotoError('')

    if (photoUrl) {
      URL.revokeObjectURL(photoUrl)
      setPhotoUrl('')
    }

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch(
        `${API_BASE_URL}/attendance/${record.id}/photo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Unable to load attendance photo.')
      }

      const imageBlob = await response.blob()
      const imageObjectUrl = URL.createObjectURL(imageBlob)

      setPhotoUrl(imageObjectUrl)
    } catch (err) {
      setPhotoError(err.message || 'Failed to load photo.')
    } finally {
      setPhotoLoading(false)
    }
  }

  function closePhotoViewer() {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl)
    }

    setPhotoUrl('')
    setPhotoError('')
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Attendance Monitoring</h1>
          <p>
            Monitor work-from-home attendance submissions from employees.
          </p>
        </div>
      </div>

      <section className="content-card monitoring-filter-card">
        <div className="section-heading">
          <div>
            <h2>Filter Attendance</h2>
            <p>Find attendance records by date or employee.</p>
          </div>
        </div>

        <form className="monitoring-filter-form" onSubmit={handleFilter}>
          <div className="form-group">
            <label htmlFor="filter-date">Attendance Date</label>
            <input
              id="filter-date"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="filter-employee">Employee</label>
            <select
              id="filter-employee"
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
            >
              <option value="">All Employees</option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} ({employee.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="monitoring-filter-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
            >
              Reset
            </button>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="login-error monitoring-feedback" role="alert">
          {error}
        </div>
      )}

      <section className="content-card monitoring-records-card">
        <div className="section-heading">
          <div>
            <h2>Attendance Records</h2>
            <p>
              {records.length} record{records.length !== 1 ? 's' : ''} found.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="history-message">
            Loading attendance records...
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>No attendance records found</h3>
            <p>Try changing your filters or check again later.</p>
          </div>
        ) : (
          <div className="history-table-wrapper monitoring-table-wrapper">
            <table className="history-table monitoring-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Attendance Date</th>
                  <th>Submitted Time</th>
                  <th>Notes</th>
                  <th>Photo</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
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

                    <td className="monitoring-notes">
                      {record.notes || 'No notes provided'}
                    </td>

                    <td>
                      <button
                        className="monitoring-photo-button"
                        onClick={() => handleViewPhoto(record)}
                      >
                        View Photo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(photoLoading || photoUrl || photoError) && (
        <div
          className="photo-modal-overlay"
          onClick={closePhotoViewer}
        >
          <section
            className="photo-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="photo-modal-header">
              <h2>Attendance Evidence</h2>

              <button
                className="photo-modal-close"
                onClick={closePhotoViewer}
                aria-label="Close photo viewer"
              >
                ×
              </button>
            </div>

            <div className="photo-modal-content">
              {photoLoading && <p>Loading photo...</p>}

              {photoError && (
                <div className="login-error" role="alert">
                  {photoError}
                </div>
              )}

              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Employee attendance evidence"
                />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default AttendanceMonitoring