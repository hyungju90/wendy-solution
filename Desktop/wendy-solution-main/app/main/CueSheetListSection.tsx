'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ProductEditSection } from './ProductEditSection';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const NAS_BASE_URL = 'https://vvendynas.synology.me/web_images/';

// 🚀 우선 정렬 기준 카테고리 순서 정의
const CATEGORY_ORDER = [
  '냉장고',
  '김치냉장고',
  '의류케어',
  '에어케어',
  '조리기기',
  'TV',
  'AV',
  'PC',
  '모니터',
  '청소기',
  '정수기',
];

// 🚀 DB에 저장된 기존 URL이든 모델명이든 상관없이 /를 완벽히 제거하여 정제된 NAS 이미지 URL 생성
const getNasImageUrl = (modelName: string, rawImageUrl?: string) => {
  if (rawImageUrl && rawImageUrl.trim() !== '') {
    if (rawImageUrl.includes('/web_images/')) {
      const parts = rawImageUrl.split('/web_images/');
      const fileName = parts[1];
      if (fileName) {
        const cleanFileName = fileName.replace(/\//g, '');
        return `${NAS_BASE_URL}${cleanFileName}`;
      }
    }
    return rawImageUrl;
  }

  if (!modelName) return '';
  const sanitizedModel = modelName.trim().replace(/\//g, '');
  return `${NAS_BASE_URL}${sanitizedModel}.png`;
};

// 🚀 텍스트 길이에 맞춰 높이가 자동으로 늘어나는 Textarea
const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder = '내용 입력',
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={2}
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed ${className}`}
    />
  );
};

export default function CueSheetListSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // 🚀 펼쳐진 제품 ID 및 해당 제품의 통합 인라인 데이터 상태
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [editingProductData, setEditingProductData] = useState<any | null>(null);
  const [isSavingInline, setIsSavingInline] = useState(false);

  // 🚀 품목 (카테고리) 옵션 상태
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    ...CATEGORY_ORDER,
    '가전 다품목1 (무시료)',
    '가전 다품목2',
    '삼성 가전다품목',
    '갤럭시 다품목1(폰제외)',
    '갤럭시 다품목2',
    '갤럭시 다품목3',
    '삼성 갤럭시',
  ]);

  // DB에서 추가로 등록된 품목 목록이 있으면 로드
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('products').select('category');
      if (data && data.length > 0) {
        const categories = Array.from(
          new Set(data.map((item) => item.category).filter((c) => c && c.trim() !== ''))
        ) as string[];

        if (categories.length > 0) {
          setCategoryOptions((prev) => Array.from(new Set([...prev, ...categories])));
        }
      }
    };
    fetchCategories();
  }, []);

  const fetchProductsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (data) {
        const formattedData = data.map((p: any) => {
          let parsedDetailRows = p.detail_rows || p.detailRows || [];
          if (typeof parsedDetailRows === 'string') {
            try {
              parsedDetailRows = JSON.parse(parsedDetailRows);
            } catch (e) {
              parsedDetailRows = [];
            }
          }

          return {
            id: p.id,
            category: p.category || '',
            modelName: p.model_name || '',
            productName: p.product_name || '',
            color: p.color || '',
            imageUrl: getNasImageUrl(p.model_name, p.image_url),
            detailRows: parsedDetailRows,
          };
        });
        setProducts(formattedData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromSupabase();
  }, []);

  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = window.confirm('정말 이 제품을 DB에서 삭제하시겠습니까?');
    if (confirmDelete) {
      await supabase.from('products').delete().eq('id', productId);
      fetchProductsFromSupabase();
    }
  };

  // 🚀 제품 펼치기 / 접기 및 전체 편집 데이터 초기화
  const toggleExpand = (id: number) => {
    if (expandedProductId === id) {
      setExpandedProductId(null);
      setEditingProductData(null);
    } else {
      setExpandedProductId(id);
      const targetProd = products.find((p) => p.id === id);
      if (targetProd) {
        let rows = targetProd.detailRows || [];
        if (!Array.isArray(rows) || rows.length === 0) {
          rows = [{ id: Date.now(), text: '', image: null }];
        }
        setEditingProductData({
          ...targetProd,
          detailRows: JSON.parse(JSON.stringify(rows)),
        });
      }
    }
  };

  // 🚀 인라인 기본정보 필드 수정 핸들러
  const handleEditingFieldChange = (field: string, value: string) => {
    setEditingProductData((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === 'modelName') {
        updated.imageUrl = getNasImageUrl(value);
      }
      return updated;
    });
  };

  // 🚀 인라인 세부 내용(Detail Rows) 핸들러
  const handleAddRowInline = () => {
    setEditingProductData((prev: any) => ({
      ...prev,
      detailRows: [...(prev?.detailRows || []), { id: Date.now(), text: '', image: null }],
    }));
  };

  const handleRemoveRowInline = (index: number) => {
    setEditingProductData((prev: any) => ({
      ...prev,
      detailRows: prev.detailRows.filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleImageUploadInline = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProductData((prev: any) => {
          const updatedRows = [...prev.detailRows];
          updatedRows[index] = { ...updatedRows[index], image: reader.result };
          return { ...prev, detailRows: updatedRows };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImageInline = (index: number) => {
    setEditingProductData((prev: any) => {
      const updatedRows = [...prev.detailRows];
      updatedRows[index] = { ...updatedRows[index], image: null };
      return { ...prev, detailRows: updatedRows };
    });
  };

  const handleTextChangeInline = (index: number, text: string) => {
    setEditingProductData((prev: any) => {
      const updatedRows = [...prev.detailRows];
      updatedRows[index] = { ...updatedRows[index], text };
      return { ...prev, detailRows: updatedRows };
    });
  };

  // 🚀 펼쳐진 상태에서 제품명, 모델명, 색상, 품목, 세부내용을 한꺼번에 Supabase DB에 저장
  const handleSaveInlineAll = async () => {
    if (!editingProductData || !editingProductData.id) return;

    if (!editingProductData.modelName || !editingProductData.modelName.trim()) {
      alert('모델명은 필수 입력 사항입니다.');
      return;
    }

    setIsSavingInline(true);
    try {
      const cleanImageUrl = getNasImageUrl(editingProductData.modelName, editingProductData.imageUrl);

      const payload = {
        category: editingProductData.category || '',
        model_name: editingProductData.modelName.trim(),
        product_name: editingProductData.productName || '',
        color: editingProductData.color || '',
        image_url: cleanImageUrl,
        detail_rows: editingProductData.detailRows,
      };

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProductData.id);

      if (error) {
        alert('저장 실패: ' + error.message);
      } else {
        alert('제품 정보 및 세부 내용이 DB에 성공적으로 저장되었습니다! 💾');
        fetchProductsFromSupabase();
      }
    } catch (e: any) {
      alert('오류 발생: ' + e.message);
    } finally {
      setIsSavingInline(false);
    }
  };

  // ✅ 제품 신규 작성 페이지 모드
  if (editProduct) {
    return (
      <ProductEditSection 
        initialProduct={editProduct} 
        onCancel={() => setEditProduct(null)} 
        onSaveSuccess={() => {
          setEditProduct(null);
          fetchProductsFromSupabase();
        }}
      />
    );
  }

  // ✅ 검색어 필터링
  const term = (searchTerm || '').toLowerCase();
  const filteredProducts = products.filter((p) => {
    return (p.category?.toLowerCase() || '').includes(term) || 
           (p.modelName?.toLowerCase() || '').includes(term) || 
           (p.productName?.toLowerCase() || '').includes(term) ||
           (p.color?.toLowerCase() || '').includes(term);
  });

  // 🚀 지정하신 카테고리 우선순위 정렬 (냉장고 > 김치냉장고 > 의류케어 > 에어케어 > 조리기기 > TV > AV > PC > 모니터 > 청소기 > 정수기 순)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const catA = (a.category || '').trim();
    const catB = (b.category || '').trim();

    const indexA = CATEGORY_ORDER.indexOf(catA);
    const indexB = CATEGORY_ORDER.indexOf(catB);

    const rankA = indexA !== -1 ? indexA : 999;
    const rankB = indexB !== -1 ? indexB : 999;

    if (rankA !== rankB) {
      return rankA - rankB; // 지정된 순서대로 정렬
    }

    // 동일 카테고리 내에서는 ID 내림차순(최신순)
    return b.id - a.id;
  });

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-xs select-text">
      {/* 1. 표준 타이틀 영역 */}
      <div className="flex justify-between items-center mb-5 h-9 flex-shrink-0">
        <h1 className="text-xl font-medium text-neutral-900">제품 리스트</h1>
        <button 
          onClick={() => setEditProduct({ isNew: true })} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
        >
          + 추가
        </button>
      </div>

      {/* 2. 표준 공지사항 바 */}
      <div className="w-full h-14 px-6 mb-6 bg-blue-50/60 border border-blue-100 rounded-xl flex justify-between items-center flex-shrink-0">
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

      {/* 3. 검색창 */}
      <div className="mb-6 relative max-w-md flex items-center">
        <input 
          type="text" 
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-200 rounded-lg outline-none focus:border-blue-500 text-xs shadow-xs placeholder:text-neutral-400" 
          placeholder="제품명, 모델명 또는 품목 검색..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 w-4 h-4 rounded-full bg-neutral-300 hover:bg-neutral-400 text-white flex items-center justify-center text-[10px] font-bold transition cursor-pointer"
            title="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      {/* 4. 제품 목록 테이블 (지정 순서 정렬 적용) */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs bg-white mb-36">
        <div className="grid grid-cols-6 bg-neutral-50/80 border-b border-neutral-200 py-3.5 px-6 text-xs font-bold text-neutral-500 text-center">
          <div>품목</div>
          <div>모델명</div>
          <div>제품명</div>
          <div>색상</div>
          <div>이미지</div>
          <div>관리</div>
        </div>

        {sortedProducts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {sortedProducts.map((product) => {
              const isExpanded = expandedProductId === product.id;

              return (
                <React.Fragment key={product.id}>
                  {/* 기본 제품 행 */}
                  <div 
                    onClick={() => toggleExpand(product.id)}
                    className={`grid grid-cols-6 py-3 px-6 text-xs text-center items-center transition cursor-pointer select-text ${
                      isExpanded ? 'bg-blue-50/60 border-b border-blue-100' : 'hover:bg-blue-50/30'
                    }`}
                  >
                    {/* 1. 품목 */}
                    <div className="font-semibold text-neutral-600 flex items-center justify-center gap-1.5 select-text">
                      <span className={`text-[10px] text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-600' : ''}`}>
                        ▶
                      </span>
                      {product.category || '-'}
                    </div>

                    {/* 2. 모델명 */}
                    <div className="font-medium text-neutral-800 break-all px-2 leading-tight font-mono select-text">
                      {product.modelName}
                    </div>

                    {/* 3. 제품명 */}
                    <div className="text-neutral-600 break-keep whitespace-normal px-2 leading-tight select-text">
                      {product.productName || '-'}
                    </div>

                    {/* 4. 색상 */}
                    <div className="text-neutral-600 break-keep whitespace-normal px-2 leading-tight select-text flex items-center justify-center">
                      {product.color ? product.color : <span className="text-neutral-300">-</span>}
                    </div>

                    {/* 5. 이미지 */}
                    <div className="flex justify-center">
                      <div className="w-16 h-12 bg-white rounded border border-neutral-200 p-1 flex items-center justify-center">
                        <img 
                          src={product.imageUrl} 
                          className="max-h-full max-w-full object-contain" 
                          onError={(e: any) => e.currentTarget.style.display = 'none'} 
                        />
                      </div>
                    </div>

                    {/* 6. 관리 버튼 */}
                    <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setEditProduct(product)} 
                        className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition cursor-pointer"
                      >
                        작성
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        className="px-3 py-1.5 bg-white border border-red-200 text-red-500 font-bold rounded-lg text-xs hover:bg-red-50 transition cursor-pointer"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 인라인 편집 상자 */}
                  {isExpanded && editingProductData && editingProductData.id === product.id && (
                    <div className="bg-[#FAFAFA] border-b border-neutral-200 p-6 animate-in fade-in slide-in-from-top-2 duration-200 select-text">
                      <div className="max-w-4xl mx-auto border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col gap-6 p-6">
                        
                        {/* 헤더 및 전체 저장 버튼 */}
                        <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                          <span className="font-bold text-neutral-800 text-[13px] flex items-center gap-2">
                            📌 제품 정보 및 세부 내용 수정 ({editingProductData.modelName || '미지정'})
                          </span>
                          <button
                            onClick={handleSaveInlineAll}
                            disabled={isSavingInline}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isSavingInline ? '저장 중...' : '저장'}
                          </button>
                        </div>

                        {/* 1. 기본 정보 편집 카드 */}
                        <div className="grid grid-cols-[1fr_220px] gap-6 bg-neutral-50/70 p-4 rounded-xl border border-neutral-200">
                          <div className="grid grid-cols-2 gap-4">
                            {/* 모델명 */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-neutral-600">모델명</label>
                              <input
                                type="text"
                                value={editingProductData.modelName}
                                onChange={(e) => handleEditingFieldChange('modelName', e.target.value)}
                                placeholder="예: HW-Q990F/KR"
                                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 outline-none focus:border-blue-500 bg-white"
                              />
                            </div>

                            {/* 품목 (카테고리) - 드롭다운 셀렉트 */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-neutral-600">품목 (카테고리)</label>
                              <select
                                value={editingProductData.category || ''}
                                onChange={(e) => handleEditingFieldChange('category', e.target.value)}
                                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 outline-none focus:border-blue-500 bg-white cursor-pointer"
                              >
                                <option value="" disabled>
                                  품목(카테고리) 선택
                                </option>
                                {categoryOptions.map((cat, idx) => (
                                  <option key={idx} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* 제품명 */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-neutral-600">제품명</label>
                              <input
                                type="text"
                                value={editingProductData.productName}
                                onChange={(e) => handleEditingFieldChange('productName', e.target.value)}
                                placeholder="예: 11.1.4ch 사운드바"
                                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 outline-none focus:border-blue-500 bg-white"
                              />
                            </div>

                            {/* 색상 */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-neutral-600">색상</label>
                              <input
                                type="text"
                                value={editingProductData.color}
                                onChange={(e) => handleEditingFieldChange('color', e.target.value)}
                                placeholder="예: 새틴 그레이 / 새틴 화이트"
                                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 outline-none focus:border-blue-500 bg-white"
                              />
                            </div>
                          </div>

                          {/* 메인 제품 대표 이미지 */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-neutral-600">대표 이미지</label>
                            <div className="border border-neutral-200 rounded-lg p-3 bg-white flex items-center justify-center h-full min-h-[120px] relative overflow-hidden">
                              {editingProductData.imageUrl ? (
                                <img src={editingProductData.imageUrl} alt="대표 이미지" className="max-h-28 max-w-full object-contain" />
                              ) : (
                                <span className="text-neutral-400 text-[11px]">이미지 없음</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. 상세 세부 내용 (Detail Rows) 편집 목록 */}
                        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                          <div className="bg-neutral-100 py-2.5 text-center font-bold text-neutral-700 text-xs border-b border-neutral-200">
                            상세 스펙 및 세부 설명 내용 (Detail Rows)
                          </div>

                          <div className="divide-y divide-neutral-200">
                            {editingProductData.detailRows.map((row: any, idx: number) => (
                              <div key={row.id || idx} className="grid grid-cols-[220px_1fr] p-5 gap-5 items-center bg-white relative group">
                                
                                {/* 행 삭제 (✕) 버튼 */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRowInline(idx)}
                                  className="absolute top-2 right-2 text-neutral-300 hover:text-red-500 font-bold text-xs transition cursor-pointer z-10 opacity-0 group-hover:opacity-100"
                                  title="항목 삭제"
                                >
                                  ✕
                                </button>

                                {/* 왼쪽: 이미지 추가/수정 박스 */}
                                <div className="flex flex-col items-center justify-center border border-neutral-200 rounded-lg p-2 bg-[#FAFAFA] min-h-[140px] group/img relative">
                                  {row.image ? (
                                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                                      <img 
                                        src={row.image} 
                                        alt={`상세 이미지 ${idx + 1}`} 
                                        className="max-h-36 max-w-full object-contain rounded"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded">
                                        <label className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded cursor-pointer hover:bg-blue-700 transition">
                                          변경
                                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUploadInline(idx, e)} />
                                        </label>
                                        <button 
                                          type="button"
                                          onClick={() => handleRemoveImageInline(idx)} 
                                          className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition cursor-pointer"
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <label className="w-full h-32 bg-[#FAFAFA] border border-dashed border-neutral-300 rounded flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-100 transition cursor-pointer">
                                      <span className="text-xl mb-1">+</span>
                                      <span className="text-[11px] font-medium">이미지 추가</span>
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUploadInline(idx, e)} />
                                    </label>
                                  )}
                                </div>

                                {/* 오른쪽: 자동 높이 조절 설명 문구 입력창 */}
                                <div className="p-2 flex flex-col justify-center">
                                  <AutoResizeTextarea
                                    value={row.text || ''}
                                    placeholder="[주요 특징 입력]&#10;상세 내용 및 셀링 포인트를 입력해주세요."
                                    className="text-xs text-neutral-800 text-center font-medium leading-relaxed whitespace-pre-wrap placeholder:text-neutral-300"
                                    onChange={(val) => handleTextChangeInline(idx, val)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 하단 세부 내용 추가 버튼 */}
                          <button
                            type="button"
                            onClick={handleAddRowInline}
                            className="w-full py-3 bg-[#FAFAFA] text-neutral-600 font-bold text-xs hover:bg-neutral-100 transition cursor-pointer flex items-center justify-center gap-1 border-t border-neutral-200"
                          >
                            <span className="text-sm leading-none">+</span> 세부 내용 추가하기
                          </button>

                        </div>

                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-xs font-bold text-neutral-400">
            {searchTerm ? `'${searchTerm}'에 대한 검색 결과가 없습니다.` : '데이터가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
}