'use client';

import React from 'react';

interface DesignStatusSectionProps {
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  schedules?: any[];
  filteredSchedules?: any[];
  getRowBgClass: (colorKey: string) => string;
  handleToggleCgItem: (id: string, columnName: string, currentVal: string) => void;
}

export default function DesignStatusSection({
  selectedMonth,
  setSelectedMonth,
  filteredSchedules = [],
  getRowBgClass,
  handleToggleCgItem,
}: DesignStatusSectionProps) {
  
  // 제작 상태 버튼 스타일 (대기 / 진행 / 완료)
  const getCgStatusBtnStyle = (status: string) => {
    if (status === '진행' || status === '제작') {
      return 'bg-amber-100 text-amber-800 border-amber-300 font-bold hover:bg-amber-200';
    }
    if (status === '완료') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold hover:bg-emerald-200';
    }
    return 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200';
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 🚀 DB에서 넘어온 스케줄을 날짜 및 시작 시간 순서대로 정렬
  const displayList = [...filteredSchedules].sort((a, b) => {
    const dateA = String(a.broadcast_date || '');
    const dateB = String(b.broadcast_date || '');

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    const timeA = String(a.start_time || '00:00');
    const timeB = String(b.start_time || '00:00');
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-xs">
      {/* 1. 통일된 타이틀 */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-medium text-neutral-900">디자인 현황</h1>
      </div>

      {/* 2. 통일된 공지사항 바 */}
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

      {/* 4. Supabase DB 연동 디자인 현황 테이블 */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm bg-white min-h-0">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-center">
            <thead className="sticky top-0 bg-neutral-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-neutral-200 font-bold text-neutral-500 h-12 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)] whitespace-nowrap">
                <th className="px-3 border-r border-neutral-100 w-24">방송날짜</th>
                <th className="px-3 border-r border-neutral-100 w-20">시작시간</th>
                <th className="px-3 border-r border-neutral-100 w-24">플랫폼</th>
                <th className="px-4 border-r border-neutral-100 text-left min-w-[200px]">품목</th>
                <th className="px-3 border-r border-neutral-100 w-28 bg-blue-50/50 text-blue-900">
                  CG-WIP
                </th>
                <th className="px-3 border-r border-neutral-100 w-24">배너</th>
                <th className="px-3 border-r border-neutral-100 w-24">예고페이지</th>
                <th className="px-3 border-r border-neutral-100 w-24">전면</th>
                <th className="px-3 border-r border-neutral-100 w-24">반전면</th>
                <th className="px-3 border-r border-neutral-100 w-24">도장</th>
                <th className="px-3 border-r border-neutral-100 w-24">미디어월</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {displayList.length > 0 ? (
                displayList.map((row) => {
                  const dateStr = row.broadcast_date ? String(row.broadcast_date).substring(5) : '-';
                  const timeStr = row.start_time ? String(row.start_time).slice(0, 5) : '-';

                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40 h-12 transition text-xs whitespace-nowrap">
                      {/* 방송 날짜 */}
                      <td className="px-2 border-r border-neutral-100 font-medium text-neutral-600">
                        {dateStr}
                      </td>
                      {/* 시작 시간 */}
                      <td className="px-2 border-r border-neutral-100 text-neutral-600 font-mono">
                        {timeStr}
                      </td>
                      {/* 플랫폼 */}
                      {/* 플랫폼 */}
                      <td className="px-2 border-r border-neutral-100">
                        <div className="flex justify-center items-center">
                          <span
                            className={`w-20 h-6 flex items-center justify-center rounded-md font-semibold text-[11px] truncate ${getRowBgClass(
                              row
                            )}`}
                          >
                            {row.platform || '-'}
                          </span>
                        </div>
                      </td>
                      {/* 품목 (방송명) */}
                      <td className="px-4 border-r border-neutral-100 text-left font-bold text-neutral-800 truncate max-w-[220px]">
                        {row.broadcast_title || '-'}
                      </td>
                      
                      {/* 🚀 [수정됨] PD 폴백(|| row.pd_in_charge)을 삭제하여 CG-WIP 데이터만 정확하게 출력 */}
                      <td className="px-2 border-r border-neutral-100 bg-blue-50/20 font-bold text-blue-700">
                        {row.cg || '-'}
                      </td>

                      {/* 디자인 6종 상태 토글 버튼 */}
                      {[
                        { key: 'cg_banner', label: '배너' },
                        { key: 'cg_price', label: '예고페이지' },
                        { key: 'cg_normal', label: '전면' },
                        { key: 'cg_half', label: '반전면' },
                        { key: 'cg_stamp', label: '도장' },
                        { key: 'cg_mediawall', label: '미디어월' },
                      ].map((item) => {
                        // DB에 값이 없으면 '대기'로 기본 표시
                        const val = row[item.key] || '대기';
                        return (
                          <td key={item.key} className="px-2 border-r border-neutral-100">
                            <button
                              onClick={() => handleToggleCgItem(row.id, item.key, val)}
                              className={`w-full py-2 px-2 rounded-lg border text-[11px] transition cursor-pointer shadow-2xs whitespace-nowrap ${getCgStatusBtnStyle(
                                val
                              )}`}
                            >
                              {val}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-24 text-center text-neutral-400 font-medium">
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