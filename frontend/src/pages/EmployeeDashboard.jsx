function EmployeeDashboard() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, John. Here's your attendance overview.</p>
        </div>

        <div className="current-date">
          Thursday, November 5, 2026
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Attendance Status</span>
          <h2 className="stat-value">Not Submitted</h2>
          <span className="stat-description">Today's attendance</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Attendance</span>
          <h2 className="stat-value">12 Days</h2>
          <span className="stat-description">Recorded this month</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Last Submission</span>
          <h2 className="stat-value">Yesterday</h2>
          <span className="stat-description">November 4, 2026</span>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Recent Attendance</h2>
            <p>Your latest attendance records.</p>
          </div>

          <button className="secondary-button">View History</button>
        </div>

        <div className="empty-state">
          <div className="empty-icon">◷</div>
          <h3>No recent attendance</h3>
          <p>Your attendance submissions will appear here.</p>
        </div>
      </section>
    </>
  )
}

export default EmployeeDashboard