import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import Attendance from './pages/Attendance'
import AttendanceHistory from './pages/AttendanceHistory'
import AttendanceMonitoring from './pages/AttendanceMonitoring'
import HRDDashboard from './pages/HRDDashboard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function PlaceholderPage({ title }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>This page is currently under development.</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Employee-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/employee/dashboard"
              element={<EmployeeDashboard />}
            />
            <Route
              path="/employee/attendance"
              element={<Attendance />}
            />
            <Route
              path="/employee/history"
              element={<AttendanceHistory />}
            />
          </Route>
        </Route>

        {/* HRD-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['HRD']} />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/hrd/dashboard"
              element={<HRDDashboard />}
            />

            <Route
              path="/hrd/employees"
              element={<EmployeeManagement />}
            />

            <Route
              path="/hrd/attendance"
              element={<AttendanceMonitoring />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App