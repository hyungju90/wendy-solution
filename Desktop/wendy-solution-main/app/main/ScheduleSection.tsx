'use client';

import React from 'react';

interface ScheduleSectionProps {
  currentTab: string;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  filteredSchedules: any[];
  schedules: any[];
  getRowBgClass: (rowOrColorKey: any) => string;
  getCgBadgeStyle: (val: string) => string;
  renderEditableCell: (row: any, field: string, inputType?: string) => React.ReactNode;
  handleToggleEventStatus: (id: string, currentVal: string) => void;
  handleDeleteSchedule: (id: string, title: string) => void;
  handleToggleCgItem: (id: string, columnName: string, currentVal: string) => void;
  handleExcelUpload: () => void;
  exportToExcel: () => void;
  handleOpenModal: () => void;
}

// 🚀 '07-01' 또는 '2026-07-01' 형식의 날짜를 '7월 1일' 형태로 다듬어주는 함수
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = String(dateStr).trim().split('-');

  // '07-01' 형태일 경우
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(day)) return `${month}월 ${day}일`;
  }

  // '2026-07-01' 형태일 경우
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(month) && !isNaN(day)) return `${month}월 ${day}일`;
  }

  return dateStr;
};

export default function ScheduleSection({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  filteredSchedules = [],
  getRowBgClass,
  getCgBadgeStyle,
  renderEditableCell,
  handleToggleEventStatus,
  handleDeleteSchedule,
  handleToggleCgItem,
  exportToExcel,
  handleOpenModal,
}: ScheduleSectionProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    /* 🚀 1. 메인 컨테이너 (스크롤 방지, 꽉 찬 화면 유지) */
    <div className="w-full h-full flex flex-col bg-white font-sans text-xs overflow-hidden">
      
      {/* 📌 상단 고정 영역 (스크롤 시에도 타이틀/공지는 사라지지 않음) */}
      <div className="pt-8 px-8 pb-5 flex-shrink-0">
        <div className="flex justify-between items-center mb-5 h-9">
          <h1 className="text-xl font-medium text-neutral-900">웬디 스텝 스튜디오 편성</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              ↓ 엑셀 다운로드
            </button>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              + 방송 등록
            </button>
          </div>
        </div>

        <div className="w-full h-14 px-6 mb-6 bg-blue-50/60 border border-blue-100 rounded-xl flex justify-between items-center select-none">
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

        <div className="flex items-center gap-2">
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
      </div>

      {/* 🚀 2. 테이블 스크롤 영역 (이 안에서만 가로, 세로 스크롤 동작) */}
      <div className="flex-1 overflow-auto outline-none">
        
        {/* 가로 스크롤 시에도 양옆 32px(px-8) 여백을 안전하게 유지하기 위한 래퍼 */}
        <div className="w-fit min-w-full px-8 pb-32">
          
          {/* 표 겉면 테두리 설정 (border-neutral-300) */}
          <table className="w-full border-collapse text-center table-fixed min-w-[2400px] border border-neutral-300 bg-white">
            
            {/* 📌 스크롤을 내려도 완벽하게 고정되는 Sticky 헤더 */}
            <thead className="sticky top-0 z-20 bg-neutral-100 shadow-[0_1px_0_0_#d4d4d8]">
              <tr className="font-bold text-neutral-700 h-11 text-xs whitespace-nowrap">
                <th className="px-2 border-r border-neutral-200 w-[90px]">날짜</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">시작 시간</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">종료 시간</th>
                <th className="px-2 border-r border-neutral-200 w-[70px]">DUR(분)</th>
                <th className="px-2 border-r border-neutral-200 w-[100px]">플랫폼</th>
                <th className="px-2 border-r border-neutral-200 w-[110px]">의뢰 주체</th>
                <th className="px-4 border-r border-neutral-200 w-[350px] text-center">품목</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">스튜디오</th>
                <th className="px-2 border-r border-neutral-200 w-[100px]">출연자(삼성)</th>
                <th className="px-2 border-r border-neutral-200 w-[100px]">출연자</th>
                <th className="px-2 border-r border-neutral-200 w-[100px]">출연자(외부)</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">담당PD</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">TD</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">CUT</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">CG-WIP</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">구매인증</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">VMD</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">카메라 1</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">카메라 2</th>
                <th className="px-2 border-r border-neutral-200 w-[150px]">카메라 요청</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">장비 대여</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">담당자</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">경품 지급</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">작가</th>
                <th className="px-2 border-r border-neutral-200 w-[80px]">푸드</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">유입광고</th>
                <th className="px-2 border-r border-neutral-200 w-[90px]">숏클립</th>
                <th className="px-2 w-[70px]">삭제</th>
              </tr>
            </thead>

            {/* 스케줄 리스트 행들 */}
            <tbody>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((row, idx) => {
                  const prevRow = idx > 0 ? filteredSchedules[idx - 1] : null;
                  
                  // 🚀 날짜가 변경될 때 진한 2px 테두리로 구역을 확실히 나눠줍니다.
                  const isNewDate = idx > 0 && prevRow?.broadcast_date !== row.broadcast_date;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-blue-50/50 h-11 transition text-xs whitespace-nowrap ${
                        isNewDate ? 'border-t-1 border-blue-400' : 'border-t border-neutral-200'
                      }`}
                    >
                      {/* 📌 날짜 컬럼: formatDate를 통해 '7월 1일'로 변환 출력 */}
                      {/* ⭕ 기존처럼 row를 그대로 전달해 줍니다 */}
                      <td className="px-2 border-r border-neutral-200">
                        {renderEditableCell(row, 'broadcast_date', 'date')}
                      </td>
                      <td className="px-2 border-r border-neutral-200 font-mono">{renderEditableCell(row, 'start_time', 'time')}</td>
                      <td className="px-2 border-r border-neutral-200 font-mono">{renderEditableCell(row, 'end_time', 'time')}</td>
                      <td className="px-2 border-r border-neutral-200 font-mono">{renderEditableCell(row, 'duration_minutes', 'number')}</td>
                      <td className="px-2 border-r border-neutral-200">
                        <div className="flex justify-center items-center">
                          <span className={`w-20 h-6 flex items-center justify-center rounded-md text-[11px] truncate border ${getRowBgClass(row)}`}>
                            {row.platform || '네이버'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'client_name')}</td>
                      <td className="px-4 border-r border-neutral-200 text-left font-bold text-neutral-800">{renderEditableCell(row, 'broadcast_title')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'studio')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'cast_1')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'cast_2')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'cast_3')}</td>
                      <td className="px-2 border-r border-neutral-200 font-bold text-blue-600">{renderEditableCell(row, 'pd_in_charge')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'td')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'cut')}</td>
                      <td className="px-2 border-r border-neutral-200">
                        <button
                          onClick={() => handleToggleCgItem(row.id, 'cg', row.cg)}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition ${getCgBadgeStyle(row.cg)}`}
                        >
                          {row.cg || '대기'}
                        </button>
                      </td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'purchase_auth')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'vmd')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'camera_1')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'camera_2')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'camera_request')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'equipment_rental')}</td>
                      <td className="px-2 border-r border-neutral-200">
                        <button
                          onClick={() => handleToggleEventStatus(row.id, row.manager)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            row.manager === '유' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {row.manager || '무'}
                        </button>
                      </td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'gift_payout')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'writer')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'food')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'ad_inflow')}</td>
                      <td className="px-2 border-r border-neutral-200">{renderEditableCell(row, 'short_clip')}</td>
                      <td className="px-2">
                        <button
                          onClick={() => handleDeleteSchedule(row.id, row.broadcast_title)}
                          className="px-2 py-1 bg-white border border-red-200 text-red-500 font-bold rounded hover:bg-red-50 text-[10px] transition cursor-pointer"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={28} className="py-20 text-center text-xs font-bold text-neutral-400">
                    {selectedMonth}월에 등록된 방송 편성표가 없습니다.
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