'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CueSheetEditorSectionProps {
  onBack?: () => void;
  selectedSchedule?: any;
}

export function CueSheetEditorSection({ onBack, selectedSchedule }: CueSheetEditorSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const getCastNames = () => {
    if (!selectedSchedule) return '';
    const casts = [selectedSchedule.cast_1, selectedSchedule.cast_2, selectedSchedule.cast_3]
      .filter((c) => c && String(c).trim() !== '')
      .join(', ');
    return casts;
  };

  const [formData, setFormData] = useState({
    title: selectedSchedule?.broadcast_title ? `${selectedSchedule.broadcast_title} 론칭 할인 + 최대 혜택` : '',
    promotion: '',
    concept: '',
    target: '',
    preparation: '',
    rehearsal: '',
    buyingPoint: '',
    techCam: '',
    mainModel: '',
    launchBenefit: '',
    liveBenefit: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [sections, setSections] = useState([
    { id: 1, label: '오프닝', showBadge: true, badgeBg: 'bg-[#E2E2E2] text-neutral-800', time: '00:00', modelName: '', productName: '', color: '', imageUrl: '', detailRows: [] as any[], video: '메인 CAM 1', audio: 'BGM#1', memo: '' },
    { id: 2, label: '', showBadge: false, badgeBg: '', time: '00:05', modelName: '', productName: '', color: '', imageUrl: '', detailRows: [] as any[], video: '메인 CAM 1', audio: 'BGM#1', memo: '' },
    { id: 3, label: '반복', showBadge: true, badgeBg: 'bg-[#FFF2CC] text-[#7F6000]', time: '00:45', modelName: '', productName: '', color: '', imageUrl: '', detailRows: [] as any[], video: '메인 CAM 1', audio: 'BGM#1', memo: '' },
    { id: 4, label: '클로징', showBadge: true, badgeBg: 'bg-[#FFF2CC] text-[#7F6000]', time: '00:55', modelName: '', productName: '', color: '', imageUrl: '', detailRows: [] as any[], video: '메인 CAM 1', audio: 'BGM#1', memo: '' },
  ]);

  const [searchResults, setSearchResults] = useState<{ [key: number]: any[] }>({});
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);

  // 🚀 1. 진입 시 Supabase DB에서 이 방송의 기존 저장된 큐시트 불러오기
  useEffect(() => {
    const fetchSavedCueSheet = async () => {
      if (!selectedSchedule?.id) return;

      const { data, error } = await supabase
        .from('cue_sheets')
        .select('*')
        .eq('schedule_id', String(selectedSchedule.id))
        .single();

      if (data && !error) {
        setFormData({
          title: data.title || (selectedSchedule?.broadcast_title ? `${selectedSchedule.broadcast_title} 론칭 할인 + 최대 혜택` : ''),
          promotion: data.promotion || '',
          concept: data.concept || '',
          target: data.target || '',
          preparation: data.preparation || '',
          rehearsal: data.rehearsal || '',
          buyingPoint: data.buying_point || '',
          techCam: data.tech_cam || '',
          mainModel: data.main_model || '',
          launchBenefit: data.launch_benefit || '',
          liveBenefit: data.live_benefit || '',
        });

        if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
        }
      }
    };

    fetchSavedCueSheet();
  }, [selectedSchedule?.id]);

  // 🚀 2. Supabase DB에 큐시트 저장 (Upsert)
  const handleSaveCueSheet = async () => {
    if (!selectedSchedule?.id) {
      alert('방송 스케줄 정보가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        schedule_id: String(selectedSchedule.id),
        title: formData.title,
        promotion: formData.promotion,
        concept: formData.concept,
        target: formData.target,
        preparation: formData.preparation,
        rehearsal: formData.rehearsal,
        buying_point: formData.buyingPoint,
        tech_cam: formData.techCam,
        main_model: formData.mainModel,
        launch_benefit: formData.launchBenefit,
        live_benefit: formData.liveBenefit,
        sections: sections, // JSON 형태로 타임라인 전체 저장
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('cue_sheets')
        .upsert(payload, { onConflict: 'schedule_id' });

      if (error) {
        console.error('큐시트 저장 실패:', error);
        alert(`저장 실패: ${error.message}`);
      } else {
        alert('큐시트가 Supabase DB에 성공적으로 저장되었습니다!');
      }
    } catch (e: any) {
      console.error('저장 에러:', e);
      alert('큐시트 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 모델명(modelName) 변경 시 자동 검색
  useEffect(() => {
    const fetchAllProducts = async () => {
      for (let idx = 0; idx < sections.length; idx++) {
        const currentModel = sections[idx].modelName?.trim();

        if (!currentModel || currentModel.length < 2) {
          if (sections[idx].productName || sections[idx].detailRows.length > 0) {
            setSections((prev) => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], productName: '', color: '', imageUrl: '', detailRows: [] };
              return updated;
            });
          }
          continue;
        }

        const { data } = await supabase
          .from('products')
          .select('*')
          .ilike('model_name', `%${currentModel}%`)
          .limit(10);

        if (data && data.length > 0) {
          setSearchResults((prev) => ({ ...prev, [idx]: data }));

          const targetProd = data[0];
          let parsedRows: any[] = [];

          if (Array.isArray(targetProd.detail_rows)) {
            parsedRows = targetProd.detail_rows;
          } else if (typeof targetProd.detail_rows === 'string') {
            try {
              parsedRows = JSON.parse(targetProd.detail_rows);
            } catch (e) {
              parsedRows = [];
            }
          }

          setSections((prev) => {
            const updated = [...prev];
            if (
              updated[idx].productName !== (targetProd.product_name || '') ||
              updated[idx].detailRows.length !== parsedRows.length
            ) {
              updated[idx] = {
                ...updated[idx],
                productName: targetProd.product_name || '',
                color: targetProd.color || '',
                imageUrl: targetProd.image_url || `https://vvendynas.synology.me/web_images/${targetProd.model_name}.png`,
                detailRows: parsedRows,
              };
            }
            return updated;
          });
        } else {
          setSearchResults((prev) => ({ ...prev, [idx]: [] }));
        }
      }
    };

    const timer = setTimeout(() => {
      fetchAllProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [sections.map((s) => s.modelName).join(',')]);

  const handleModelNameChange = (index: number, newModelName: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        modelName: newModelName,
      };
      return updated;
    });

    if (newModelName.trim().length >= 2) {
      setActiveDropdownIndex(index);
    } else {
      setActiveDropdownIndex(null);
    }
  };

  const handleSelectProduct = (index: number, selectedProduct: any) => {
    let parsedRows: any[] = [];
    if (Array.isArray(selectedProduct.detail_rows)) {
      parsedRows = selectedProduct.detail_rows;
    } else if (typeof selectedProduct.detail_rows === 'string') {
      try {
        parsedRows = JSON.parse(selectedProduct.detail_rows);
      } catch (e) {
        parsedRows = [];
      }
    }

    setSections((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        modelName: selectedProduct.model_name,
        productName: selectedProduct.product_name || '',
        color: selectedProduct.color || '',
        imageUrl: selectedProduct.image_url || `https://vvendynas.synology.me/web_images/${selectedProduct.model_name}.png`,
        detailRows: parsedRows,
      };
      return updated;
    });

    setSearchResults((prev) => ({ ...prev, [index]: [] }));
    setActiveDropdownIndex(null);
  };

  const handleSectionFieldChange = (index: number, field: string, value: string) => {
    setSections((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const handleAddSection = () => {
    setSections((prev) => {
      const newSection = {
        id: Date.now(),
        label: '',
        showBadge: false,
        badgeBg: '',
        time: '00:00',
        modelName: '',
        productName: '',
        color: '',
        imageUrl: '',
        detailRows: [],
        video: '메인 CAM 1',
        audio: 'BGM#1',
        memo: '',
      };

      if (prev.length === 0) return [newSection];

      const repeatIndex = prev.findIndex((sec) => sec.label === '반복');
      const insertIndex = repeatIndex !== -1 ? repeatIndex : Math.max(0, prev.length - 2);

      const copy = [...prev];
      copy.splice(insertIndex, 0, newSection);
      return copy;
    });
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) {
      alert('최소 1개 이상의 타임라인 항목이 필요합니다.');
      return;
    }
    setSections((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-neutral-900 text-xs">
      {/* 1. 상단 타이틀 및 저장 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-neutral-900">큐시트 작성</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveCueSheet}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '💾 저장하기'}
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg font-bold hover:bg-neutral-50 transition cursor-pointer"
            >
              목록으로 돌아가기
            </button>
          )}
        </div>
      </div>

      {/* 2. 상단 메인 방송 개요 표 */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden mb-8 shadow-xs bg-white">
        <div className="bg-[#FAFAFA] border-b border-neutral-200 py-2.5 px-4 text-center">
          <input
            type="text"
            className="w-full text-center text-sm font-bold text-red-600 bg-transparent outline-none placeholder:text-neutral-400 font-sans"
            placeholder="입력해주세요"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        <div className="divide-y divide-neutral-200 text-center">
          <div className="grid grid-cols-6 items-center">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">방송일자 / DUR</div>
            <div className="py-3 text-neutral-700 border-r border-neutral-200">
              {selectedSchedule ? `${selectedSchedule.broadcast_date} ${selectedSchedule.start_time ? String(selectedSchedule.start_time).slice(0, 5) : '11:00'} / ${selectedSchedule.duration_minutes || 60}분` : '2026-07-20 11:00 / 60분'}
            </div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">PD</div>
            <div className="py-3 text-neutral-700 border-r border-neutral-200">{selectedSchedule?.pd_in_charge || '이승기'}</div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">출연자(SH)</div>
            <div className="py-3 text-neutral-700 font-medium px-2 truncate">
              {getCastNames() || <span className="text-neutral-400">입력해주세요</span>}
            </div>
          </div>

          <div className="grid grid-cols-6 items-center border-t border-neutral-200">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">장소</div>
            <div className="py-3 text-neutral-700 border-r border-neutral-200">{selectedSchedule?.studio ? `스튜디오 ${selectedSchedule.studio}` : '입력해주세요'}</div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">브랜드/상품</div>
            <div className="py-3 text-neutral-700 border-r border-neutral-200">{selectedSchedule?.client_name || '입력해주세요'}</div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">구성/프로모션</div>
            <div className="py-2 px-2">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.promotion}
                onChange={(e) => handleChange('promotion', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 bg-[#FAFAFA] font-semibold text-neutral-600 border-t border-neutral-200">
            <div className="py-2.5 border-r border-neutral-200">방송 컨셉 / 목적</div>
            <div className="py-2.5 border-r border-neutral-200">방송 컨셉 / 목적</div>
            <div className="py-2.5">방송 컨셉 / 목적</div>
          </div>

          <div className="grid grid-cols-6 items-center border-t border-neutral-200">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">타이틀/기획전 컨셉</div>
            <div className="py-2 px-2 border-r border-neutral-200">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.concept}
                onChange={(e) => handleChange('concept', e.target.value)}
              />
            </div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">타겟</div>
            <div className="py-2 px-2 border-r border-neutral-200">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.target}
                onChange={(e) => handleChange('target', e.target.value)}
              />
            </div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">사전준비/DP</div>
            <div className="py-2 px-2">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.preparation}
                onChange={(e) => handleChange('preparation', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-6 items-center border-t border-neutral-200">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">리허설</div>
            <div className="py-2 px-2 border-r border-neutral-200">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.rehearsal}
                onChange={(e) => handleChange('rehearsal', e.target.value)}
              />
            </div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">구매 포인트</div>
            <div className="py-2 px-2 border-r border-neutral-200">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.buyingPoint}
                onChange={(e) => handleChange('buyingPoint', e.target.value)}
              />
            </div>
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">기술/CAM</div>
            <div className="py-2 px-2">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.techCam}
                onChange={(e) => handleChange('techCam', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-6 items-center border-t border-neutral-200">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">라이브 메인 모델</div>
            <div className="col-span-5 py-2 px-4">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.mainModel}
                onChange={(e) => handleChange('mainModel', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-6 items-center border-t border-neutral-200">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">론칭 혜택</div>
            <div className="col-span-5 py-2 px-4">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.launchBenefit}
                onChange={(e) => handleChange('launchBenefit', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-6 items-center border-t border-neutral-200">
            <div className="bg-[#FAFAFA] py-3 font-semibold text-neutral-600 border-r border-neutral-200">라이브 혜택</div>
            <div className="col-span-5 py-2 px-4">
              <input
                type="text"
                className="w-full text-center text-neutral-700 outline-none placeholder:text-neutral-400 bg-transparent"
                placeholder="입력해주세요"
                value={formData.liveBenefit}
                onChange={(e) => handleChange('liveBenefit', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 하단 세부 타임라인 표 */}
      <div className="border border-neutral-200 rounded-lg overflow-visible shadow-xs bg-white mb-6">
        <div className="grid grid-cols-[160px_1fr_1fr_1.2fr] bg-[#FAFAFA] border-b border-neutral-200 font-bold text-neutral-700 text-center py-3">
          <div className="border-r border-neutral-200">구분/시간</div>
          <div className="border-r border-neutral-200">구성 내용 (대본)</div>
          <div className="border-r border-neutral-200">시연 및 혜택</div>
          <div>VIDEO / AUDIO / 비고</div>
        </div>

        <div className="divide-y divide-neutral-200">
          {sections.map((sec, idx) => {
            const scriptTexts = (sec.detailRows || [])
              .map((row) => row.text || row.content || '')
              .filter((t) => t && String(t).trim() !== '')
              .join('\n\n');

            const detailImages = (sec.detailRows || [])
              .map((r) => r.image || r.imageUrl || r.img)
              .filter((img) => img && String(img).trim() !== '');

            const hasMainImage = sec.imageUrl && String(sec.imageUrl).trim() !== '';

            return (
              <div
                key={sec.id}
                className={`grid grid-cols-[160px_1fr_1fr_1.2fr] min-h-[180px] relative group ${
                  activeDropdownIndex === idx ? 'z-50' : 'z-10'
                }`}
              >
                <div className="p-4 flex flex-col items-center justify-center border-r border-neutral-200 bg-[#FAFAFA]/30 relative overflow-visible">
                  <button
                    onClick={() => handleRemoveSection(idx)}
                    className="absolute top-2 left-2 text-neutral-300 hover:text-red-500 font-bold text-xs transition cursor-pointer"
                    title="항목 삭제"
                  >
                    ✕
                  </button>

                  {sec.productName && (
                    <span className="mb-2 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 font-bold rounded text-[10px] text-center max-w-[130px] truncate shadow-2xs">
                      {sec.productName} {sec.color ? `(${sec.color})` : ''}
                    </span>
                  )}

                  {sec.showBadge && (
                    <div className={`px-3 py-1 font-bold rounded text-xs mb-2 ${sec.badgeBg}`}>
                      {sec.label}
                    </div>
                  )}

                  <input
                    type="text"
                    value={sec.time}
                    onChange={(e) => handleSectionFieldChange(idx, 'time', e.target.value)}
                    className="w-20 text-center font-mono font-bold text-sm text-neutral-800 bg-transparent outline-none focus:bg-white focus:border focus:border-neutral-300 rounded"
                  />

                  {sec.label !== '오프닝' && (
                    <div className="relative mt-2.5 w-28">
                      <input
                        type="text"
                        placeholder="모델명 입력"
                        value={sec.modelName}
                        onFocus={() => {
                          if (searchResults[idx] && searchResults[idx].length > 0) {
                            setActiveDropdownIndex(idx);
                          }
                        }}
                        onChange={(e) => handleModelNameChange(idx, e.target.value)}
                        className="w-full text-center border border-neutral-200 rounded px-2 py-1 text-[11px] outline-none focus:border-blue-500 bg-white shadow-2xs font-mono font-medium text-neutral-700"
                      />

                      {activeDropdownIndex === idx &&
                        searchResults[idx] &&
                        searchResults[idx].length > 1 && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-60 bg-white border border-blue-400 rounded-lg shadow-2xl z-[9999] overflow-hidden max-h-56 overflow-y-auto">
                            <div className="px-3 py-1.5 bg-blue-50 text-[10px] font-bold text-blue-600 border-b border-blue-100 flex justify-between items-center">
                              <span>세부 옵션 선택</span>
                              <span className="bg-blue-200/80 text-blue-800 px-1.5 py-0.2 rounded font-mono text-[9px]">{searchResults[idx].length}건</span>
                            </div>
                            {searchResults[idx].map((prod, pIdx) => (
                              <button
                                key={pIdx}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectProduct(idx, prod);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50/80 border-b border-neutral-100 last:border-b-0 transition flex flex-col gap-0.5 cursor-pointer bg-white"
                              >
                                <span className="font-mono font-bold text-blue-700 text-[11px]">
                                  {prod.model_name}
                                </span>
                                <div className="text-[10px] text-neutral-600 font-medium truncate flex items-center gap-1.5">
                                  <span>{prod.product_name || '제품명 미지정'}</span>
                                  {prod.color && (
                                    <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded text-[9px]">
                                      {prod.color}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-r border-neutral-200 flex flex-col justify-center items-center">
                  {scriptTexts ? (
                    <div className="w-full text-center text-neutral-800 whitespace-pre-wrap leading-relaxed font-medium text-[12px]">
                      {scriptTexts}
                    </div>
                  ) : (
                    <span className="text-neutral-400 font-normal">구성 내용 (대본)</span>
                  )}
                </div>

                <div className="p-4 border-r border-neutral-200 flex items-center justify-center">
                  {(hasMainImage || detailImages.length > 0) ? (
                    <div className="flex flex-col gap-3 justify-center items-center w-full max-w-[280px] mx-auto py-2">
                      {hasMainImage && (
                        <div className="w-full border border-neutral-200 rounded-lg p-2 bg-white shadow-2xs overflow-hidden">
                          <img
                            src={sec.imageUrl}
                            alt="제품 대표 이미지"
                            className="w-full h-auto object-contain rounded"
                            onError={(e: any) => {
                              e.currentTarget.parentElement.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {detailImages.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="w-full border border-neutral-200 rounded-lg p-2 bg-white shadow-2xs overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`상세 등록 이미지 ${imgIdx + 1}`}
                            className="w-full h-auto object-contain rounded"
                            onError={(e: any) => {
                              e.currentTarget.parentElement.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-400 font-normal">시연 및 혜택</span>
                  )}
                </div>

                <div className="p-4 space-y-2 bg-neutral-50/30 flex flex-col justify-center">
                  <div>
                    <label className="text-[10px] text-neutral-500 font-semibold block mb-0.5">VIDEO</label>
                    <input
                      type="text"
                      value={sec.video}
                      onChange={(e) => handleSectionFieldChange(idx, 'video', e.target.value)}
                      className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 font-semibold block mb-0.5">AUDIO</label>
                    <input
                      type="text"
                      value={sec.audio}
                      onChange={(e) => handleSectionFieldChange(idx, 'audio', e.target.value)}
                      className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 font-semibold block mb-0.5">비고</label>
                    <input
                      type="text"
                      placeholder="비고"
                      value={sec.memo}
                      onChange={(e) => handleSectionFieldChange(idx, 'memo', e.target.value)}
                      className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleAddSection}
          className="w-full py-3 bg-[#FAFAFA] text-neutral-600 border-t border-neutral-200 text-[12px] font-bold hover:bg-neutral-100 transition cursor-pointer flex items-center justify-center gap-1"
        >
          <span className="text-base leading-none">+</span> 내용 추가
        </button>
      </div>
    </div>
  );
}