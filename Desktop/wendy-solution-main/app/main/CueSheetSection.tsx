'use client';

import React from 'react';

interface CueSheetSectionProps {
  schedules: any[];
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
}

export default function CueSheetSection({
  schedules = [],
  selectedMonth,
  setSelectedMonth,
  selectedYear,
}: CueSheetSectionProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 1. Supabase DB 스케줄에서 현재 선택된 년/월 데이터 필터링
  const currentMonthSchedules = schedules.filter((item: any) => {
    if (!item?.broadcast_date) return false;
    const parts = String(item.broadcast_date).split('-');
    if (parts.length < 2) return false;
    const itemYear = Number(parts[0]);
    const itemMonth = Number(parts[1]);
    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  // 2. 날짜 및 시간순으로 예쁘게 정렬
  currentMonthSchedules.sort((a, b) => {
    const dateA = new Date(`${a.broadcast_date}T${a.start_time || '00:00'}`);
    const dateB = new Date(`${b.broadcast_date}T${b.start_time || '00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  const handleGenerateCueSheet = (title: string) => {
    // TODO: 실제 큐시트 생성 로직 또는 페이지 이동
    alert(`[${title || '무제'}] 큐시트 생성 페이지로 이동합니다.`);
  };

  const getRowBgClass = (colorKey: string) => {
    if (colorKey === 'green' || colorKey === 'G마켓') return 'bg-[#E2F0D9] text-[#244b11]';
    if (colorKey === 'navy' || colorKey === '핫잇슈') return 'bg-[#D9E1F2] text-[#1f3864]';
    if (colorKey === 'yellow' || colorKey === '맘편한육아') return 'bg-[#FFF5CE] text-[#634f05]';
    if (colorKey === 'blue' || colorKey === '네이버') return 'bg-[#E2EEF9] text-[#113a6b]';
    if (colorKey === 'purple' || colorKey === '쿠팡' || colorKey === '틱톡') return 'bg-[#F2E6FF] text-[#4a157d]';
    if (colorKey === 'pink' || colorKey === '11번가') return 'bg-[#FFF0F5] text-[#78184a]';
    return 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="p-8 w-full h-full flex flex-col bg-white font-sans text-xs min-h-0">
      {/* 1. 통일된 타이틀 */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-medium text-neutral-900">큐시트 생성</h1>
      </div>

      {/* 2. 통일된 공지사항 바 추가 */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center flex-shrink-0">
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

      {/* 4. 스케줄 리스트 테이블 */}
      <div className="flex-1 flex flex-col border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-white min-h-0">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full border-collapse text-center">
            <thead className="sticky top-0 bg-neutral-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-neutral-200 font-bold text-neutral-500 h-12 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <th className="px-3 border-r border-neutral-100 w-24">방송날짜</th>
                <th className="px-3 border-r border-neutral-100 w-24">시작시간</th>
                <th className="px-3 border-r border-neutral-100 w-24">플랫폼</th>
                <th className="px-4 border-r border-neutral-100 text-left min-w-[200px]">품목 (방송명)</th>
                <th className="px-3 border-r border-neutral-100 w-24">담당PD</th>
                <th className="px-3 w-32">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {currentMonthSchedules.length > 0 ? (
                currentMonthSchedules.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/40 h-12 transition text-xs">
                    <td className="px-2 border-r border-neutral-100 font-medium text-neutral-600">
                      {row.broadcast_date}
                    </td>
                    <td className="px-2 border-r border-neutral-100 font-mono text-neutral-600">
                      {row.start_time ? String(row.start_time).slice(0, 5) : '-'}
                    </td>
                    <td className="px-2 border-r border-neutral-100">
                      <div className="flex justify-center items-center">
                        <span className={`w-20 h-6 flex items-center justify-center rounded-md font-semibold text-[11px] truncate whitespace-nowrap ${getRowBgClass(row.row_color || row.platform)}`}>
                          {row.platform || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 border-r border-neutral-100 text-left font-bold text-neutral-800">
                      {row.broadcast_title || '-'}
                    </td>
                    <td className="px-2 border-r border-neutral-100 text-neutral-700 font-medium">
                      {row.pd_in_charge || '-'}
                    </td>
                    <td className="px-3">
                      <button
                        onClick={() => handleGenerateCueSheet(row.broadcast_title)}
                        className="w-full py-2 px-3 bg-neutral-800 hover:bg-black text-white rounded-lg font-bold transition shadow-xs cursor-pointer"
                      >
                        큐시트 생성
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-neutral-400 font-medium">
                    {selectedMonth}월에 등록된 방송 스케줄이 없습니다. 상단의 편성표에서 방송을 먼저 등록해 주세요.
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