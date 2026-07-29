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
  getRowBgClass: (colorKey: string) => string;
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
  filteredSchedules = [],
  getRowBgClass,
  renderEditableCell,
  handleDeleteSchedule,
  exportToExcel,
  handleOpenModal,
}: ScheduleSectionProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 🚀 [핵심 추가] 기존 filteredSchedules 데이터를 '날짜(오름차순) -> 시작시간(오름차순)'으로 정렬
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    const dateA = String(a.broadcast_date || '');
    const dateB = String(b.broadcast_date || '');

    // 1. 날짜가 다르면 날짜 오름차순
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    // 2. 날짜가 같으면 시작 시간(09:00 -> 10:00 -> 11:00 -> 19:00) 오름차순
    const timeA = String(a.start_time || '00:00');
    const timeB = String(b.start_time || '00:00');
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-xs">
      {/* 1. 통일된 타이틀 및 우측 액션 버튼 */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-medium text-neutral-900">웬디 스텝 스튜디오 편성</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="px-3.5 py-2 border border-neutral-200 rounded-lg text-xs font-medium bg-white hover:bg-neutral-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>↓</span> 엑셀 다운로드
          </button>
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
      <div className="flex items-center gap-2 mb-6">
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

      {/* 4. 25개 전체 칼럼 수용 편성표 테이블 (가로 스크롤 가능) */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          {/* 🚀 테이블 태그에 min-w-max 또는 table-fixed 적용으로 너비 자동 계산 차단 */}
<table className="w-full border-collapse text-center table-fixed min-w-[2400px]">
  <thead>
    <tr className="bg-neutral-50/80 border-b border-neutral-200 font-bold text-neutral-500 h-12 text-xs whitespace-nowrap">
      <th className="px-2 border-r border-neutral-100 w-[90px]">날짜</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">시작 시간</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">종료 시간</th>
      <th className="px-2 border-r border-neutral-100 w-[70px]">DUR(분)</th>
      <th className="px-2 border-r border-neutral-100 w-[100px]">플랫폼</th>
      <th className="px-2 border-r border-neutral-100 w-[110px]">의뢰 주체</th>
      {/* 📌 품목 칸: 350px 고정너비 & 중앙 정렬 */}
      <th className="px-4 border-r border-neutral-100 w-[350px] text-center">품목</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">스튜디오</th>
      <th className="px-2 border-r border-neutral-100 w-[100px]">출연자(삼성)</th>
      <th className="px-2 border-r border-neutral-100 w-[100px]">출연자</th>
      <th className="px-2 border-r border-neutral-100 w-[100px]">출연자(외부)</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">담당PD</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">TD</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">CUT</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">CG-WIP</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">구매인증</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">VMD</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">카메라 1</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">카메라 2</th>
      <th className="px-2 border-r border-neutral-100 w-[150px]">카메라 요청</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">장비 대여</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">담당자</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">경품 지급</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">작가</th>
      <th className="px-2 border-r border-neutral-100 w-[80px]">푸드</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">유입광고</th>
      <th className="px-2 border-r border-neutral-100 w-[90px]">숏클립</th>
      <th className="px-2 w-[70px]">삭제</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-neutral-100">
    {filteredSchedules.map((row) => (
      <tr key={row.id} className="hover:bg-blue-50/30 h-12 transition text-xs whitespace-nowrap">
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'broadcast_date', 'date')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'start_time', 'time')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'end_time', 'time')}</td>
        <td className="px-2 border-r border-neutral-100 w-[70px]">{renderEditableCell(row, 'duration_minutes', 'number')}</td>
        <td className="px-2 border-r border-neutral-100 w-[100px]">
          <div className="flex justify-center items-center">
            <span className={`w-20 h-6 flex items-center justify-center rounded-md text-[11px] truncate ${getRowBgClass(row)}`}>
              {row.platform || '-'}
            </span>
          </div>
        </td>
        <td className="px-2 border-r border-neutral-100 w-[110px]">{renderEditableCell(row, 'client_name')}</td>
        {/* 📌 품목 데이터 셀: 350px 고정너비 & 중앙 정렬 */}
        <td className="px-4 border-r border-neutral-100 w-[350px] text-center font-bold text-neutral-800">
          {renderEditableCell(row, 'broadcast_title')}
        </td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'studio')}</td>
        <td className="px-2 border-r border-neutral-100 w-[100px]">{renderEditableCell(row, 'cast_1')}</td>
        <td className="px-2 border-r border-neutral-100 w-[100px]">{renderEditableCell(row, 'cast_2')}</td>
        <td className="px-2 border-r border-neutral-100 w-[100px]">{renderEditableCell(row, 'cast_3')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'pd_in_charge')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'td')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'cut')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'cg')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'purchase_auth')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'vmd')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'camera_1')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'camera_2')}</td>
        <td className="px-2 border-r border-neutral-100 w-[150px]">{renderEditableCell(row, 'camera_request')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'equipment_rental')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'manager')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'gift_payout')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'writer')}</td>
        <td className="px-2 border-r border-neutral-100 w-[80px]">{renderEditableCell(row, 'food')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'ad_inflow')}</td>
        <td className="px-2 border-r border-neutral-100 w-[90px]">{renderEditableCell(row, 'short_clip')}</td>
        <td className="px-2 w-[70px]">
          <button onClick={() => handleDeleteSchedule(row.id, row.broadcast_title)} className="text-red-500 hover:text-red-700 font-bold text-xs">
            삭제
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>
    </div>
  );
}