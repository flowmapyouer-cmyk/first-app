import { useState, useEffect, useRef } from 'react'
import { Todo } from '../supabaseClient'

interface Props {
  todo: Todo
  onComplete: (id: string) => void // 종료 시 호출 (Supabase 완료 처리 + 메인 복귀)
}

// SVG 원형 타이머 설정
const RADIUS = 110
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 691.15

// Todo 색상 → SVG stroke 색상
const strokeColorMap: Record<string, string> = {
  red: '#f87171',    // Tailwind red-400
  yellow: '#facc15', // Tailwind yellow-400
  green: '#4ade80',  // Tailwind green-400
}

// 배경 색상 (연한 버전)
const bgColorMap: Record<string, string> = {
  red: 'bg-red-50',
  yellow: 'bg-yellow-50',
  green: 'bg-green-50',
}

export default function PomodoroTimer({ todo, onComplete }: Props) {
  const totalSeconds = todo.duration * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(true)

  // 이미 완료 처리를 했는지 추적 (중복 호출 방지)
  const completedRef = useRef(false)

  // 1초마다 카운트다운 (isRunning 상태에 따라 동작)
  useEffect(() => {
    if (!isRunning) return

    const timer = setTimeout(() => {
      setRemaining(prev => {
        const next = prev - 1
        // 시간이 다 됐을 때 자동으로 완료 처리
        if (next <= 0 && !completedRef.current) {
          completedRef.current = true
          onComplete(todo.id)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [isRunning, remaining]) // remaining이 바뀔 때마다 새 timeout 설정

  // 진행률: 0 = 시작, 1 = 완료
  const progress = (totalSeconds - remaining) / totalSeconds
  // stroke-dashoffset: 0 → 원 전체 표시, CIRCUMFERENCE → 원 전체 숨김
  const dashOffset = CIRCUMFERENCE * progress

  // MM:SS 형식으로 변환
  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0')
  const seconds = (remaining % 60).toString().padStart(2, '0')

  const strokeColor = strokeColorMap[todo.color]
  const bgColor = bgColorMap[todo.color]

  // '종료' 버튼: 완료 처리 (Supabase 업데이트 + 메인 복귀)
  const handleEnd = () => {
    if (!completedRef.current) {
      completedRef.current = true
      onComplete(todo.id)
    }
  }

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center`}>
      {/* 제목 영역 */}
      <p className="text-sm font-medium text-gray-400 mb-1 tracking-widest uppercase">
        집중 시간
      </p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-10 max-w-xs text-center">
        {todo.title}
      </h2>

      {/* SVG 원형 타이머 */}
      <div className="relative">
        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* 배경 원 (회색) */}
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* 진행 원: -90도 회전으로 12시 방향부터 시작 */}
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* 중앙 남은 시간 표시 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light text-gray-800 tabular-nums tracking-tight">
            {minutes}:{seconds}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {isRunning ? '집중 중' : '일시정지'}
          </span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex gap-3 mt-10">
        {/* 일시정지 / 재개 토글 버튼 */}
        <button
          onClick={() => setIsRunning(prev => !prev)}
          className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 text-sm
                     font-medium hover:bg-gray-50 transition-colors shadow-sm min-w-[120px]"
        >
          {isRunning ? '⏸ 일시정지' : '▶ 재개'}
        </button>

        {/* 종료 버튼: Todo 완료 처리 후 메인으로 */}
        <button
          onClick={handleEnd}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-medium
                     hover:bg-gray-700 transition-colors shadow-sm min-w-[120px]"
        >
          ✓ 종료
        </button>
      </div>

      {/* 총 집중 시간 안내 */}
      <p className="text-xs text-gray-400 mt-6">
        총 {todo.duration}분 집중 목표
      </p>
    </div>
  )
}
