'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function LoginPage() {
  const router = useRouter();

  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 🚀 아이디에 '@'가 없으면 자동으로 '@vvendy.com'을 붙여줍니다.
      const cleanInput = emailOrId.trim();
      const fullEmail = cleanInput.includes('@')
        ? cleanInput
        : `${cleanInput}@vvendy.com`;

      const { error } = await supabase.auth.signInWithPassword({
        email: fullEmail,
        password,
      });

      if (error) throw error;

      // 로그인 성공 시 메인 화면으로 이동
      router.push('/main');
    } catch (err: any) {
      setErrorMsg(err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <h2 className="text-2xl font-bold text-center text-neutral-800 mb-6">로그인</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 아이디 (이메일) 입력 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">아이디</label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder="아이디 입력"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition pr-28"
              />
              {/* @vvendy.com 미입력 시 시각적 안내 태그 */}
              {!emailOrId.includes('@') && (
                <span className="absolute right-3.5 text-xs text-neutral-400 font-medium pointer-events-none select-none">
                  @vvendy.com
                </span>
              )}
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50 mt-2 shadow-xs"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-blue-600 font-bold hover:underline ml-1">
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}