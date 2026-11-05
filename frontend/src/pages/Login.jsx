import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Login() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return (
      <Navigate
        to={user.role === 'HRD' ? '/hrd/dashboard' : '/employee/dashboard'}
        replace
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      const loggedInUser = await login(email, password)

      navigate(
        loggedInUser.role === 'HRD'
          ? '/hrd/dashboard'
          : '/employee/dashboard',
        { replace: true },
      )
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="brand-icon">W</div>
          <div>
            <h2>WorkSpace</h2>
            <span>ATTENDANCE SYSTEM</span>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to access your attendance workspace.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-footer">
          WFH Attendance Management System
        </div>
      </div>

      <div className="login-decoration">
        <div className="decoration-content">
          <span className="decoration-label">WORKSPACE MANAGEMENT</span>
          <h2>Work from anywhere.<br />Stay connected.</h2>
          <p>
            Manage your work-from-home attendance, track submissions,
            and stay connected with your organization.
          </p>
          <div className="decoration-line"></div>
          <span className="decoration-caption">
            A centralized workspace for your organization.
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login