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
          <table className="w-full border-collapse text-center min-w-[2600px]">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 font-bold text-neutral-500 h-12 text-xs whitespace-nowrap">
                <th className="px-3 border-r border-neutral-100 w-20">날짜</th>
                <th className="px-3 border-r border-neutral-100 w-20">시작 시간</th>
                <th className="px-3 border-r border-neutral-100 w-20">종료 시간</th>
                <th className="px-3 border-r border-neutral-100 w-20">DUR(분)</th>
                <th className="px-3 border-r border-neutral-100 w-24">플랫폼</th>
                <th className="px-3 border-r border-neutral-100 w-24">의뢰 주체</th>
                <th className="px-4 border-r border-neutral-100 text-left min-w-[180px]">품목</th>
                <th className="px-3 border-r border-neutral-100 w-20">스튜디오</th>
                <th className="px-3 border-r border-neutral-100 w-24">출연자(삼성)</th>
                <th className="px-3 border-r border-neutral-100 w-24">출연자</th>
                <th className="px-3 border-r border-neutral-100 w-24">출연자(외부)</th>
                <th className="px-3 border-r border-neutral-100 w-20">담당PD</th>
                <th className="px-3 border-r border-neutral-100 w-20">TD</th>
                <th className="px-3 border-r border-neutral-100 w-20">CUT</th>
                <th className="px-3 border-r border-neutral-100 w-24 bg-blue-50/50 text-blue-900">CG - WIP</th>
                <th className="px-3 border-r border-neutral-100 w-20">구매인증</th>
                <th className="px-3 border-r border-neutral-100 w-20">VMD</th>
                <th className="px-3 border-r border-neutral-100 w-24">카메라 1</th>
                <th className="px-3 border-r border-neutral-100 w-24">카메라 2</th>
                <th className="px-4 border-r border-neutral-100 min-w-[150px]">카메라 요청 (사전촬영 등)</th>
                <th className="px-3 border-r border-neutral-100 w-24">장비 대여</th>
                <th className="px-3 border-r border-neutral-100 w-20">담당자</th>
                <th className="px-3 border-r border-neutral-100 w-24">경품 지급</th>
                <th className="px-3 border-r border-neutral-100 w-20">작가</th>
                <th className="px-3 border-r border-neutral-100 w-20">푸드</th>
                <th className="px-3 border-r border-neutral-100 w-20">유입광고</th>
                <th className="px-3 border-r border-neutral-100 w-20">숏클립</th>
                <th className="px-3 border-r border-neutral-100 w-20">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 h-12 transition text-xs whitespace-nowrap">
                    {/* 1. 날짜 */}
                    <td className="px-2 border-r border-neutral-100 font-medium text-neutral-600">
                      {renderEditableCell(row, 'broadcast_date')}
                    </td>
                    {/* 2. 시작 시간 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600 font-mono">
                      {renderEditableCell(row, 'start_time')}
                    </td>
                    {/* 3. 종료 시간 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600 font-mono">
                      {renderEditableCell(row, 'end_time')}
                    </td>
                    {/* 4. DUR(분) */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'duration_minutes', 'number')}
                    </td>
                    {/* 5. 플랫폼 */}
                    <td className="px-2 border-r border-neutral-100">
                      <div className="flex justify-center items-center">
                        <span
                          className={`w-20 h-6 flex items-center justify-center rounded-md font-semibold text-[11px] truncate ${getRowBgClass(
                            row.row_color || row.platform
                          )}`}
                        >
                          {row.platform || '네이버'}
                        </span>
                      </div>
                    </td>
                    {/* 6. 의뢰 주체 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'client_name')}
                    </td>
                    {/* 7. 품목 */}
                    <td className="px-4 border-r border-neutral-100 text-left font-bold text-neutral-800">
                      {renderEditableCell(row, 'broadcast_title')}
                    </td>
                    {/* 8. 스튜디오 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'studio')}
                    </td>
                    {/* 9. 출연자(삼성) */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'cast_1')}
                    </td>
                    {/* 10. 출연자 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'cast_2')}
                    </td>
                    {/* 11. 출연자(외부) */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'cast_3')}
                    </td>
                    {/* 12. 담당PD */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-700 font-medium">
                      {renderEditableCell(row, 'pd_in_charge')}
                    </td>
                    {/* 13. TD */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'td')}
                    </td>
                    {/* 14. CUT */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'cut')}
                    </td>
                    {/* 15. CG - WIP */}
                    <td className="px-2 border-r border-neutral-100 bg-blue-50/20 font-bold text-blue-700">
                      {renderEditableCell(row, 'cg')}
                    </td>
                    {/* 16. 구매인증 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'purchase_auth')}
                    </td>
                    {/* 17. VMD */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'vmd')}
                    </td>
                    {/* 18. 카메라 1 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'camera_1')}
                    </td>
                    {/* 19. 카메라 2 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'camera_2')}
                    </td>
                    {/* 20. 카메라 요청 (사전촬영 등) */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600 text-left">
                      {renderEditableCell(row, 'camera_request')}
                    </td>
                    {/* 21. 장비 대여 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'equipment_rental')}
                    </td>
                    {/* 22. 담당자 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'manager')}
                    </td>
                    {/* 23. 경품 지급 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'gift_payout')}
                    </td>
                    {/* 24. 작가 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'writer')}
                    </td>
                    {/* 25. 푸드 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'food')}
                    </td>
                    {/* 26. 유입광고 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'ad_inflow')}
                    </td>
                    {/* 27. 숏클립 */}
                    <td className="px-2 border-r border-neutral-100 text-neutral-600">
                      {renderEditableCell(row, 'short_clip')}
                    </td>
                    {/* 삭제 관리 */}
                    <td className="px-2 border-r border-neutral-100">
                      <button
                        onClick={() => handleDeleteSchedule(row.id, row.broadcast_title)}
                        className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 cursor-pointer transition"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={28} className="py-16 text-center text-neutral-400 font-medium">
                    {selectedMonth}월에 등록된 방송 스케줄이 없습니다. 우측 상단 [+ 방송 등록] 버튼을 눌러 새 스케줄을 추가해 주세요!
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