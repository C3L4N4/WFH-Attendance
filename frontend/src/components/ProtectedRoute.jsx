import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute({ allowedRoles }) {
  const { user, initializing } = useAuth()

  if (initializing) {
    return <div>Verifying session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const destination =
      user.role === 'HRD'
        ? '/hrd/dashboard'
        : '/employee/dashboard'

    return <Navigate to={destination} replace />
  }

  return <Outlet />
}

export default ProtectedRoute