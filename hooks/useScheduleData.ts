import { useEffect } from 'react'
import { useScheduleStore } from '@/store/schedule'

export function useScheduleData() {
  const { setSchedule, setLoading, setError, currentSchedule } = useScheduleStore()

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/schedule')
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

    fetchSchedule()
  }, [setSchedule, setLoading, setError])

  return { currentSchedule }
}
