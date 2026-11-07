import { useState } from 'react'
import { apiRequest } from '../services/api'

function Attendance() {
  const [photo, setPhoto] = useState(null)
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handlePhotoChange(event) {
    const file = event.target.files[0]

    setError('')
    setMessage('')

    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must not exceed 5 MB.')
      return
    }

    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!photo) {
      setError('Please upload a photo as attendance evidence.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('photo', photo)
    formData.append('notes', notes)

    try {
      await apiRequest('/attendance', {
        method: 'POST',
        body: formData,
      })

      setMessage('Attendance submitted successfully!')
      setPhoto(null)
      setNotes('')
      setPreview('')
      event.target.reset()
    } catch (err) {
      setError(
        Array.isArray(err.message)
          ? err.message.join(', ')
          : err.message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Submit Attendance</h1>
          <p>Record your work-from-home attendance for today.</p>
        </div>
      </div>

      <section className="content-card attendance-form-card">
        <div className="attendance-intro">
          <h2>Daily Attendance</h2>
          <p>
            Upload a photo showing that you are working from home.
            Your submission date and time will be recorded automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="attendance-photo">
              Attendance Photo *
            </label>

            <input
              id="attendance-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />

            <small>JPG, PNG, or WebP. Maximum size: 5 MB.</small>
          </div>

          {preview && (
            <div className="attendance-preview">
              <img src={preview} alt="Attendance evidence preview" />
            </div>
          )}

          <div className="form-group attendance-notes">
            <label htmlFor="notes">Notes (Optional)</label>

            <textarea
              id="notes"
              rows="4"
              maxLength="500"
              placeholder="Describe your work activities today..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

            <div className="attendance-actions">
                {error && (
                    <div className="login-error" role="alert">
                    {error}
                    </div>
                )}

                {message && (
                    <div className="attendance-success" role="status">
                    <span>✓</span> {message}
                    </div>
                )}

                <button
                    className="login-button attendance-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
            </div>
        </form>
      </section>
    </>
  )
}

export default Attendance