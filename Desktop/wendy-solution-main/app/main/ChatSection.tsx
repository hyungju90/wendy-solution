'use client';

import React, { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ChatSectionProps {
  activeRoom: string;
  messages?: any[]; // undefined 대비 선택적 타입 지정
  colleagues?: any[];
  viewedReplyCounts?: { [messageId: number]: number };
  activeThreadMessageId: number | null;
  activeThreadMessage: any | null;
  inputText: string;
  setInputText: (val: string) => void;
  inputReplyText: string;
  setInputReplyText: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleSendReply: (e: React.FormEvent) => void;
  handleOpenThread: (msgId: number, currentReplyCount: number) => void;
  setActiveThreadMessageId: (id: number | null) => void;
  setSelectedMemberDetail: (member: any) => void;
}

export default function ChatSection({
  activeRoom,
  messages = [], // 💡 기본값 [] 설정으로 undefined 방지
  colleagues = [],
  viewedReplyCounts = {},
  activeThreadMessageId,
  activeThreadMessage,
  inputText,
  setInputText,
  inputReplyText,
  setInputReplyText,
  handleSendMessage,
  handleSendReply,
  handleOpenThread,
  setActiveThreadMessageId,
  setSelectedMemberDetail
}: ChatSectionProps) {

  // 💡 채널명을 동적으로 유일하게 생성하여 중복 .on() 콜백 등록 에러 차단
  useEffect(() => {
    if (!activeRoom) return;

    const channelName = `chat-room-${activeRoom}-${Math.random().toString(36).substring(2, 7)}`;
    const chatChannel = supabase.channel(channelName);

    chatChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        // 부모 컴포넌트 등에서 메시지 갱신이 필요할 경우 처리
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [activeRoom]);

  // 안전한 메시지 리스트 가공
  const safeMessages = messages || [];

  return (
    <div className="flex h-full w-full bg-white select-text font-['Paperlogy']">
      {/* 메인 대화창 Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white border-r border-neutral-200">
        
        {/* 상단 방 제목 헤더 */}
        <div className="h-14 px-6 border-b border-neutral-200 flex justify-between items-center bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-neutral-800"># {activeRoom}</span>
          </div>
        </div>

        {/* 메시지 리스트 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {safeMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              첫 메시지를 남겨 대화를 시작해보세요!
            </div>
          ) : (
            safeMessages.map((msg) => {
              const replyCount = msg?.replies?.length || 0;
              const isThreadActive = activeThreadMessageId === msg?.id;

              return (
                <div key={msg?.id || Math.random()} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                    {msg?.user?.slice(0, 1) || 'W'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-neutral-800">{msg?.user || '익명'}</span>
                      <span className="text-[10px] text-neutral-400">{msg?.time}</span>
                    </div>

                    <div className="text-xs text-neutral-700 leading-relaxed break-words bg-neutral-50 p-3 rounded-2xl border border-neutral-100 inline-block max-w-[85%]">
                      {msg?.text}
                    </div>

                    {/* 스레드/답글 버튼 */}
                    <div className="mt-1 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenThread(msg?.id, replyCount)}
                        className={`text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                          isThreadActive ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        💬 답글 {replyCount > 0 ? `${replyCount}개` : '달기'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 메시지 입력창 */}
        <div className="p-4 border-t border-neutral-200 bg-white flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`#${activeRoom} 방에 메시지 보내기...`}
              className="flex-1 h-11 px-4 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:outline-blue-500 bg-neutral-50/50"
            />
            <button
              type="submit"
              className="px-5 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              전송
            </button>
          </form>
        </div>
      </div>

      {/* 스레드 (사이드 답글 창) */}
      {activeThreadMessageId && activeThreadMessage && (
        <div className="w-[360px] h-full bg-white border-l border-neutral-200 flex flex-col flex-shrink-0 shadow-lg animate-fade-in">
          <div className="h-14 px-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <span className="text-xs font-bold text-neutral-800">💬 스레드 답글</span>
            <button
              type="button"
              onClick={() => setActiveThreadMessageId(null)}
              className="text-neutral-400 hover:text-neutral-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-4 border-b border-neutral-100 bg-blue-50/30">
            <div className="text-xs font-bold text-neutral-800 mb-1">{activeThreadMessage.user}</div>
            <div className="text-xs text-neutral-600">{activeThreadMessage.text}</div>
          </div>

          {/* 답글 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(activeThreadMessage.replies || []).map((r: any) => (
              <div key={r.id || Math.random()} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-neutral-800">{r.user}</span>
                  <span className="text-[9px] text-neutral-400">{r.time}</span>
                </div>
                <div className="text-xs text-neutral-700">{r.text}</div>
              </div>
            ))}
          </div>

          {/* 답글 입력 */}
          <div className="p-3 border-t border-neutral-200 bg-white">
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                value={inputReplyText}
                onChange={(e) => setInputReplyText(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="flex-1 h-9 px-3 border border-neutral-300 rounded-lg text-xs focus:outline-blue-500"
              />
              <button
                type="submit"
                className="px-3 h-9 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
              >
                전송
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}