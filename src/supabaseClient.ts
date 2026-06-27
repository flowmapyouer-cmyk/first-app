import { createClient } from '@supabase/supabase-js'

// .env.local에서 Supabase 연결 정보 읽기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

// todos 테이블 타입 정의
export interface Todo {
  id: string
  title: string
  date: string          // YYYY-MM-DD 형식
  duration: number      // 집중 시간 (분)
  color: 'red' | 'yellow' | 'green'
  is_completed: boolean
  created_at: string
}
