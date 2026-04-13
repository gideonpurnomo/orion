import { useEffect } from 'react'
import { useScheduleStore } from '@/store/schedule'

export function useScheduleData() {
  const { setSchedule, setLoading, setError, setStreak, currentSchedule } = useScheduleStore()

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/schedule')
        if (response.status === 401) {
          setSchedule(null)
          setError('Please sign in to view your schedule')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch schedule')
        }
        const data = await response.json()

        // Transform API response to store format
        const schedule = {
          id: 'current',
          name: 'My Schedule',
          type: 'WEEKLY' as const,
          startDate: new Date(),
          endDate: new Date(),
          items: data.items || []
        }

        setSchedule(schedule)
        setError(null)
      } catch (err) {
        console.error('Fetch schedule error:', err)
        setError('Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/progress')
        if (response.ok) {
          const data = await response.json()
          setStreak(data.streak?.current ?? 0)
        }
      } catch {
        // Streak fetch failure is non-critical
      }
    }

    fetchSchedule()
    fetchStreak()
  }, [setSchedule, setLoading, setError, setStreak])

  return { currentSchedule }
}
