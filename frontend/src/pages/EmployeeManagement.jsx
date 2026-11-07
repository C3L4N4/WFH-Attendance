import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

const initialForm = {
  fullName: '',
  department: '',
  position: '',
  email: '',
  password: '',
}

function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingEmployee, setEditingEmployee] = useState(null)

  async function fetchEmployees() {
    try {
      setError('')
      const data = await apiRequest('/employees')
      setEmployees(data)
    } catch (err) {
      setError(err.message || 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleEdit(employee) {
    setEditingEmployee(employee)

    setForm({
        fullName: employee.fullName,
        department: employee.department,
        position: employee.position,
        email: '',
        password: '',
    })

    setShowForm(true)
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    try {
        if (editingEmployee) {
        const { password, email, ...employeeData } = form

        await apiRequest(`/employees/${editingEmployee.id}`, {
            method: 'PATCH',
            body: JSON.stringify(employeeData),
        })

        setMessage('Employee information updated successfully.')
        } else {
        await apiRequest('/employees', {
            method: 'POST',
            body: JSON.stringify(form),
        })

        setMessage('Employee account created successfully.')
        }

        setForm(initialForm)
        setEditingEmployee(null)
        setShowForm(false)

        await fetchEmployees()
    } catch (err) {
        setError(err.message || 'Failed to save employee information.')
    } finally {
        setSaving(false)
    }
  }

  async function toggleEmployee(employee) {
    const action = employee.isActive ? 'deactivate' : 'activate'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${employee.fullName}'s account?`,
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      await apiRequest(`/employees/${employee.id}/${action}`, {
        method: 'PATCH',
      })

      setMessage(
        `${employee.fullName}'s account has been ${action}d.`,
      )

      await fetchEmployees()
    } catch (err) {
      setError(err.message || `Failed to ${action} employee.`)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Employee Management</h1>
          <p>Manage employee information and account access.</p>
        </div>

        <button
          className="login-button employee-add-button"
          onClick={() => {
            if (showForm) {
                setEditingEmployee(null)
                setForm(initialForm)
            }

            setShowForm(!showForm)
            setError('')
            setMessage('')
          }}
        >
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {error && (
        <div className="login-error employee-feedback" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="attendance-success employee-feedback" role="status">
          {message}
        </div>
      )}

      {showForm && (
        <section className="content-card employee-form-card">
          <div className="section-heading">
            <div>
              <h2>
                {editingEmployee ? 'Edit Employee Information' : 'Create Employee Account'}
              </h2>
              <p>
                Enter the employee's details and login credentials.
              </p>
            </div>
          </div>

          <form className="employee-form" onSubmit={handleSubmit}>
            <div className="employee-form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  id="position"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {!editingEmployee && (
                <div className="form-group">
                    <label htmlFor="password">Temporary Password</label>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    required
                    />
                </div>
              )}
            </div>

            
            <div className="employee-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                setShowForm(false)
                setEditingEmployee(null)
                setForm(initialForm)
                setError('')
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="login-button"
                disabled={saving}
              >
                {saving
                ? 'Saving...'
                : editingEmployee
                    ? 'Save Changes'
                    : 'Create Employee'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-card employee-list-card">
        <div className="section-heading">
          <div>
            <h2>Employee Directory</h2>
            <p>
              {employees.length} employee
              {employees.length !== 1 ? 's' : ''} registered.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="history-message">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Employee accounts will appear here.</p>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table employee-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-name-cell">
                        <strong>{employee.fullName}</strong>
                        <span>{employee.employeeNumber}</span>
                      </div>
                    </td>

                    <td>{employee.department}</td>
                    <td>{employee.position}</td>

                    <td>
                      <span
                        className={
                          employee.isActive
                            ? 'history-status'
                            : 'employee-inactive-status'
                        }
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <div className="employee-table-actions">
                        <button
                        className="employee-edit-button"
                        onClick={() => handleEdit(employee)}
                        >
                        Edit
                        </button>

                        <button
                        className={
                            employee.isActive
                            ? 'employee-deactivate-button'
                            : 'employee-activate-button'
                        }
                        onClick={() => toggleEmployee(employee)}
                        >
                        {employee.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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

export default EmployeeManagement