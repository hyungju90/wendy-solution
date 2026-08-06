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
    <div className="w-full h-full flex flex-col bg-white font-sans text-xs overflow-hidden">
      
      {/* 📌 상단 고정 영역 */}
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

      {/* 🚀 2. 테이블 스크롤 영역 (근본 구조 변경: pl-8 여백을 부모로 빼서 글씨 튀어나옴 완벽 차단) */}
      <div className="flex-1 w-full pl-8 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto outline-none pr-8 pb-32">
          
          {/* 🔹 border-separate 옵션으로 테두리 비침 현상 영구 해결 */}
          <table className="w-full border-separate border-spacing-0 text-center table-fixed min-w-[2400px] border-t border-l border-neutral-300 bg-white">
            
            <thead className="sticky top-0 z-20 bg-neutral-100 shadow-[0_1px_0_0_#d4d4d8]">
              <tr className="font-bold text-neutral-700 h-11 text-xs whitespace-nowrap">
                {/* 📌 1~7번 컬럼: 본래의 left 오프셋 복구 */}
                <th className="sticky top-0 left-0 z-30 bg-neutral-100 px-2 border-b border-r border-neutral-200 w-[90px]">날짜</th>
                <th className="sticky top-0 left-[90px] z-30 bg-neutral-100 px-2 border-b border-r border-neutral-200 w-[80px]">시작 시간</th>
                <th className="sticky top-0 left-[170px] z-30 bg-neutral-100 px-2 border-b border-r border-neutral-200 w-[80px]">종료 시간</th>
                <th className="sticky top-0 left-[250px] z-30 bg-neutral-100 px-2 border-b border-r border-neutral-200 w-[70px]">DUR(분)</th>
                <th className="sticky top-0 left-[320px] z-30 bg-neutral-100 px-2 border-b border-r border-neutral-200 w-[100px]">플랫폼</th>
                <th className="sticky top-0 left-[420px] z-30 bg-neutral-100 px-2 border-b border-r border-neutral-200 w-[110px]">의뢰 주체</th>
                <th className="sticky top-0 left-[530px] z-30 bg-neutral-100 px-4 border-b border-r-2 border-neutral-300 w-[200px] text-center shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]">품목</th>

                {/* 8번 컬럼부터는 자유 스크롤 */}
                <th className="px-2 border-b border-r border-neutral-200 w-[80px]">스튜디오</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[100px]">출연자(삼성)</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[100px]">출연자</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[100px]">출연자(외부)</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">담당PD</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">TD</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[80px]">CUT</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[80px]">CG-WIP</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[80px]">구매인증</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">VMD</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">카메라 1</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">카메라 2</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[150px]">카메라 요청</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">장비 대여</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">담당자</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">경품 지급</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[80px]">작가</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[80px]">푸드</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">유입광고</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[90px]">숏클립</th>
                <th className="px-2 border-b border-r border-neutral-200 w-[70px]">삭제</th>
              </tr>
            </thead>

            <tbody>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((row, idx) => {
                  const prevRow = idx > 0 ? filteredSchedules[idx - 1] : null;
                  const isNewDate = idx > 0 && prevRow?.broadcast_date !== row.broadcast_date;
                  
                  // 🔹 날짜 구분선(파란선)을 레이아웃 깨짐 없이 박스 쉐도우로 완벽하게 그림
                  const newDateShadow = isNewDate ? 'shadow-[inset_0_1px_0_0_#60a5fa]' : '';

                  return (
                    <tr
                      key={row.id}
                      className="group hover:bg-blue-50/50 h-11 transition text-xs whitespace-nowrap"
                    >
                      {/* 📌 고정 컬럼들 (모든 투명도 배경 제거) */}
                      <td className={`sticky left-0 z-10 bg-white group-hover:bg-blue-50 px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>
                        {renderEditableCell(row, 'broadcast_date', 'date')}
                      </td>
                      <td className={`sticky left-[90px] z-10 bg-white group-hover:bg-blue-50 px-2 border-b border-r border-neutral-200 font-mono ${newDateShadow}`}>
                        {renderEditableCell(row, 'start_time', 'time')}
                      </td>
                      <td className={`sticky left-[170px] z-10 bg-white group-hover:bg-blue-50 px-2 border-b border-r border-neutral-200 font-mono ${newDateShadow}`}>
                        {renderEditableCell(row, 'end_time', 'time')}
                      </td>
                      <td className={`sticky left-[250px] z-10 bg-white group-hover:bg-blue-50 px-2 border-b border-r border-neutral-200 font-mono ${newDateShadow}`}>
                        {renderEditableCell(row, 'duration_minutes', 'number')}
                      </td>
                      <td className={`sticky left-[320px] z-10 bg-white group-hover:bg-blue-50 px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>
                        <div className="flex justify-center items-center">
                          <span className={`w-20 h-6 flex items-center justify-center rounded-md text-[11px] truncate border ${getRowBgClass(row)}`}>
                            {row.platform || '네이버'}
                          </span>
                        </div>
                      </td>
                      <td className={`sticky left-[420px] z-10 bg-white group-hover:bg-blue-50 px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>
                        {renderEditableCell(row, 'client_name')}
                      </td>
                      <td className={`sticky left-[530px] z-10 bg-white group-hover:bg-blue-50 px-4 border-b border-r-2 border-neutral-300 text-left font-bold text-neutral-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${newDateShadow}`}>
                        {renderEditableCell(row, 'broadcast_title')}
                      </td>

                      {/* 8번 컬럼부터 자유 스크롤 */}
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'studio')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'cast_1')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'cast_2')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'cast_3')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 font-bold text-blue-600 ${newDateShadow}`}>{renderEditableCell(row, 'pd_in_charge')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'td')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'cut')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>
                        <button
                          onClick={() => handleToggleCgItem(row.id, 'cg', row.cg)}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition ${getCgBadgeStyle(row.cg)}`}
                        >
                          {row.cg || '대기'}
                        </button>
                      </td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'purchase_auth')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'vmd')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'camera_1')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'camera_2')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'camera_request')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'equipment_rental')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>
                        <button
                          onClick={() => handleToggleEventStatus(row.id, row.manager)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            row.manager === '유' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {row.manager || '무'}
                        </button>
                      </td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'gift_payout')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'writer')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'food')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'ad_inflow')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>{renderEditableCell(row, 'short_clip')}</td>
                      <td className={`px-2 border-b border-r border-neutral-200 ${newDateShadow}`}>
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