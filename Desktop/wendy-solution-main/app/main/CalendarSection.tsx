'use client';

import React from 'react';

interface CalendarSectionProps {
  schedules: any[];
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  getRowBgClass: (colorKey: string) => string;
  handleExcelUpload: () => void;
  exportToExcel: () => void;
  handleOpenModal: () => void;
  fetchSchedules: () => void;
  supabase: any;
}

export default function CalendarSection({
  schedules = [],
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  getRowBgClass,
  handleOpenModal,
}: CalendarSectionProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 달력 기본 정보 및 이전/다음 달 계산 로직
  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay();
  const getDaysInPrevMonth = (year: number, month: number) => new Date(year, month - 1, 0).getDate();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const prevMonthDays = getDaysInPrevMonth(selectedYear, selectedMonth);

  // 1. 이전 달 날짜 칸 채우기
  const prevMonthDates = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
  
  // 2. 이번 달 날짜
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 3. 다음 달 날짜 칸 채우기 (마지막 주 빈칸)
  const totalCells = firstDay + daysInMonth;
  const trailingDaysCount = (7 - (totalCells % 7)) % 7;
  const nextMonthDates = Array.from({ length: trailingDaysCount }, (_, i) => i + 1);

  // Supabase DB 스케줄에서 현재 선택된 년/월 데이터 필터링
  const currentMonthSchedules = schedules.filter((item: any) => {
    if (!item?.broadcast_date) return false;
    const parts = String(item.broadcast_date).split('-');
    if (parts.length < 3) return false;
    const itemYear = Number(parts[0]);
    const itemMonth = Number(parts[1]);
    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  return (
    <div className="p-8 w-full h-full flex flex-col bg-white font-sans text-xs min-h-0">
      {/* 1. 통일된 타이틀 및 우측 액션 버튼 */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-medium text-neutral-900">{selectedYear}년 {selectedMonth}월 방송 캘린더</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
          >
            + 방송 등록
          </button>
        </div>
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

      {/* 4. 캘린더 본체 */}
      <div className="flex-1 flex flex-col border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden h-full">
        
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-white border-b border-neutral-200 flex-shrink-0 sticky top-0 z-10">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
            <div 
              key={day} 
              className={`text-center py-3 text-xs font-bold ${
                idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-neutral-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 바디 */}
        <div className="flex-1 overflow-y-auto bg-white no-scrollbar border-t border-neutral-200">
          <div className="grid grid-cols-7 gap-[1px] bg-neutral-200 auto-rows-min border-b border-neutral-200">
            
            {/* 이전 달 날짜 칸 */}
            {prevMonthDates.map((day) => (
              <div key={`prev-${day}`} className="bg-[#FAFAFA] p-2.5 flex flex-col min-h-[140px]">
                <span className="font-bold text-[13px] text-neutral-400 mb-2">{day}일</span>
              </div>
            ))}
            
            {/* 이번 달 날짜 칸 */}
            {days.map((day) => {
              const daySchedules = currentMonthSchedules.filter((item: any) => {
                const parts = String(item.broadcast_date).split('-');
                return Number(parts[2]) === day;
              });

              daySchedules.sort((a, b) => {
                const timeA = a.start_time || '00:00';
                const timeB = b.start_time || '00:00';
                return timeA.localeCompare(timeB);
              });

              return (
                <div key={`day-${day}`} className="bg-white p-2.5 flex flex-col transition hover:bg-neutral-50 min-w-0 min-h-[140px]">
                  <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <span className="font-bold text-[13px] text-neutral-800">{day}일</span>
                    {daySchedules.length > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                        {daySchedules.length}건
                      </span>
                    )}
                  </div>
                  
                  {/* 스케줄 카드 목록 */}
                  <div className="flex flex-col gap-1.5 flex-1 h-full">
                    {daySchedules.map((schedule: any) => {
                      const timeStr = schedule.start_time ? String(schedule.start_time).slice(0, 5) : '';
                      const bgClass = getRowBgClass(schedule.row_color || schedule.platform);
                      
                      return (
                        <div 
                          key={schedule.id} 
                          className={`flex flex-col p-1.5 rounded-md border text-[11px] leading-tight cursor-pointer hover:opacity-80 transition ${bgClass} border-black/5`}
                          title={`${schedule.broadcast_title} (${schedule.pd_in_charge} PD)`}
                        >
                          <div className="flex justify-between items-center font-bold mb-1">
                            <span>{timeStr}</span>
                            <span className="truncate ml-1">{schedule.pd_in_charge ? `${schedule.pd_in_charge}PD` : ''}</span>
                          </div>
                          <div className="truncate text-black/70 font-medium whitespace-normal">
                            {schedule.broadcast_title || '제목 없음'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 다음 달 날짜 칸 */}
            {nextMonthDates.map((day) => (
              <div key={`next-${day}`} className="bg-[#FAFAFA] p-2.5 flex flex-col min-h-[140px]">
                <span className="font-bold text-[13px] text-neutral-400 mb-2">{day}일</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}