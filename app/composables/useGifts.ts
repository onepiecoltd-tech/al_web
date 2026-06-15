import type { Gift } from '~/types/api'

// Shared gift catalog (public). useFetch dedupes by the 'gifts' key.
export function useGifts() {
  return useFetch<Gift[]>('/api/gifts', { default: () => [], key: 'gifts' })
}
