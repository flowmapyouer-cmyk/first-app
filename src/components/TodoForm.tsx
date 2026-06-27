import { useState } from 'react'
import { Todo } from '../supabaseClient'

// App.tsx의 handleStart에 전달할 데이터 타입
type NewTodoData = Omit<Todo, 'id' | 'is_completed' | 'created_at'>

interface Props {
  onStart: (data: NewTodoData) => void
}

// 집중 시간 옵션: 10분 단위, 10~180분
const DURATION_OPTIONS = Array.from({ length: 18 }, (_, i) => (i + 1) * 10)

export default function TodoForm({ onStart }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [duration, setDuration] = useState(30)
  const [color, setColor] = useState<'red' | 'yellow' | 'green'>('green')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onStart({ title: title.trim(), date, duration, color })
    // 폼 초기화
    setTitle('')
    setDate(today)
    setDuration(30)
    setColor('green')
  }

  // 색상 버튼 스타일 (선택됨/비선택됨)
  const colorButtonClass = (c: 'red' | 'yellow' | 'green') => {
    const selected =
      c === 'red'
        ? 'bg-red-400 text-white'
        : c === 'yellow'
        ? 'bg-yellow-400 text-white'
        : 'bg-green-400 text-white'
    return `flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
      color === c ? selected : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <h2 className="text-base font-semibold text-gray-800 mb-4">새 일정 추가</h2>

      {/* 일정 이름 입력 */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="일정 이름을 입력하세요"
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                   placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-3"
      />

      {/* 날짜 & 집중 시간 */}
      <div className="flex gap-3 mb-3">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
        >
          {DURATION_OPTIONS.map(v => (
            <option key={v} value={v}>
              {v}분
            </option>
          ))}
        </select>
      </div>

      {/* 색상 선택 버튼 */}
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setColor('red')} className={colorButtonClass('red')}>
          🔴 빨강
        </button>
        <button type="button" onClick={() => setColor('yellow')} className={colorButtonClass('yellow')}>
          🟡 노랑
        </button>
        <button type="button" onClick={() => setColor('green')} className={colorButtonClass('green')}>
          🟢 초록
        </button>
      </div>

      {/* 시작 버튼: 클릭 시 Supabase에 저장 후 타이머 화면으로 전환 */}
      <button
        type="submit"
        className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium
                   hover:bg-gray-700 active:bg-gray-800 transition-colors"
      >
        ▶ 시작
      </button>
    </form>
  )
}
