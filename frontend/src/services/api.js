const API_BASE_URL = import.meta.env.VITE_API_URL

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token')

  const headers = {
    ...options.headers,
  }

  // Only set JSON content type when we're not uploading FormData.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong')
  }

  return data
}