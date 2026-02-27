import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Check, X } from 'lucide-react'
import { useTimer } from '@/hooks/useTimer'

interface TimerDisplayProps {
  topicName: string
  initialMinutes: number
  onComplete: () => void
  onCancel: () => void
  domainIcon?: string
}

export default function TimerDisplay({
  topicName,
  initialMinutes,
  onComplete,
  onCancel,
  domainIcon = '📚'
}: TimerDisplayProps) {
  const { minutes, seconds, isActive, isPaused, start, pause, resume, reset } = useTimer({
    initialMinutes,
    onComplete
  })

  const totalSeconds = initialMinutes * 60
  const remainingSeconds = minutes * 60 + seconds
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100

  // Determine color based on remaining time percentage
  const getColorClass = () => {
    if (remainingSeconds > totalSeconds * 0.5) {
      return 'text-green-400'
    } else if (remainingSeconds > totalSeconds * 0.2) {
      return 'text-yellow-400'
    } else {
      return 'text-red-400'
    }
  }

  const getProgressColor = () => {
    if (remainingSeconds > totalSeconds * 0.5) {
      return 'bg-green-500'
    } else if (remainingSeconds > totalSeconds * 0.2) {
      return 'bg-yellow-500'
    } else {
      return 'bg-red-500'
    }
  }

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isCompleted = remainingSeconds === 0

  return (
    <div className="bg-slate-800 border border-purple-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-purple-500/30">
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className={`text-6xl mb-4 ${isActive && !isPaused ? 'animate-pulse' : ''}`}
        >
          {domainIcon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{topicName}</h2>
        <p className="text-gray-400">
          {isCompleted ? 'Session complete!' : `Focus for ${initialMinutes} minutes`}
        </p>
      </div>

      {/* Timer Display */}
      <div className="bg-white/5 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`text-5xl font-mono font-bold ${getColorClass()}`}>
            {formatTime(minutes, seconds)}
          </span>
        </div>

        {/* Progress Bar */}
        <Progress
          value={progress}
          className="h-2"
        />
      </div>

      {/* Action Buttons */}
      {!isCompleted ? (
        <div className="flex gap-4">
          {!isActive && !isPaused ? (
            // Start button
            <Button
              onClick={start}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : isPaused ? (
            // Resume button
            <Button
              onClick={resume}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : (
            // Pause button
            <Button
              onClick={pause}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border-0"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      ) : (
        // Complete state
        <div className="flex gap-4">
          <Button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
          >
            <Check className="h-4 w-4 mr-2" />
            Complete
          </Button>
          <Button
            onClick={() => {
              reset()
              onCancel()
            }}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
