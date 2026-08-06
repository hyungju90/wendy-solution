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
import { CueSheetEditorSection } from './CueSheetEditorSection';
import DesignStatusSection from './DesignStatusSection';
import AddScheduleModal from './AddScheduleModal';
import WendyDocSection, { type WendyDoc, type DocCategory } from './WendyDocSection';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MainChatPage() {
  type TabType = 'chat' | 'schedule' | 'calendar' | 'cgBoard' | 'wendyStatus' | 'cueSheet' | 'cueSheetList' | 'cueSheetEditor';
  
  const [currentTab, setCurrentTabState] = useState<TabType>('schedule');
  const [selectedCueSheetSchedule, setSelectedCueSheetSchedule] = useState<any>(null);

  // 🚀 선택 연도 / 월 상태 (오늘 시점 기준 자동 초기화)
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);

  // 🚀 웬디 현황 (공유 문서) DB 데이터 수용 상태
  const [wendyDocs, setWendyDocs] = useState<WendyDoc[]>([]);
  const [isWritingDocMode, setIsWritingDocMode] = useState<boolean>(false);

  // 🚀 탭 변경 함수 (스케줄 관련 탭 클릭 시 무조건 현재 시간/월 기준 자동 이동)
  const setCurrentTab = (tab: TabType) => {
    // 1. 웬디 현황 탭 이동 시 글 작성 모드 종료
    if (tab === 'wendyStatus') {
      setIsWritingDocMode(false);
    }

    // 2. 방송 일정 및 제작 탭 클릭 시 항상 '오늘 날짜'의 연도/월로 자동 세팅
    if (tab === 'schedule' || tab === 'calendar' || tab === 'cueSheet' || tab === 'cgBoard') {
      const today = new Date();
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth() + 1);
    }

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
      
      const validTabs: TabType[] = ['chat', 'schedule', 'calendar', 'cgBoard', 'wendyStatus', 'cueSheet', 'cueSheetList', 'cueSheetEditor'];
      
      if (paramTab && validTabs.includes(paramTab as TabType)) {
        setCurrentTabState(paramTab as TabType);
      } else {
        // 저장된 탭이 없거나 기본 접근시 무조건 '편성표(schedule)'로 고정
        setCurrentTabState('schedule');
      }
    }
  }, []);

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

  const initialFormData = {
    broadcast_date: '2026-07-20', start_time: '11:00', end_time: '12:00', duration_minutes: 60,
    platform: '네이버', client_name: '', broadcast_title: '', studio: '', row_color: 'blue',
    cast_1: '', cast_2: '', cast_3: '', pd_in_charge: '', td: '', cut: '', cg: '', vmd: '',
    camera_1: '', camera_2: '', camera_count: 0, camera_request: '', equipment_rental: '',
    manager: '', gift_payout: '', writer: '', food: '', ad_inflow: '', short_clip: '', purchase_auth: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  // 🚀 Supabase 스케줄 조회
  // 🚀 Supabase 스케줄 조회
  // 🚀 Supabase 스케줄 조회 (정렬 기준 3단계 락 적용)
  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_schedules')
        .select('*')
        .order('broadcast_date', { ascending: true }) // 1순위: 날짜 순
        .order('start_time', { ascending: true })     // 2순위: 시작 시간 순
        .order('id', { ascending: true });            // 3순위: 그래도 똑같으면 고유 ID(생성순)로 고정!

      if (!error && data) {
        setSchedules(data);
      }
    } catch (e) {
      console.error('스케줄 DB 조회 오류:', e);
    }
  };

  // 🚀 Supabase 웬디 현황(공유 문서) 조회
  const fetchWendyDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('wendy_docs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedDocs = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          author: d.author,
          category: d.category,
          content: d.content,
          imageUrl: d.image_url,
          createdAt: new Date(d.created_at).toISOString().slice(0, 10),
        }));
        setWendyDocs(formattedDocs);
      }
    } catch (e) {
      console.error('문서 DB 조회 오류:', e);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchChatMessages();
    fetchCompanyMembers();
    fetchWendyDocs();

    const interval = setInterval(() => { 
      fetchSchedules(); 
      fetchChatMessages(); 
      fetchWendyDocs();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  const handleCellDoubleClick = (id: string, field: string, value: any) => { 
    setEditingCell({ id, field }); 
    setEditValue(value ?? ''); 
  };

  const handleCellSave = async (id: string, field: string) => {
    let targetValue: any = editValue;
    if (field === 'duration_minutes' || field === 'camera_count') targetValue = Number(editValue);
    const updatePayload: any = { [field]: targetValue };
    
    await supabase.from('broadcast_schedules').update(updatePayload).eq('id', id);
    fetchSchedules();
    setEditingCell(null);
  };

  const baseTextClassName = "text-xs font-normal text-[#332211] tracking-normal text-center font-['Paperlogy']";
  
  // 📌 [수정 포인트] 셀 렌더링 함수 - 날짜를 'X월 Y일' 형태로 다듬어 출력
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
    } else if (field === 'broadcast_date' && typeof value === 'string' && value) {
      // 🚀 '2026-07-01' 또는 '07-01'을 '7월 1일' 형태로 다듬어줍니다.
      const parts = value.split('-');
      if (parts.length >= 2) {
        const month = parseInt(parts[parts.length - 2], 10);
        const day = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(month) && !isNaN(day)) {
          displayValue = `${month}월 ${day}일`;
        }
      }
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

  // 🚀 Supabase 웬디 현황 문서 저장 (Insert / Update)
  const handleSaveDoc = async (docData: { id?: string; title: string; author: string; category: DocCategory; content: string; imageUrl: string }) => {
    if (docData.id) {
      await supabase.from('wendy_docs').update({
        title: docData.title,
        author: docData.author,
        category: docData.category,
        content: docData.content,
        image_url: docData.imageUrl,
      }).eq('id', docData.id);
    } else {
      await supabase.from('wendy_docs').insert([{
        title: docData.title,
        author: docData.author,
        category: docData.category,
        content: docData.content,
        image_url: docData.imageUrl,
      }]);
    }
    fetchWendyDocs();
  };

  // 🚀 Supabase 웬디 현황 문서 삭제 (Delete)
  const handleDeleteDoc = async (id: string) => {
    if (confirm('이 문서를 정말 삭제하시겠습니까?')) {
      await supabase.from('wendy_docs').delete().eq('id', id);
      fetchWendyDocs();
    }
  };

  const activeThreadMessage = (messages || []).find(m => m.id === activeThreadMessageId) || null;

  const filteredSchedules = (schedules || []).filter((item: any) => {
    if (!item?.broadcast_date) return false;
    const parts = String(item.broadcast_date).split('-'); 
    if (parts.length < 2) return false;
    const itemYear = Number(parts[0]);
    const itemMonth = Number(parts[1]);
    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  // 🚀 방송명 / 플랫폼 / 의뢰주체 정밀 색상 판별 함수
  const getRowBgClass = (rowOrColorKey: any) => {
    if (!rowOrColorKey) return 'bg-[#E2EEF9] text-[#113a6b] border-blue-200 font-bold';

    let platform = '';
    let client = '';
    let title = '';

    if (typeof rowOrColorKey === 'object') {
      platform = String(rowOrColorKey.platform || '').toLowerCase();
      client = String(rowOrColorKey.client_name || rowOrColorKey.client || '').toLowerCase();
      title = String(rowOrColorKey.broadcast_title || '').toLowerCase();
    } else {
      title = String(rowOrColorKey).toLowerCase();
    }

    const fullText = `${platform} ${client} ${title}`;

    // 1. 맘편한육아 ➔ 노란색 (Yellow)
    if (fullText.includes('맘편한') || fullText.includes('맘육')) {
      return 'bg-[#FFF5CE] text-[#634f05] border-amber-300 font-bold';
    }

    // 2. G마켓 / 지마켓 ➔ 연두/초록색 (Green)
    if (fullText.includes('g마켓') || fullText.includes('지마켓')) {
      return 'bg-[#E2F0D9] text-[#244b11] border-emerald-300 font-bold';
    }

    // 3. 핫IT슈 / 핫잇슈 ➔ 네이비/인디고 (Navy)
    if (fullText.includes('핫it슈') || fullText.includes('핫잇슈')) {
      return 'bg-[#D9E1F2] text-[#1f3864] border-indigo-200 font-bold';
    }

    // 4. 틱톡 ➔ 연보라색 (Purple)
    if (fullText.includes('틱톡') || fullText.includes('tiktok')) {
      return 'bg-[#F2E6FF] text-[#4a157d] border-purple-300 font-bold';
    }

    // 5. 11번가 / 쿠팡 ➔ 분홍색 (Pink)
    if (fullText.includes('11번가') || fullText.includes('쿠팡')) {
      return 'bg-[#FFF0F5] text-[#78184a] border-pink-300 font-bold';
    }

    // 6. 기본 (네이버 등) ➔ 파란색 (Blue)
    return 'bg-[#E2EEF9] text-[#113a6b] border-blue-200 font-bold';
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

    // 🚀 A열(날짜)부터 AC열(숏클립)까지 전체 헤더 설정
    const headers = [
      '날짜', '시작 시간', '종료 시간', 'DUR(분)', '플랫폼', '의뢰 주체', '품목',
      '스튜디오', '출연자(삼성)', '출연자', '출연자(외부)', '담당PD', '서포트', 'TD',
      'CUT', 'CG - WIP', '구매인증', 'VMD', '카메라 1', '카메라 2', '카메라 대수',
      '카메라 요청', '장비 대여', '담당자', '경품 지급', '작가', '푸드', '유입광고', '숏클립'
    ];

    // 🚀 각 행별 데이터 매핑 (숏클립 포함 29개 컬럼)
    const rowsData = filteredSchedules.map((row) => [
      row.broadcast_date || '',
      row.start_time ? String(row.start_time).slice(0, 5) : '',
      row.end_time ? String(row.end_time).slice(0, 5) : '',
      row.duration_minutes || 0,
      row.platform || '',
      row.client_name || '',
      row.broadcast_title || '',
      row.studio || '',
      row.cast_1 || '',
      row.cast_2 || '',
      row.cast_3 || '',
      row.pd_in_charge || '',
      row.manager || '',
      row.td || '',
      row.cut || '',
      row.cg || '',
      row.purchase_auth || '',
      row.vmd || '',
      row.camera_1 || '',
      row.camera_2 || '',
      row.camera_count || 0,
      row.camera_request || '',
      row.equipment_rental || '',
      row.manager || '',
      row.gift_payout || '',
      row.writer || '',
      row.food || '',
      row.ad_inflow || '',
      row.short_clip || ''
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
                const isActive = currentTab === item.id || (item.id === 'cueSheet' && currentTab === 'cueSheetEditor');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentTab(item.id as TabType)}
                    className={`self-stretch h-7 px-2.5 rounded-[5px] inline-flex justify-start items-center gap-2.5 transition cursor-pointer ${
                      isActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-[2px] flex-shrink-0 transition-colors ${
                      isActive ? 'bg-violet-500 shadow-xs' : 'bg-zinc-300'
                    }`} />
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
          <CueSheetSection 
            schedules={schedules} 
            selectedMonth={selectedMonth} 
            setSelectedMonth={setSelectedMonth} 
            selectedYear={selectedYear}
            getRowBgClass={getRowBgClass}
            onNavigate={(schedule) => {
              setSelectedCueSheetSchedule(schedule);
              setCurrentTab('cueSheetEditor');
            }}
          />
        )}

        {currentTab === 'cueSheetEditor' && (
          <CueSheetEditorSection 
            selectedSchedule={selectedCueSheetSchedule}
            onBack={() => setCurrentTab('cueSheet')} 
          />
        )}

        {currentTab === 'cueSheetList' && (
          <CueSheetListSection />
        )}

        {currentTab === 'wendyStatus' && (
          <WendyDocSection docs={wendyDocs} currentUserInfo={{ name: myProfileData.name, role: myProfileData.role }} onSaveDoc={handleSaveDoc} onDeleteDoc={handleDeleteDoc} isWritingMode={isWritingDocMode} setIsWritingMode={setIsWritingDocMode}/>
        )}
      </div>

      {/* 🚀 방송 스케줄 등록 모달 (데이터 정제 및 예외 처리 보완) */}
      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (scheduleData) => {
          const cleanedData = { ...scheduleData };
          if (!cleanedData.id) delete cleanedData.id;
          cleanedData.duration_minutes = Number(cleanedData.duration_minutes) || 60;
          cleanedData.camera_count = Number(cleanedData.camera_count) || 0;

          const { error } = await supabase.from('broadcast_schedules').insert([cleanedData]);
          if (error) {
            console.error('스케줄 저장 실패:', error);
            alert(`저장에 실패했습니다: ${error.message || '입력 데이터를 확인해 주세요.'}`);
          } else {
            fetchSchedules();
            setIsModalOpen(false);
            alert('방송 스케줄이 성공적으로 등록되었습니다!');
          }
        }}
      />
    </div>
  );
}