import { useState, useEffect } from 'react'
import { supabase, Todo } from './supabaseClient'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import Calendar from './components/Calendar'
import PomodoroTimer from './components/PomodoroTimer'

// 폼에서 받는 데이터 타입 (id, is_completed, created_at 제외)
type NewTodoData = Omit<Todo, 'id' | 'is_completed' | 'created_at'>

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  // 현재 화면: 'main' = 메인, 'pomodoro' = 타이머
  const [view, setView] = useState<'main' | 'pomodoro'>('main')
  // 현재 타이머에서 집중 중인 Todo
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)

  // 전체 todos 재조회 (초기 로딩 + 완료 후 달력 갱신에 공용 사용)
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setTodos(data as Todo[])
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 폼 '시작' 버튼 → Supabase에 새 Todo 생성 후 타이머 화면으로 전환
  const handleStart = async (formData: NewTodoData) => {
    const { data, error } = await supabase
      .from('todos')
      .insert({ ...formData, is_completed: false })
      .select()
      .single()

    if (error || !data) {
      // Supabase 연결 실패 시에도 로컬 임시 todo로 타이머를 강제 시작
      console.error('Todo 생성 오류 (로컬 모드로 진행):', error)
      const tempTodo: Todo = {
        id: crypto.randomUUID(),
        ...formData,
        is_completed: false,
        created_at: new Date().toISOString(),
      }
      setTodos(prev => [tempTodo, ...prev])
      setActiveTodo(tempTodo)
      setView('pomodoro')
      return
    }

    // Supabase insert 성공: DB에서 받은 실제 todo로 타이머 시작
    const newTodo = data as Todo
    setTodos(prev => [newTodo, ...prev])
    setActiveTodo(newTodo)
    setView('pomodoro')
  }

  // 타이머 '종료' 또는 시간 만료 → Supabase 완료 처리 + 달력 즉시 갱신
  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: true })
      .eq('id', id)

    // 로컬 상태 즉시 업데이트 (화면 전환 전에 먼저 처리)
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, is_completed: true } : t))
    )
    setActiveTodo(null)
    setView('main')

    // Supabase 성공 시 전체 재조회 → 달력에 완료 색상 즉시 반영
    if (!error) {
      fetchTodos()
    }
  }

  // Todo 삭제
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (!error) {
      setTodos(prev => prev.filter(t => t.id !== id))
    }
  }

  // Todo 수정 (인라인 편집)
  const handleUpdate = async (
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'created_at'>>
  ) => {
    const { error } = await supabase.from('todos').update(updates).eq('id', id)
    if (!error) {
      setTodos(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates } : t))
      )
    }
  }

  // 집중 시간 화면 (전체 화면 오버레이)
  if (view === 'pomodoro' && activeTodo) {
    return <PomodoroTimer todo={activeTodo} onComplete={handleComplete} />
  }

  // 메인 화면
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-2">
        <span className="text-2xl">📚</span>
        <h1 className="text-lg font-semibold text-gray-800">학습 플래너</h1>
      </header>

      {/* 본문: 좌(달력) + 우(Todo 관리) */}
      <main className="flex" style={{ height: 'calc(100vh - 65px)' }}>
        {/* 좌측: 월간 달력 */}
        <aside className="w-2/5 border-r border-gray-100 p-6 overflow-y-auto">
          <Calendar todos={todos} />
        </aside>

        {/* 우측: Todo 입력 폼 + 목록 */}
        <section className="w-3/5 p-6 overflow-y-auto">
          <TodoForm onStart={handleStart} />
          <div className="mt-4">
            <TodoList
              todos={todos}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
