'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';

// 직군 옵션 리스트
const ROLES = ['PD', 'TD', 'VD', 'PM', '대표'];

export default function SignupPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('PD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('이름을 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Supabase Auth 회원가입 (메타데이터에 이름과 직군 포함)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2. profiles 테이블에 유저 세부 정보 저장
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            name: name,
            role: role,
            status: 'Active',
          },
        ]);

        if (profileError) {
          console.error('프로필 DB 저장 오류:', profileError.message);
        }
      }

      alert('회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.');
      router.push('/login');
    } catch (err: any) {
      setErrorMsg(err.message || '회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <h2 className="text-2xl font-bold text-center text-neutral-800 mb-6">회원가입</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* 이름 입력 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">이름</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* 직군 선택 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">직군 선택</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 이메일 입력 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@wendy.com"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자리 이상 입력"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50 mt-2 shadow-xs"
          >
            {isLoading ? '가입 진행 중...' : '회원가입 완료'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline ml-1">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}