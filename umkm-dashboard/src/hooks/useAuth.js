import { useState, useEffect } from 'react'
import { USERS, SESSION_KEY } from '../config/auth'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  function login(username, password) {
    const found = USERS.find(
      u => u.username === username.trim() && u.password === password
    )
    if (!found) return false
    const session = { username: found.username, name: found.name, role: found.role }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return true
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return { user, login, logout }
}
