import { useState } from 'react'
import { Todo } from '../supabaseClient'

interface Props {
  todos: Todo[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Omit<Todo, 'id' | 'created_at'>>) => void
}

// 집중 시간 옵션 (TodoForm과 동일)
const DURATION_OPTIONS = Array.from({ length: 18 }, (_, i) => (i + 1) * 10)

// 색상별 인디케이터 스타일
const colorDotClass: Record<string, string> = {
  red: 'bg-red-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
}

export default function TodoList({ todos, onDelete, onUpdate }: Props) {
  // 현재 편집 중인 Todo의 id
  const [editingId, setEditingId] = useState<string | null>(null)
  // 편집 중인 필드들
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDuration, setEditDuration] = useState(30)
  const [editColor, setEditColor] = useState<'red' | 'yellow' | 'green'>('green')

  // 편집 모드 시작
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDate(todo.date)
    setEditDuration(todo.duration)
    setEditColor(todo.color)
  }

  // 편집 저장
  const saveEdit = (id: string) => {
    onUpdate(id, {
      title: editTitle.trim() || '(제목 없음)',
      date: editDate,
      duration: editDuration,
      color: editColor,
    })
    setEditingId(null)
  }

  // 편집 취소
  const cancelEdit = () => setEditingId(null)

  // 미완료 / 완료 분리
  const incomplete = todos.filter(t => !t.is_completed)
  const completed = todos.filter(t => t.is_completed)

  // 편집 폼 렌더링
  const renderEditForm = (todo: Todo) => (
    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
      <input
        value={editTitle}
        onChange={e => setEditTitle(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2
                   focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
      />
      <div className="flex gap-2 mb-2">
        <input
          type="date"
          value={editDate}
          onChange={e => setEditDate(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white
                     focus:outline-none"
        />
        <select
          value={editDuration}
          onChange={e => setEditDuration(Number(e.target.value))}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white
                     focus:outline-none"
        >
          {DURATION_OPTIONS.map(v => (
            <option key={v} value={v}>{v}분</option>
          ))}
        </select>
      </div>
      {/* 색상 선택 */}
      <div className="flex gap-1 mb-3">
        {(['red', 'yellow', 'green'] as const).map(c => (
          <button
            key={c}
            onClick={() => setEditColor(c)}
            className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
              editColor === c
                ? c === 'red' ? 'bg-red-400 text-white'
                  : c === 'yellow' ? 'bg-yellow-400 text-white'
                  : 'bg-green-400 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {c === 'red' ? '빨강' : c === 'yellow' ? '노랑' : '초록'}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => saveEdit(todo.id)}
          className="flex-1 bg-gray-900 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700"
        >
          저장
        </button>
        <button
          onClick={cancelEdit}
          className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200"
        >
          취소
        </button>
      </div>
    </div>
  )

  // 일반 Todo 항목 렌더링
  const renderTodoItem = (todo: Todo) => {
    if (editingId === todo.id) return renderEditForm(todo)

    return (
      <div
        key={todo.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          todo.is_completed
            ? 'opacity-50 cursor-default'
            : 'cursor-pointer hover:bg-gray-50'
        }`}
        onClick={() => !todo.is_completed && startEdit(todo)}
      >
        {/* 색상 인디케이터 */}
        <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${colorDotClass[todo.color]}`} />

        {/* 일정 정보 */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-gray-800 truncate ${todo.is_completed ? 'line-through' : ''}`}>
            {todo.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {todo.date} · {todo.duration}분
          </p>
        </div>

        {/* 삭제 버튼: 이벤트 버블링 방지 */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(todo.id) }}
          className="text-gray-300 hover:text-red-400 transition-colors text-base flex-shrink-0 p-1"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    )
  }

  // Todo가 없을 때
  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-300 text-2xl mb-2">📋</p>
        <p className="text-gray-400 text-sm">아직 일정이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 진행 중 목록 */}
      {incomplete.length > 0 && (
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            진행 중 ({incomplete.length})
          </p>
          <div className="space-y-1">
            {incomplete.map(todo => (
              <div key={todo.id}>{renderTodoItem(todo)}</div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 목록 */}
      {completed.length > 0 && (
        <div className={`p-4 ${incomplete.length > 0 ? 'border-t border-gray-50' : ''}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            완료 ({completed.length})
          </p>
          <div className="space-y-1">
            {completed.map(todo => (
              <div key={todo.id}>{renderTodoItem(todo)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
