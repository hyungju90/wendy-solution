import { redirect } from 'next/navigation';
import { supabase } from './supabase'; 

export default async function Home() {
  // 현재 접속한 유저가 로그인 상태인지 확인합니다.
  const { data: { session } } = await supabase.auth.getSession();

  // 로그인 기록(세션)이 없으면 로그인 페이지로 이동시킵니다.
  if (!session) {
    redirect('/login');
  }

  // 이미 로그인이 되어 있다면 바로 메인 페이지로 이동시킵니다.
  redirect('/main');
}