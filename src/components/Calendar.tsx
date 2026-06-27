import { useState } from 'react'
import { Todo } from '../supabaseClient'

interface Props {
  todos: Todo[]
}

// 한국어 요일/월 표기
const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS_KR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

// 색상 박스 스타일
const colorBoxClass: Record<string, string> = {
  red: 'bg-red-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
}

export default function Calendar({ todos }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0~11

  // 이전/다음 달 이동
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // 해당 월의 날짜 수 & 시작 요일
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0=일

  // 날짜별 완료된 Todo 색상 모으기 (최대 5개)
  const completedByDate: Record<string, string[]> = {}
  todos
    .filter(t => t.is_completed)
    .forEach(t => {
      if (!completedByDate[t.date]) completedByDate[t.date] = []
      if (completedByDate[t.date].length < 5) {
        completedByDate[t.date].push(t.color)
      }
    })

  // 달력 그리드 셀 배열 (앞뒤 빈칸 포함)
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null) // 앞 빈칸
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)       // 날짜
  while (cells.length % 7 !== 0) cells.push(null)            // 뒤 빈칸

  // 오늘 날짜 문자열 (비교용)
  const todayStr = now.toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                     hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold text-gray-800">
          {year}년 {MONTHS_KR[month]}
        </h2>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                     hover:bg-gray-100 hover:text-gray-700 transition-colors text-lg"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_KR.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          // 빈 셀
          if (!day) return <div key={`empty-${idx}`} className="min-h-[52px]" />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayColors = completedByDate[dateStr] || []
          const isToday = dateStr === todayStr
          const isWeekendSun = idx % 7 === 0
          const isWeekendSat = idx % 7 === 6

          return (
            <div
              key={dateStr}
              className={`min-h-[52px] rounded-xl p-1 ${isToday ? 'bg-blue-50' : ''}`}
            >
              {/* 날짜 숫자 */}
              <span
                className={`text-xs font-medium block text-center mb-1 ${
                  isToday
                    ? 'text-blue-500 font-bold'
                    : isWeekendSun
                    ? 'text-red-400'
                    : isWeekendSat
                    ? 'text-blue-400'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </span>
              {/* 완료된 Todo 색상 박스 (최대 5개) */}
              <div className="flex flex-wrap gap-0.5 justify-center">
                {dayColors.map((c, ci) => (
                  <div
                    key={ci}
                    className={`w-2.5 h-2.5 rounded-sm ${colorBoxClass[c]}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
