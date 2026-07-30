'use client';

import React, { useState } from 'react';

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

  // 🚀 클릭한 방송 스케줄 저장 상태 (모달용)
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay();
  const getDaysInPrevMonth = (year: number, month: number) => new Date(year, month - 1, 0).getDate();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const prevMonthDays = getDaysInPrevMonth(selectedYear, selectedMonth);

  const prevMonthDates = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = firstDay + daysInMonth;
  const trailingDaysCount = (7 - (totalCells % 7)) % 7;
  const nextMonthDates = Array.from({ length: trailingDaysCount }, (_, i) => i + 1);

  const currentMonthSchedules = schedules.filter((item: any) => {
    if (!item?.broadcast_date) return false;
    const parts = String(item.broadcast_date).split('-');
    if (parts.length < 3) return false;
    const itemYear = Number(parts[0]);
    const itemMonth = Number(parts[1]);
    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  const getCastDisplay = (schedule: any) => {
    if (!schedule) return '미지정';

    const candidates = [
      schedule.cast_1,
      schedule.cast_2,
      schedule.cast_3,
      schedule.cast
    ];

    const validNames = candidates
      .filter((val) => val && typeof val === 'string' && val.trim() !== '' && val !== '미지정' && val !== 'null')
      .flatMap((val) => val.split(/[,/]/))
      .map((name) => name.trim())
      .filter((name) => name !== '');

    const uniqueNames = Array.from(new Set(validNames));

    return uniqueNames.length > 0 ? uniqueNames.join(', ') : '미지정';
  };

  return (
    /* 🚀 1. 메인 단일 스크롤 컨테이너 */
    <div className="p-8 pb-32 w-full h-full overflow-y-auto bg-white font-sans text-xs">
      {/* 1. 타이틀 영역 */}
      <div className="flex justify-between items-center mb-5 h-9 flex-shrink-0">
        <h1 className="text-xl font-bold text-neutral-900">{selectedYear}년 {selectedMonth}월 방송 캘린더</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            + 방송 등록
          </button>
        </div>
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

      {/* 4. 캘린더 메인 프레임 (내부 이중 스크롤 제거) */}
      <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden mb-12">
        
        {/* 요일 헤더 (상단 고정) */}
        <div className="grid grid-cols-7 bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-2xs">
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

        {/* 🚀 이중 스크롤바 요소를 제거하고 자연스럽게 높이가 늘어나도록 수정 */}
        <div className="grid grid-cols-7 gap-[1px] bg-neutral-200 auto-rows-min">
          
          {/* 지난달 날짜 칸 */}
          {prevMonthDates.map((day) => (
            <div key={`prev-${day}`} className="bg-[#FAFAFA] p-2.5 flex flex-col min-h-[220px]">
              <span className="font-bold text-[13px] text-neutral-400 mb-2">{day}일</span>
            </div>
          ))}
          
          {/* 이번달 날짜 칸 */}
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
              <div key={`day-${day}`} className="bg-white p-2.5 flex flex-col transition hover:bg-neutral-50 min-w-0 min-h-[220px]">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                  <span className="font-bold text-[13px] text-neutral-800">{day}일</span>
                  {daySchedules.length > 0 && (
                    <span className="px-1.5 py-0.5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                      {daySchedules.length}건
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5 flex-1">
                  {daySchedules.map((schedule: any) => {
                    const timeStr = schedule.start_time ? String(schedule.start_time).slice(0, 5) : '';
                    const bgClass = getRowBgClass(schedule);
                    
                    return (
                      <div 
                        key={schedule.id} 
                        onClick={() => setSelectedSchedule(schedule)}
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

          {/* 다음달 날짜 칸 */}
          {nextMonthDates.map((day) => (
            <div key={`next-${day}`} className="bg-[#FAFAFA] p-2.5 flex flex-col min-h-[220px]">
              <span className="font-bold text-[13px] text-neutral-400 mb-2">{day}일</span>
            </div>
          ))}
        </div>
      </div>

      {/* 방송 상세 모달 */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="bg-[#FAFAFA] border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  {selectedSchedule.start_time ? String(selectedSchedule.start_time).slice(0, 5) : '시간 미정'}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {selectedSchedule.broadcast_date}
                </span>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="w-7 h-7 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 leading-snug">
                  {selectedSchedule.broadcast_title || '방송 제목 없음'}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSchedule.category && (
                    <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                      품목: {selectedSchedule.category}
                    </span>
                  )}
                  {selectedSchedule.platform && (
                    <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                      플랫폼: {selectedSchedule.platform}
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-neutral-100" />

              <div>
                <h4 className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">
                  👥 담당 스태프 & 지정 정보
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 col-span-2">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">출연자</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {getCastDisplay(selectedSchedule)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">PD</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {selectedSchedule.pd_in_charge || selectedSchedule.pd || '미지정'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">TD</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {selectedSchedule.td_in_charge || selectedSchedule.td || selectedSchedule.technical_director || '미지정'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">CUT</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {selectedSchedule.cut || selectedSchedule.cut_in_charge || '미지정'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">구매인증</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {selectedSchedule.purchase_verification || selectedSchedule.purchase_auth || selectedSchedule.buy_auth || selectedSchedule.verification || '미지정'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">카메라1</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {selectedSchedule.camera1 || selectedSchedule.cam1 || selectedSchedule.camera_1 || '미지정'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">카메라2</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {selectedSchedule.camera2 || selectedSchedule.cam2 || selectedSchedule.camera_2 || '미지정'}
                    </span>
                  </div>
                </div>
              </div>

              {(selectedSchedule.memo || selectedSchedule.notes) && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-700 block mb-0.5">📝 방송 특이사항</span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {selectedSchedule.memo || selectedSchedule.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#FAFAFA] border-t border-neutral-200 px-6 py-3 flex justify-end">
              <button
                onClick={() => setSelectedSchedule(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}