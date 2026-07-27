'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx'; 
import Sidebar from './Sidebar';
import ChatSection from './ChatSection';
import ScheduleSection from './ScheduleSection';
import CalendarSection from './CalendarSection'; 
import CueSheetSection from './CueSheetSection';
import CueSheetListSection from './CueSheetListSection'; 
import DesignStatusSection from './DesignStatusSection';
import WendyDocSection, { type WendyDoc, type DocCategory } from './WendyDocSection';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MainChatPage() {
  type TabType = 'chat' | 'schedule' | 'calendar' | 'cgBoard' | 'wendyStatus' | 'cueSheet' | 'cueSheetList';
  
  const [currentTab, setCurrentTabState] = useState<TabType>('schedule');

  const setCurrentTab = (tab: TabType) => {
    setCurrentTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wendy_current_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramTab = urlParams.get('tab') as TabType;
      const savedTab = localStorage.getItem('wendy_current_tab') as TabType;

      const validTabs: TabType[] = ['chat', 'schedule', 'calendar', 'cgBoard', 'wendyStatus', 'cueSheet', 'cueSheetList'];
      
      if (paramTab && validTabs.includes(paramTab)) {
        setCurrentTabState(paramTab);
      } else if (savedTab && validTabs.includes(savedTab)) {
        setCurrentTabState(savedTab);
      }
    }
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);

  const [channels, setChannels] = useState<string[]>(['일반 (general)', '공지사항', '프로젝트-웬디솔루션', '디자인팀']);
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState('프로젝트-웬디솔루션');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeThreadMessageId, setActiveThreadMessageId] = useState<number | null>(null);
  const [inputReplyText, setInputReplyText] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<{ [roomName: string]: number }>({});
  const [viewedReplyCounts, setViewedReplyCounts] = useState<{ [messageId: number]: number }>({});
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);

  const [myProfileData, setMyProfileData] = useState({ id: '', name: '이형주', role: 'PD', email: '' });
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<any | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'tech' | 'etc'>('basic');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string | number>('');

  const [wendyDocs, setWendyDocs] = useState<WendyDoc[]>([
    { id: '1', title: '네이버 쇼핑라이브 어드민 운영', author: '박승호 TD', category: '방송 관련', content: '네이버 커머스 어드민 계정 매뉴얼 및 방송 예약 가이드.', createdAt: '2026-07-21' },
    { id: '2', title: 'Sauce Live 운영 (G-Live, 삼성닷컴)', author: '박승호 TD', category: '방송 관련', content: 'Sauce Live 어드민 매뉴얼 및 G-Live 연결 방법.', createdAt: '2026-07-21' },
    { id: '3', title: '웬디 로그인 관련 정보', author: '박승호 TD', category: '방송 관련', content: '사내 공용 계정 패스워드 및 보안 수칙.', createdAt: '2026-07-21' }
  ]);
  const [isWritingDocMode, setIsWritingDocMode] = useState<boolean>(false);

  // 방송 신규 등록 폼 초기값
  const initialFormData = {
    broadcast_date: '2026-07-20', start_time: '11:00', end_time: '12:00', duration_minutes: 60,
    platform: '네이버', client_name: '', broadcast_title: '', studio: '', row_color: 'blue',
    cast_1: '', cast_2: '', cast_3: '', pd_in_charge: '', td: '', cut: '', cg: '', vmd: '',
    camera_1: '', camera_2: '', camera_count: 0, camera_request: '', equipment_rental: '',
    manager: '', gift_payout: '', writer: '', food: '', ad_inflow: '', short_clip: '', purchase_auth: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  // Supabase DB에서 스케줄 불러오기
  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_schedules')
        .select('*')
        .order('broadcast_date', { ascending: true });

      if (!error && data) {
        setSchedules(data);
      }
    } catch (e) {
      console.error('스케줄 DB 조회 오류:', e);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchChatMessages();
    fetchCompanyMembers();

    // 3초마다 DB 실시간 동기화 (다른 PC에서 수정한 내역 자동 반영)
    const interval = setInterval(() => { 
      fetchSchedules(); 
      fetchChatMessages(); 
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  // 테이블 더블클릭 수정 관련
  const handleCellDoubleClick = (id: string, field: string, value: any) => { 
    setEditingCell({ id, field }); 
    setEditValue(value ?? ''); 
  };

  const handleCellSave = async (id: string, field: string) => {
    let targetValue: any = editValue;
    if (field === 'duration_minutes' || field === 'camera_count') targetValue = Number(editValue);
    const updatePayload: any = { [field]: targetValue };
    
    // DB 업데이트
    await supabase.from('broadcast_schedules').update(updatePayload).eq('id', id);
    fetchSchedules();
    setEditingCell(null);
  };

  const baseTextClassName = "text-xs font-normal text-[#332211] tracking-normal text-center font-['Paperlogy']";
  
  const renderEditableCell = (row: any, field: string, inputType: string = 'text') => {
    const isEditing = editingCell?.id === row?.id && editingCell?.field === field; 
    const value = row?.[field] ?? '';
    
    if (isEditing) { 
      return (
        <input 
          type={inputType} 
          value={editValue} 
          autoFocus 
          onChange={(e) => setEditValue(inputType === 'number' ? Number(e.target.value) : e.target.value)} 
          onBlur={() => handleCellSave(row.id, field)} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter') handleCellSave(row.id, field); 
            if (e.key === 'Escape') setEditingCell(null); 
          }} 
          className={`w-full h-8 border-2 border-blue-500 rounded focus:outline-none bg-white ${baseTextClassName}`} 
        />
      ); 
    }
    
    let displayValue = value;
    if (field === 'end_time' || field === 'start_time') {
      displayValue = String(value).slice(0,5);
    } else if (field === 'broadcast_date' && typeof value === 'string') {
      displayValue = value.substring(5); 
    }

    return (
      <div 
        onDoubleClick={() => handleCellDoubleClick(row.id, field, value)} 
        className={`cursor-pointer min-h-[24px] select-text hover:bg-black/5 rounded flex items-center justify-center transition px-1 w-full ${baseTextClassName}`}
      >
        {displayValue}
      </div>
    );
  };

  // 모달을 통한 방송 직접 등록 기능
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.broadcast_title) return alert('방송명(품목)은 필수 입력 사항입니다!');
    
    const insertData = {
      ...formData,
      cg_banner: '대기', 
      cg_price: '대기', 
      cg_normal: '대기', 
      cg_half: '대기', 
      cg_stamp: '대기', 
      cg_preview: '대기', 
      cg_mediawall: '대기'
    };

    const { error } = await supabase.from('broadcast_schedules').insert([insertData]);
    if (error) {
      alert('방송 등록 실패: ' + error.message);
    } else {
      alert('새 방송 스케줄이 성공적으로 등록되었습니다!');
      handleCloseModal(); 
      fetchSchedules(); 
    }
  };

  const handleToggleEventStatus = async (id: string, currentVal: string) => {
    const nextVal = currentVal === '유' ? '무' : '유';
    await supabase.from('broadcast_schedules').update({ manager: nextVal }).eq('id', id); 
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id: string, title: string) => {
    if (!confirm(`[${title || '무제'}] 방송 스케줄을 삭제하시겠습니까?`)) return;
    await supabase.from('broadcast_schedules').delete().eq('id', id); 
    fetchSchedules();
  };

  const handleCloseModal = () => { setIsModalOpen(false); };
  const handleOpenModal = () => { setFormData(initialFormData); setModalTab('basic'); setIsModalOpen(true); };

  const handleStartCreateDoc = () => { setIsWritingDocMode(true); };

  const handleSaveDoc = (docData: { id?: string; title: string; author: string; category: DocCategory; content: string; imageUrl: string }) => {
    if (docData.id) {
      setWendyDocs(wendyDocs.map(d => d.id === docData.id ? { ...d, ...docData } : d));
    } else {
      const newDoc: WendyDoc = {
        id: Date.now().toString(), title: docData.title, author: docData.author, category: docData.category, content: docData.content, imageUrl: docData.imageUrl, createdAt: new Date().toISOString().slice(0, 10)
      };
      setWendyDocs([newDoc, ...wendyDocs]);
    }
  };

  const handleDeleteDoc = (id: string) => { setWendyDocs(wendyDocs.filter(d => d.id !== id)); };

  const activeThreadMessage = (messages || []).find(m => m.id === activeThreadMessageId) || null;

  // 선택된 년/월로 스케줄 필터링
  const filteredSchedules = (schedules || []).filter((item: any) => {
    if (!item?.broadcast_date) return false;
    const parts = String(item.broadcast_date).split('-'); 
    if (parts.length < 2) return false;
    const itemYear = Number(parts[0]);
    const itemMonth = Number(parts[1]);
    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'camera_count' ? Number(value) : value
    }));
  };

  const getRowBgClass = (colorKey: string) => {
    if (colorKey === 'green' || colorKey === 'G마켓') return 'bg-[#E2F0D9] text-[#244b11]'; 
    if (colorKey === 'navy' || colorKey === '핫잇슈') return 'bg-[#D9E1F2] text-[#1f3864]';  
    if (colorKey === 'yellow' || colorKey === '맘편한육아') return 'bg-[#FFF5CE] text-[#634f05]'; 
    if (colorKey === 'blue' || colorKey === '네이버') return 'bg-[#E2EEF9] text-[#113a6b]';   
    if (colorKey === 'purple' || colorKey === '쿠팡') return 'bg-[#F2E6FF] text-[#4a157d]'; 
    if (colorKey === 'pink' || colorKey === '11번가') return 'bg-[#FFF0F5] text-[#78184a]';   
    return 'bg-white text-gray-900';
  };

  const getCgBadgeStyle = (val: string) => {
    if (val === '진행' || val === '제작') return 'bg-amber-100 text-amber-700 border border-amber-300 font-bold';
    if (val === '완료') return 'bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold';
    return 'bg-gray-100 text-gray-400 border border-gray-200';
  };

  const fetchCompanyMembers = async () => {
    const { data, error } = await supabase.from('profiles').select('id, name, role, status, email').order('name', { ascending: true });
    if (!error && data) {
      setColleagues(data);
      const myInfo = data.find((c: any) => c?.name?.includes('이형주') || c?.id !== ''); 
      if (myInfo) { setMyProfileData({ id: myInfo.id, name: myInfo.name, role: myInfo.role, email: myInfo.email || '' }); }
    }
  };

  const fetchChatMessages = async () => {
    const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      const currentRoomData = data.filter((m: any) => m.room_name === activeRoom);
      const parentMsgs = currentRoomData.filter((m: any) => !m.parent_id);
      const replyMsgs = currentRoomData.filter((m: any) => m.parent_id);
      const structured = parentMsgs.map((p: any) => ({
        id: p.id, user: p.user_name, time: new Date(p.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), text: p.message_text,
        replies: replyMsgs.filter((r: any) => r.parent_id === p.id).map((r: any) => ({ id: r.id, user: r.user_name, time: new Date(r.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), text: r.message_text }))
      }));
      setMessages(structured);
    }
  };

  const handleOpenThread = (msgId: number, currentReplyCount: number) => {
    setActiveThreadMessageId(msgId); setViewedReplyCounts(prev => ({ ...prev, [msgId]: currentReplyCount }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const senderName = myProfileData.name || '이형주';
    await supabase.from('chat_messages').insert([{ user_name: senderName, message_text: inputText, room_name: activeRoom }]);
    setInputText(''); fetchChatMessages();
  };

  const handleToggleCgItem = async (id: string, columnName: string, currentVal: string) => {
    const steps = ['대기', '진행', '완료'];
    const nextVal = steps[(steps.indexOf(currentVal || '대기') + 1) % steps.length];
    await supabase.from('broadcast_schedules').update({ [columnName]: nextVal }).eq('id', id); 
    fetchSchedules();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReplyText.trim() || !activeThreadMessageId) return;
    const senderName = myProfileData.name || '이형주';
    await supabase.from('chat_messages').insert([{ user_name: senderName, message_text: inputReplyText, room_name: activeRoom, parent_id: activeThreadMessageId }]);
    setInputReplyText(''); fetchChatMessages();
  };

  const handleDeleteChannel = (e: React.MouseEvent, targetChannel: string) => {
    e.stopPropagation();
    if (targetChannel === '일반 (general)' || targetChannel === '공지사항') return alert('삭제 불가 채널입니다.');
    setChannels(channels.filter(ch => ch !== targetChannel));
    if (activeRoom === targetChannel) setActiveRoom('일반 (general)');
  };

  const exportToExcel = () => {
    if (!filteredSchedules || filteredSchedules.length === 0) return alert('내보낼 데이터가 없습니다.');
    const headers = ['날짜', '시작 시간', '종료 시간', 'DUR(분)', '플랫폼', '의뢰 주체', '품목', '담당PD', 'TD', 'CUT', 'CG-WIP'];
    const rowsData = filteredSchedules.map((row) => [
      row.broadcast_date || '', row.start_time ? String(row.start_time).slice(0, 5) : '', row.end_time ? String(row.end_time).slice(0, 5) : '', row.duration_minutes || 0,
      row.platform || '', row.client_name || '', row.broadcast_title || '', row.pd_in_charge || '', row.td || '', row.cut || '', row.cg || ''
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rowsData]);
    const workbook = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(workbook, worksheet, '방송편성표');
    XLSX.writeFile(workbook, `${selectedMonth}월_wendymedia_방송스케줄.xlsx`);
  };

  const handleExcelUpload = () => {};

  const menuGroups = [
    {
      category: '방송 일정',
      items: [
        { id: 'schedule', name: '편성표' },
        { id: 'calendar', name: '캘린더' },
      ]
    },
    {
      category: '방송 제작',
      items: [
        { id: 'cueSheet', name: '큐시트 생성' },
        { id: 'cueSheetList', name: '제품 리스트' },
        { id: 'cgBoard', name: '디자인 현황' },
      ]
    },
    {
      category: '웬디 현황',
      items: [
        { id: 'wendyStatus', name: '웬디 현황' },
        { id: 'chat', name: '채팅' },
      ]
    }
  ];

  return (
    <div className="flex h-screen w-screen bg-white text-[#1D1C1D] font-['Paperlogy'] antialiased select-none overflow-hidden tracking-tight font-normal relative">
      <div className="w-full h-px absolute left-0 top-[66px] bg-zinc-300 z-10 pointer-events-none" />

      {/* 사이드바 */}
      <div className="w-[210px] h-full bg-white flex flex-col justify-start items-start flex-shrink-0 border-r border-zinc-300 relative px-[23px] pt-[20px] overflow-y-auto z-20">
        <div className="w-full inline-flex justify-start items-center gap-2.5 mb-8 h-6 flex-shrink-0">
          <div className="w-6 h-6 bg-zinc-300 rounded-[4px] flex-shrink-0" />
          <div className="justify-start text-black text-sm font-light leading-none tracking-tight">웬디미디어 솔루션</div>
        </div>

        <button 
          type="button" 
          onClick={() => {
            if (currentTab === 'wendyStatus') handleStartCreateDoc();
            else if (currentTab === 'chat') setIsCreateChannelModalOpen(true);
            else handleOpenModal();
          }}
          className="w-40 p-2.5 mb-6 rounded-lg outline outline-1 outline-offset-[-1px] outline-blue-600 inline-flex justify-center items-center gap-2.5 bg-white hover:bg-blue-50 transition cursor-pointer flex-shrink-0 shadow-xs"
        >
          <span className="justify-start text-blue-600 text-sm font-medium font-['Paperlogy']">
            {currentTab === 'wendyStatus' ? '문서 작성' : currentTab === 'chat' ? '채팅 생성' : '+ 방송 등록'}
          </span>
        </button>

        <div className="w-40 flex flex-col justify-start items-start gap-4 pb-6">
          {menuGroups.map((group) => (
            <div key={group.category} className="self-stretch flex flex-col justify-start items-start gap-[5px]">
              <div className="justify-start text-black text-[10px] font-light px-1">
                {group.category}
              </div>
             {group.items.map((item) => {
  const isActive = currentTab === item.id;
  return (
    <button
      key={item.id}
      type="button"
      onClick={() => setCurrentTab(item.id as TabType)}
      className={`self-stretch h-7 px-2.5 rounded-[5px] inline-flex justify-start items-center gap-2.5 transition cursor-pointer ${
        isActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'
      }`}
    >
      {/* 활성화 상태 인디케이터 사각형만 남김 */}
      <div className={`w-3.5 h-3.5 rounded-[2px] flex-shrink-0 transition-colors ${
        isActive ? 'bg-violet-500 shadow-xs' : 'bg-zinc-300'
      }`} />
      
      {/* 메뉴 이름 */}
      <div className={`justify-start text-sm font-['Paperlogy'] ${
        isActive ? 'text-black font-semibold' : 'text-black font-normal'
      }`}>
        {item.name}
      </div>
    </button>
  );
})}
            </div>
          ))}
        </div>
      </div>

      {currentTab === 'chat' && (
        <Sidebar 
          channels={channels} 
          activeRoom={activeRoom} 
          setActiveRoom={setActiveRoom} 
          colleagues={colleagues} 
          unreadCounts={unreadCounts} 
          setIsMyProfileModalOpen={setIsMyProfileModalOpen} 
          setIsCreateChannelModalOpen={setIsCreateChannelModalOpen} 
          handleDeleteChannel={handleDeleteChannel} 
          setSelectedMemberDetail={setSelectedMemberDetail}
        />
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 h-full min-w-0 bg-white overflow-hidden relative pt-[67px]">
        {currentTab === 'chat' && (
          <ChatSection activeRoom={activeRoom} messages={messages} colleagues={colleagues} viewedReplyCounts={viewedReplyCounts} activeThreadMessageId={activeThreadMessageId} activeThreadMessage={activeThreadMessage} inputText={inputText} setInputText={setInputText} inputReplyText={inputReplyText} setInputReplyText={setInputReplyText} handleSendMessage={handleSendMessage} handleSendReply={handleSendReply} handleOpenThread={handleOpenThread} setActiveThreadMessageId={setActiveThreadMessageId} setSelectedMemberDetail={setSelectedMemberDetail}/>
        )}
        
        {currentTab === 'schedule' && (
          <ScheduleSection currentTab={currentTab} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} filteredSchedules={filteredSchedules} schedules={schedules} getRowBgClass={getRowBgClass} getCgBadgeStyle={getCgBadgeStyle} renderEditableCell={renderEditableCell} handleToggleEventStatus={handleToggleEventStatus} handleDeleteSchedule={handleDeleteSchedule} handleToggleCgItem={handleToggleCgItem} handleExcelUpload={handleExcelUpload} exportToExcel={exportToExcel} handleOpenModal={handleOpenModal}/>
        )}

        {/* 🎨 디자인 현황 (Supabase DB 전용) */}
        {currentTab === 'cgBoard' && (
          <DesignStatusSection 
            selectedMonth={selectedMonth} 
            setSelectedMonth={setSelectedMonth} 
            schedules={schedules} 
            filteredSchedules={filteredSchedules} 
            getRowBgClass={getRowBgClass} 
            handleToggleCgItem={handleToggleCgItem} 
          />
        )}
        
        {currentTab === 'calendar' && (
          <CalendarSection schedules={schedules} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} getRowBgClass={getRowBgClass} handleExcelUpload={handleExcelUpload} exportToExcel={exportToExcel} handleOpenModal={handleOpenModal} fetchSchedules={fetchSchedules} supabase={supabase}/>
        )}

        {currentTab === 'cueSheet' && (
          <CueSheetSection schedules={schedules} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear}/>
        )}

        {currentTab === 'cueSheetList' && (
          <CueSheetListSection />
        )}

        {currentTab === 'wendyStatus' && (
          <WendyDocSection docs={wendyDocs} currentUserInfo={{ name: myProfileData.name, role: myProfileData.role }} onSaveDoc={handleSaveDoc} onDeleteDoc={handleDeleteDoc} isWritingMode={isWritingDocMode} setIsWritingMode={setIsWritingDocMode}/>
        )}
      </div>

      {/* 방송 등록 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] w-[460px] h-[660px] shadow-2xl flex flex-col overflow-hidden text-left animate-fade-in font-['Paperlogy']">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900">방송 신규 등록</h3>
              <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer">✕</button>
            </div>
            <div className="flex border-b border-gray-100 text-[13px] font-medium text-gray-500 bg-gray-50/50 flex-shrink-0">
              <button type="button" onClick={() => setModalTab('basic')} className={`flex-1 py-3.5 text-center transition border-r border-gray-100 ${modalTab === 'basic' ? 'bg-white text-gray-900 font-bold border-b-2 border-b-transparent' : 'border-b border-gray-100 hover:bg-gray-100 cursor-pointer'}`}>1. 기본정보</button>
              <button type="button" onClick={() => setModalTab('tech')} className={`flex-1 py-3.5 text-center transition border-r border-gray-100 ${modalTab === 'tech' ? 'bg-white text-gray-900 font-bold border-b-2 border-b-transparent' : 'border-b border-gray-100 hover:bg-gray-100 cursor-pointer'}`}>2. 기술 스텝</button>
              <button type="button" onClick={() => setModalTab('etc')} className={`flex-1 py-3.5 text-center transition ${modalTab === 'etc' ? 'bg-white text-gray-900 font-bold border-b-2 border-b-transparent' : 'border-b border-gray-100 hover:bg-gray-100 cursor-pointer'}`}>3. 기타</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-gray-900 text-sm no-scrollbar">
              {modalTab === 'basic' && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">품목 (방송명)</label>
                    <input type="text" name="broadcast_title" required value={formData.broadcast_title} onChange={handleChange} placeholder="삼성 갤럭시 Z플립6" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">플랫폼</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { name: '네이버', color: 'blue', bg: 'bg-[#EBF3FC] border-[#D2E3FC]' },
                        { name: '핫잇슈', color: 'navy', bg: 'bg-[#EEF1FA] border-[#D9E2F8]' },
                        { name: '맘편한육아', color: 'yellow', bg: 'bg-[#FFF8E1] border-[#FDECB1]' },
                        { name: 'G마켓', color: 'green', bg: 'bg-[#EDF5EB] border-[#D5E9D0]' },
                        { name: '쿠팡', color: 'purple', bg: 'bg-[#F6EEFA] border-[#E8D6F2]' },
                        { name: '11번가', color: 'pink', bg: 'bg-[#FDF0F4] border-[#FAD6E2]' }
                      ].map((btn) => (
                        <button key={btn.name} type="button" onClick={() => setFormData(prev => ({ ...prev, platform: btn.name, row_color: btn.color }))} className={`h-11 border rounded-lg flex items-center justify-center text-[13px] transition cursor-pointer ${btn.bg} ${formData.platform === btn.name ? 'ring-[1.5px] ring-blue-500 font-bold border-transparent text-gray-900 shadow-xs' : 'text-gray-600 hover:opacity-80'}`}>
                          {btn.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">방송 날짜</label><input type="date" name="broadcast_date" value={formData.broadcast_date} onChange={handleChange} className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px]"/></div>
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">시작 시간</label><input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px]"/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">담당 PD</label><input type="text" name="pd_in_charge" value={formData.pd_in_charge} onChange={handleChange} placeholder="이형주" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">CG-WIP 담당</label><input type="text" name="cg" value={formData.cg} onChange={handleChange} placeholder="박승호" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                  </div>
                </div>
              )}
              {modalTab === 'tech' && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">TD</label><input type="text" name="td" value={formData.td} onChange={handleChange} placeholder="박승호" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">CUT</label><input type="text" name="cut" value={formData.cut} onChange={handleChange} placeholder="강정진" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">카메라 1</label><input type="text" name="camera_1" value={formData.camera_1} onChange={handleChange} placeholder="카메라 1" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">카메라 2</label><input type="text" name="camera_2" value={formData.camera_2} onChange={handleChange} placeholder="카메라 2" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                  </div>
                </div>
              )}
              {modalTab === 'etc' && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">스튜디오</label><input type="text" name="studio" value={formData.studio} onChange={handleChange} placeholder="A스튜디오" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                    <div><label className="block text-[13px] font-medium text-gray-700 mb-1.5">의뢰 주체</label><input type="text" name="client_name" value={formData.client_name} onChange={handleChange} placeholder="삼성전자" className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-[13px] placeholder:text-gray-400"/></div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center flex-shrink-0 gap-2.5">
              <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium bg-white text-gray-700 hover:bg-gray-100 transition cursor-pointer">취소</button>
              <button type="submit" onClick={handleSubmit} className="px-6 py-2.5 bg-[#1A73E8] hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition shadow-xs cursor-pointer">스케줄 DB 저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}