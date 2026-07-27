'use client';

import React, { useState, useRef } from 'react';

export type DocCategory = '제안' | '웬디 사무' | '전략 문서' | '방송 관련' | '기타 공유';

export const CATEGORIES: DocCategory[] = [
  '제안',
  '웬디 사무',
  '전략 문서',
  '방송 관련',
  '기타 공유'
];

export type WendyDoc = {
  id: string;
  title: string;
  author: string;
  category: DocCategory;
  content: string;
  imageUrl?: string;
  createdAt: string;
};

interface WendyDocSectionProps {
  docs: WendyDoc[];
  currentUserInfo: { name: string; role: string }; // 💡 로그인된 사용자 정보
  onSaveDoc: (docData: { id?: string; title: string; author: string; category: DocCategory; content: string; imageUrl: string }) => void;
  onDeleteDoc: (id: string) => void;
  isWritingMode: boolean;
  setIsWritingMode: (val: boolean) => void;
}

export default function WendyDocSection({
  docs,
  currentUserInfo,
  onSaveDoc,
  onDeleteDoc,
  isWritingMode,
  setIsWritingMode
}: WendyDocSectionProps) {
  
  const [activeDoc, setActiveScheduleDoc] = useState<WendyDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로그인된 작성자 기본 이름 생성 (예: "이형주 PD")
  const defaultAuthorName = currentUserInfo?.name 
    ? `${currentUserInfo.name} ${currentUserInfo.role || ''}`.trim()
    : '이형주 PD';

  const [formData, setFormData] = useState({
    title: '',
    author: defaultAuthorName,
    category: '방송 관련' as DocCategory,
    content: '',
    imageUrl: ''
  });

  // 카테고리별 + 버튼을 눌러 신규 글쓰기 진입
  const handleAddNewDocWithCategory = (category: DocCategory) => {
    setActiveScheduleDoc(null);
    setFormData({
      title: '',
      author: defaultAuthorName,
      category: category,
      content: '',
      imageUrl: ''
    });
    setIsWritingMode(true);
  };

  // 기존 문서 클릭 시
  const handleSelectDoc = (doc: WendyDoc) => {
    setActiveScheduleDoc(doc);
    setFormData({
      title: doc.title,
      author: doc.author || defaultAuthorName,
      category: doc.category || '기타 공유',
      content: doc.content,
      imageUrl: doc.imageUrl || ''
    });
    setIsWritingMode(true);
  };

  React.useEffect(() => {
    if (isWritingMode && !activeDoc && !formData.title) {
      setFormData(prev => ({
        ...prev,
        author: defaultAuthorName
      }));
    }
  }, [isWritingMode, activeDoc, defaultAuthorName]);

  const handleBackToList = () => {
    setActiveScheduleDoc(null);
    setIsWritingMode(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) return alert('문서 제목을 입력해 주세요.');

    onSaveDoc({
      id: activeDoc?.id,
      ...formData,
      author: formData.author || defaultAuthorName
    });

    handleBackToList();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const insertTextTemplate = (prefix: string, suffix: string = '') => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + `${prefix}${suffix}`
    }));
  };

  return (
    <div className="w-full h-full bg-[#F5F6F8] overflow-y-auto select-text font-['Paperlogy']">
      
      {/* ------------------ VIEW 1: 카테고리별 공유 문서 목록 ------------------ */}
      {!isWritingMode && (
        <div className="pt-[36px] px-[30px] pb-24 w-full flex flex-col items-stretch box-border bg-white min-h-full">
          
          <div className="flex justify-between items-center mb-4 h-6 select-none flex-shrink-0">
            <div className="text-black text-base font-medium flex items-center gap-2">
              📄 웬디미디어 공유 문서
            </div>
          </div>

          <div className="w-full h-14 px-7 mb-8 bg-[#F2F5FF] rounded-[10px] border border-indigo-100 flex justify-between items-center select-none flex-shrink-0">
            <div className="flex justify-start items-center gap-3.5">
              <div className="text-blue-600 text-xs font-medium">공지사항</div>
              <div className="text-neutral-700 text-xs font-medium">26년 2분기 쿠팡 선물 대잔치 공지</div>
            </div>
            <div className="px-3 py-1.5 bg-white rounded-md border border-neutral-200 flex justify-center items-center gap-2.5 cursor-pointer hover:bg-neutral-50 transition">
              <div className="text-neutral-700 text-[10px] font-medium">공지사항 바로가기</div>
            </div>
          </div>

          <div className="space-y-10 w-full">
            {CATEGORIES.map((cat) => {
              const catDocs = docs.filter(d => d.category === cat);

              return (
                <div key={cat} className="w-full">
                  <h3 className="text-sm font-bold text-neutral-800 mb-3.5 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
                    {cat}
                  </h3>

                  <div 
                    className="grid gap-[15px] w-full"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(154px, 1fr))' }}
                  >
                    {catDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDoc(doc)}
                        className="bg-white border border-neutral-200/90 rounded-[14px] p-4 h-[165px] flex flex-col justify-between hover:shadow-md hover:border-neutral-300 transition cursor-pointer group box-border overflow-hidden"
                      >
                        <div className="text-neutral-800 text-xs font-medium leading-snug line-clamp-3 group-hover:text-blue-600 transition">
                          {doc.title}
                        </div>

                        {doc.imageUrl && (
                          <div className="w-full h-10 bg-neutral-100 rounded-md overflow-hidden my-1 flex items-center justify-center flex-shrink-0">
                            <img src={doc.imageUrl} alt="thum" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="w-full text-right text-[10px] text-neutral-400 font-light select-none flex-shrink-0">
                          {doc.author || defaultAuthorName}
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={() => handleAddNewDocWithCategory(cat)}
                      className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-[18px] h-[165px] flex items-center justify-center transition cursor-pointer group box-border select-none hover:shadow-sm"
                    >
                      <svg
                        className="w-6 h-6 text-neutral-400 group-hover:text-neutral-600 transition"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ------------------ VIEW 2: 블로그 에디터 ------------------ */}
      {isWritingMode && (
        <div className="w-full min-h-full flex flex-col items-center pb-20 px-4 sm:px-8">
          
          <div className="sticky top-0 z-20 w-full bg-white border-b border-neutral-200 px-6 py-3 flex justify-between items-center shadow-sm rounded-b-xl">
            <div className="flex items-center gap-3 overflow-x-auto">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition cursor-pointer border border-neutral-300 flex-shrink-0"
              >
                ← 목록으로
              </button>

              <div className="h-5 w-[1px] bg-neutral-200 flex-shrink-0" />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as DocCategory })}
                className="h-8 px-3 border border-blue-500 rounded-lg text-xs font-bold text-blue-600 bg-blue-50/50 focus:outline-blue-500 cursor-pointer flex-shrink-0"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>📁 {c}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-neutral-50 hover:bg-blue-50 text-neutral-700 hover:text-blue-600 rounded-lg text-xs font-bold border border-neutral-200 flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
              >
                📷 사진 첨부
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button type="button" onClick={() => insertTextTemplate('\n[구분선]\n-------------------------\n')} className="px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded text-xs font-semibold border border-neutral-200 flex-shrink-0">
                ➖ 구분선
              </button>
              <button type="button" onClick={() => insertTextTemplate('\n💬 "중요 인용구 내용"\n')} className="px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded text-xs font-semibold border border-neutral-200 flex-shrink-0">
                💬 인용구
              </button>
              <button type="button" onClick={() => insertTextTemplate('\n📌 ')} className="px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded text-xs font-semibold border border-neutral-200 flex-shrink-0">
                📌 강조
              </button>
            </div>

            <div className="flex gap-2 flex-shrink-0 ml-2">
              {activeDoc && (
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteDoc) onDeleteDoc(activeDoc.id);
                    handleBackToList();
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 hover:bg-red-500 hover:text-white transition cursor-pointer"
                >
                  삭제
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2 bg-[#03C75A] hover:bg-[#02b350] text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                ✓ {activeDoc ? '수정 완료' : '글 발행하기'}
              </button>
            </div>
          </div>

          <div className="w-full max-w-full lg:max-w-[95%] xl:max-w-[1200px] bg-white border border-neutral-200 rounded-2xl shadow-sm mt-6 mb-12 p-6 md:p-10 min-h-[750px] flex flex-col justify-start transition-all">
            
            {/* 💡 작성자 수동 입력 대신 로그인 사용자 "이름 + 직군" 자동 표시 */}
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500">카테고리:</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DocCategory })}
                    className="h-8 px-2.5 border border-neutral-200 rounded-lg text-xs bg-neutral-50 font-bold text-neutral-800 focus:outline-blue-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500">작성자:</span>
                  <span className="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800">
                    👤 {formData.author || defaultAuthorName}
                  </span>
                </div>
              </div>

              <span className="text-xs text-neutral-400">
                {activeDoc ? `최종 수정: ${activeDoc.createdAt}` : `작성일: ${new Date().toISOString().slice(0, 10)}`}
              </span>
            </div>

            <textarea
              rows={1}
              required
              placeholder="제목을 입력하세요..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-2xl font-bold text-neutral-900 border-b border-neutral-200 pb-3 mb-6 focus:outline-none placeholder-neutral-300 resize-none leading-normal"
            />

            {formData.imageUrl && (
              <div className="w-full mb-6 relative group">
                <div className="w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center p-2">
                  <img src={formData.imageUrl} alt="blog-attached" className="max-h-[550px] w-full object-contain rounded-xl" />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xs transition cursor-pointer shadow-md"
                >
                  ✕
                </button>
              </div>
            )}

            <textarea
              rows={22}
              placeholder="네이버 블로그처럼 매뉴얼, 비상 연락망, 접속 정보, 안내 사항을 자유롭게 작성해 보세요..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full flex-1 text-sm text-neutral-800 focus:outline-none leading-relaxed font-normal placeholder-neutral-300 resize-none min-h-[450px]"
            />

          </div>

        </div>
      )}

    </div>
  );
}