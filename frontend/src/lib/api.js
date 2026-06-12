const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  getKeywords: () => request('/keywords'),
  addKeyword: (data) => request('/keywords', { method: 'POST', body: JSON.stringify(data) }),
  updateKeyword: (id, data) => request('/keywords/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKeyword: (id) => request('/keywords/' + id, { method: 'DELETE' }),
  toggleKeyword: (id) => request('/keywords/' + id + '/toggle', { method: 'PATCH' }),

  getTopics: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('/topics' + (qs ? '?' + qs : ''))
  },
  getTopicStats: () => request('/topics/stats/summary'),
  triggerMonitor: () => request('/topics/trigger', { method: 'POST' }),

  getNotifications: (unreadOnly = false) =>
    request('/notifications' + (unreadOnly ? '?unread=1' : '')),
  markRead: (id) => request('/notifications/' + id + '/read', { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
}
