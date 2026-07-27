'use client';

import React from 'react';

interface SidebarProps {
  channels?: string[];
  activeRoom?: string;
  setActiveRoom?: (room: string) => void;
  colleagues?: any[];
  unreadCounts?: { [roomName: string]: number };
  setIsMyProfileModalOpen?: (open: boolean) => void;
  setIsCreateChannelModalOpen?: (open: boolean) => void;
  handleDeleteChannel?: (e: React.MouseEvent, targetChannel: string) => void;
  setSelectedMemberDetail?: (member: any) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Sidebar({
  channels = [],
  activeRoom = '',
  setActiveRoom,
  colleagues = [],
  unreadCounts = {},
  setIsMyProfileModalOpen,
  setIsCreateChannelModalOpen,
  handleDeleteChannel,
  setSelectedMemberDetail,
}: SidebarProps) {
  return (
    <aside className="w-60 bg-[#19171D] text-[#D1D2D3] h-full flex flex-col justify-between select-none shrink-0 z-10 font-['Paperlogy'] text-sm">
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {/* 워크스페이스 헤더 */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">
              W
            </div>
            <span className="font-bold text-white text-sm">웬디 스튜디오</span>
          </div>
        </div>

        {/* 채널 목록 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-2 mb-2">
            <span>채널</span>
            <button
              onClick={() => setIsCreateChannelModalOpen?.(true)}
              className="hover:text-white text-base leading-none cursor-pointer"
            >
              +
            </button>
          </div>
          <div className="space-y-0.5">
            {channels.map((ch) => {
              const isActive = activeRoom === ch;
              const unread = unreadCounts[ch] || 0;
              return (
                <div
                  key={ch}
                  onClick={() => setActiveRoom?.(ch)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer group transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-zinc-500 group-hover:text-zinc-400">#</span>
                    <span className="truncate text-xs">{ch}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {unread}
                      </span>
                    )}
                    {ch !== '일반 (general)' && ch !== '공지사항' && (
                      <button
                        onClick={(e) => handleDeleteChannel?.(e, ch)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 사내 동료 목록 */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 px-2 mb-2">팀원 목록</div>
          <div className="space-y-0.5">
            {colleagues.map((col: any) => (
              <div
                key={col.id || col.name}
                onClick={() => setSelectedMemberDetail?.(col)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-zinc-800/60 cursor-pointer text-zinc-300 transition"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-zinc-200">{col.name}</span>
                  {col.role && <span className="text-[10px] text-zinc-500">{col.role}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 내 프로필 버튼 */}
      <div className="p-3 border-t border-zinc-800 bg-[#121016]">
        <button
          onClick={() => setIsMyProfileModalOpen?.(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800 text-left transition cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            H
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-white">이형주 PD</span>
            <span className="text-[10px] text-zinc-400">온라인</span>
          </div>
        </button>
      </div>
    </aside>
  );
}