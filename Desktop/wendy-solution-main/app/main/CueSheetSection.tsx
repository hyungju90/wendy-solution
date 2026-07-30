'use client';

import React from 'react';

interface CueSheetSectionProps {
  schedules: any[];
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
  getRowBgClass?: (row: any) => string;
  onNavigate: (schedule: any) => void;
}

export default function CueSheetSection({
  schedules = [],
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  getRowBgClass,
  onNavigate,
}: CueSheetSectionProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 1. 선택된 년/월 데이터 필터링
  const currentMonthSchedules = schedules.filter((item: any) => {
    if (!item?.broadcast_date) return false;
    const parts = String(item.broadcast_date).split('-');
    if (parts.length < 3) return false;
    return Number(parts[0]) === selectedYear && Number(parts[1]) === selectedMonth;
  });

  // 2. 시간순 정렬 (09:00 -> 10:00 -> 11:00)
  const sortedSchedules = [...currentMonthSchedules].sort((a, b) => {
    const dateA = String(a.broadcast_date || '');
    const dateB = String(b.broadcast_date || '');
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const timeA = String(a.start_time || '00:00');
    const timeB = String(b.start_time || '00:00');
    return timeA.localeCompare(timeB);
  });

  // 🚀 맘편한육아(노란색) 등 방송명/플랫폼 통합 색상 감지 함수
  const getBadgeStyle = (item: any) => {
    if (getRowBgClass) return getRowBgClass(item);

    const text = `${item.row_color || ''} ${item.platform || ''} ${item.client_name || item.client || ''} ${item.broadcast_title || ''}`.toLowerCase();

    // 맘편한육아 ➔ 노란색
    if (text.includes('맘편한') || text.includes('맘육') || text.includes('yellow') || text.includes('노랑')) {
      return 'bg-[#FFF5CE] text-[#634f05] border-amber-300 font-bold';
    }
    // G마켓 ➔ 초록색
    if (text.includes('g마켓') || text.includes('지마켓') || text.includes('green') || text.includes('초록')) {
      return 'bg-[#E2F0D9] text-[#244b11] border-emerald-300 font-bold';
    }
    // 틱톡 ➔ 보라색
    if (text.includes('틱톡') || text.includes('tiktok') || text.includes('purple') || text.includes('보라')) {
      return 'bg-[#F2E6FF] text-[#4a157d] border-purple-300 font-bold';
    }
    // 11번가/쿠팡 ➔ 분홍색
    if (text.includes('11번가') || text.includes('쿠팡') || text.includes('pink') || text.includes('분홍')) {
      return 'bg-[#FFF0F5] text-[#78184a] border-pink-300 font-bold';
    }
    // 네이버 (기본) ➔ 파란색
    return 'bg-[#E2EEF9] text-[#113a6b] border-blue-200 font-bold';
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-xs">
      {/* 1. 타이틀 영역 */}
      <div className="flex justify-between items-center mb-5 h-9 flex-shrink-0">
        <h1 className="text-xl font-medium text-neutral-900">큐시트 생성</h1>
      </div>

      {/* 2. 공지사항 바 */}
      <div className="w-full h-14 px-6 mb-6 bg-blue-50/60 border border-blue-100 rounded-xl flex justify-between items-center flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="text-blue-600 font-bold text-xs bg-blue-100 px-2.5 py-1 rounded">
            공지사항
          </span>
          <span className="text-xs text-neutral-700 font-medium">
            26년 2분기 쿠팡 선물 대잔치 공지
          </span>
        </div>
        <button className="text-xs text-neutral-500 border border-neutral-200 bg-white px-3 py-1.5 rounded-lg hover:bg-neutral-50 cursor-pointer transition">
          공지사항 바로가기
        </button>
      </div>

      {/* 3. 월 선택 버튼 바 */}
      <div className="flex items-center gap-2 mb-6 flex-shrink-0">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-full font-bold text-xs transition cursor-pointer ${
              selectedMonth === m
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {m}월
          </button>
        ))}
      </div>

      {/* 4. 큐시트 생성 스케줄 테이블 */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs bg-white mb-36">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 font-bold text-neutral-500 h-12 text-xs whitespace-nowrap">
                <th className="px-4 border-r border-neutral-100 w-28">방송날짜</th>
                <th className="px-4 border-r border-neutral-100 w-24">시작시간</th>
                <th className="px-4 border-r border-neutral-100 w-28">플랫폼</th>
                <th className="px-6 border-r border-neutral-100 text-left min-w-[250px]">품목 (방송명)</th>
                <th className="px-4 border-r border-neutral-100 w-28">담당PD</th>
                <th className="px-4 w-28">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortedSchedules.length > 0 ? (
                sortedSchedules.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 h-12 transition text-xs whitespace-nowrap">
                    {/* 방송 날짜 */}
                    <td className="px-4 border-r border-neutral-100 font-medium text-neutral-600">
                      {item.broadcast_date || '-'}
                    </td>
                    {/* 시작 시간 */}
                    <td className="px-4 border-r border-neutral-100 text-neutral-600 font-mono">
                      {item.start_time ? String(item.start_time).slice(0, 5) : '-'}
                    </td>
                    {/* 🚀 플랫폼 뱃지 (맘편한육아 노란색 반영) */}
                    <td className="px-4 border-r border-neutral-100">
                      <div className="flex justify-center items-center">
                        <span
                          className={`w-20 h-6 flex items-center justify-center rounded-md text-[11px] truncate border ${getBadgeStyle(
                            item
                          )}`}
                        >
                          {item.platform || '네이버'}
                        </span>
                      </div>
                    </td>
                    {/* 품목 (방송명) */}
                    <td className="px-6 border-r border-neutral-100 text-left font-bold text-neutral-800">
                      {item.broadcast_title || '-'}
                    </td>
                    {/* 담당PD */}
                    <td className="px-4 border-r border-neutral-100 text-neutral-700 font-medium">
                      {item.pd_in_charge || item.pd || '-'}
                    </td>
                    {/* 관리 버튼 */}
                    <td className="px-4">
                      <button
                        onClick={() => onNavigate(item)}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        큐시트 생성
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-400 font-medium">
                    {selectedMonth}월에 등록된 방송 스케줄이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}