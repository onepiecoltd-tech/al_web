export interface AppStatus {
  maintenance: boolean
  allow_signup: boolean
}

// Public feature-flag status, shared via the 'status' key.
export function useStatus() {
  return useFetch<AppStatus>('/api/status', {
    key: 'status',
    default: () => ({ maintenance: false, allow_signup: true }),
  })
}
