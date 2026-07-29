'use client';

import React, { useState, useEffect } from 'react';

// InputField를 메인 컴포넌트 밖으로 분리하여 타이핑 시 포커스가 풀리는 현상 방지
const InputField = ({ label, name, value, onChange, placeholder, type = "text" }: any) => (
  <div className="flex flex-col">
    <label className="text-[13px] text-neutral-700 mb-2">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[14px] text-neutral-900 outline-none focus:border-[#0064FF] transition placeholder:text-neutral-300" 
    />
  </div>
);

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: any) => void;
}

export default function AddScheduleModal({ isOpen, onClose, onSave }: AddScheduleModalProps) {
  const [activeTab, setActiveTab] = useState(1);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 구해주는 함수
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 기본 데이터 셋팅
  const initialFormData = {
    broadcast_title: '',
    platform: '네이버',
    broadcast_date: getTodayDate(),
    duration_minutes: '',
    start_time: '11:00',
    end_time: '',
    client_name: '',
    pd_in_charge: '',
    td: '',
    cut: '',
    purchase_auth: '',
    vmd: '',
    camera_1: '',
    camera_2: '',
    camera_request: '',
    studio: '',
    equipment_rental: '',
    writer: '',
    food: '',
    ad_inflow: '',
    short_clip: '',
    gift_payout: '',
    manager: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // 모달이 열릴 때마다 초기 상태로 리셋
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setActiveTab(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlatformClick = (platformName: string) => {
    setFormData({ ...formData, platform: platformName });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const renderPlatformBtn = (name: string, bgClass: string, borderClass: string) => {
    const isActive = formData.platform === name;
    return (
      <button
        key={name}
        onClick={() => handlePlatformClick(name)}
        className={`py-3 rounded-lg text-[14px] transition flex items-center justify-center border ${
          isActive 
            ? `${bgClass} ${borderClass} ring-2 ring-blue-400/40 text-black font-medium` 
            : `${bgClass} ${borderClass} text-neutral-800 hover:opacity-80`
        }`}
      >
        {name}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-[520px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-200">
          <h2 className="text-[16px] font-bold text-black tracking-tight">방송 등록</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-black transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex bg-[#FAFAFA] border-b border-neutral-200 text-[14px]">
          <button onClick={() => setActiveTab(1)} className={`flex-1 py-3.5 text-center border-r border-neutral-200 relative transition-colors ${activeTab === 1 ? 'bg-white text-black font-medium' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            1. 기본정보
            {activeTab === 1 && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white"></div>}
          </button>
          <button onClick={() => setActiveTab(2)} className={`flex-1 py-3.5 text-center border-r border-neutral-200 relative transition-colors ${activeTab === 2 ? 'bg-white text-black font-medium' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            2. 기술 스텝
            {activeTab === 2 && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white"></div>}
          </button>
          <button onClick={() => setActiveTab(3)} className={`flex-1 py-3.5 text-center relative transition-colors ${activeTab === 3 ? 'bg-white text-black font-medium' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            3. 기타
            {activeTab === 3 && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white"></div>}
          </button>
        </div>

        {/* 바디 영역 */}
        <div className="p-6 overflow-y-auto h-[600px]">
          
          {/* 탭 1: 기본정보 */}
          {activeTab === 1 && (
            <div className="flex flex-col gap-6">
              <InputField label="품목(방송명)" name="broadcast_title" value={formData.broadcast_title} onChange={handleChange} placeholder="핫잇슈 삼성갤럭시" />

              <div>
                <label className="block text-[13px] text-neutral-700 mb-2">플랫폼</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {renderPlatformBtn('네이버', 'bg-[#EBF3FC]', 'border-[#D9E6F6]')}
                  {renderPlatformBtn('핫잇슈', 'bg-[#ECEEFC]', 'border-[#DCDFF3]')}
                  {renderPlatformBtn('맘편한육아', 'bg-[#FFF7DF]', 'border-[#F6ECD1]')}
                  {renderPlatformBtn('G마켓', 'bg-[#EDF5EA]', 'border-[#DEEDDA]')}
                  {renderPlatformBtn('쿠팡', 'bg-[#F5ECFE]', 'border-[#EBE0F7]')}
                  {renderPlatformBtn('11번가', 'bg-[#FFEDF3]', 'border-[#FCE0E9]')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <InputField label="방송 날짜" name="broadcast_date" value={formData.broadcast_date} onChange={handleChange} type="date" />
                <InputField label="운영시간 (DUR 분)" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} placeholder="60" type="number" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <InputField label="시작 시간" name="start_time" value={formData.start_time} onChange={handleChange} type="time" />
                <InputField label="종료 시간" name="end_time" value={formData.end_time} onChange={handleChange} type="time" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <InputField label="의뢰 주체" name="client_name" value={formData.client_name} onChange={handleChange} placeholder="삼성" />
                <InputField label="PD" name="pd_in_charge" value={formData.pd_in_charge} onChange={handleChange} placeholder="이승기" />
              </div>
            </div>
          )}

          {/* 🚀 탭 2: 기술 스텝 (모든 입력 칸 가이드 문구를 "입력"으로 변경) */}
          {activeTab === 2 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-5">
                <InputField label="TD" name="td" value={formData.td} onChange={handleChange} placeholder="입력" />
                <InputField label="CUT" name="cut" value={formData.cut} onChange={handleChange} placeholder="입력" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="구매인증" name="purchase_auth" value={formData.purchase_auth} onChange={handleChange} placeholder="입력" />
                <InputField label="VMD" name="vmd" value={formData.vmd} onChange={handleChange} placeholder="입력" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="카메라 1" name="camera_1" value={formData.camera_1} onChange={handleChange} placeholder="입력" />
                <InputField label="카메라 2" name="camera_2" value={formData.camera_2} onChange={handleChange} placeholder="입력" />
              </div>
              <div>
                <label className="block text-[13px] text-neutral-700 mb-2">카메라 세부 요청 (사전 촬영 등)</label>
                <textarea 
                  name="camera_request" 
                  value={formData.camera_request} 
                  onChange={handleChange} 
                  placeholder="입력" 
                  className="w-full px-3.5 py-3 border border-neutral-200 rounded-lg text-[14px] text-neutral-900 outline-none focus:border-[#0064FF] transition resize-none h-24 placeholder:text-neutral-300" 
                />
              </div>
            </div>
          )}

          {/* 🚀 탭 3: 기타 (모든 입력 칸 가이드 문구를 "입력"으로 변경) */}
          {activeTab === 3 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-5">
                <InputField label="스튜디오" name="studio" value={formData.studio} onChange={handleChange} placeholder="입력" />
                <InputField label="장비 외주 대여 현황" name="equipment_rental" value={formData.equipment_rental} onChange={handleChange} placeholder="입력" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="작가" name="writer" value={formData.writer} onChange={handleChange} placeholder="입력" />
                <InputField label="푸드" name="food" value={formData.food} onChange={handleChange} placeholder="입력" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="유입광고" name="ad_inflow" value={formData.ad_inflow} onChange={handleChange} placeholder="입력" />
                <InputField label="숏클립" name="short_clip" value={formData.short_clip} onChange={handleChange} placeholder="입력" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="경품 지급안" name="gift_payout" value={formData.gift_payout} onChange={handleChange} placeholder="입력" />
                <InputField label="담당자" name="manager" value={formData.manager} onChange={handleChange} placeholder="입력" />
              </div>
            </div>
          )}
        </div>

        {/* 푸터 (버튼 영역) */}
        <div className="p-5 border-t border-neutral-100 bg-white flex justify-end gap-2.5 rounded-b-xl">
          <button onClick={onClose} className="px-6 py-2.5 text-[14px] text-neutral-800 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition cursor-pointer">
            취소
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 text-[14px] text-white bg-[#0064FF] rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm">
            스케줄 저장
          </button>
        </div>

      </div>
    </div>
  );
}