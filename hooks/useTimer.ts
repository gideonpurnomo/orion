import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerOptions {
  initialMinutes: number
  onComplete?: () => void
}

interface UseTimerReturn {
  minutes: number
  seconds: number
  isActive: boolean
  isPaused: boolean
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimer({ initialMinutes, onComplete }: UseTimerOptions): UseTimerReturn {
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const totalSecondsRef = useRef(initialMinutes * 60)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const start = useCallback(() => {
    setIsActive(true)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => {
    setIsPaused(true)
    setIsActive(false)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
    setIsActive(true)
  }, [])

  const reset = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setMinutes(initialMinutes)
    setSeconds(0)
    totalSecondsRef.current = initialMinutes * 60
  }, [initialMinutes])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              // Timer completed
              setIsActive(false)
              setIsPaused(false)
              if (onCompleteRef.current) {
                onCompleteRef.current()
              }
              return 0
            } else {
              // Decrement minutes and reset seconds
              setMinutes((prevMinutes) => prevMinutes - 1)
              return 59
            }
          }
          return prevSeconds - 1
        })

        totalSecondsRef.current -= 1
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, isPaused, minutes])

  return {
    minutes,
    seconds,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset
  }
}
