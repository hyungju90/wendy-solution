'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const NAS_BASE_URL = 'https://vvendynas.synology.me/web_images/';

interface ProductEditSectionProps {
  initialProduct?: any;
  initialData?: any;
  onCancel?: () => void;
  onBack?: () => void;
  onSaveSuccess?: () => void;
  onSave?: (data: any) => void;
}

export function ProductEditSection({
  initialProduct,
  initialData,
  onCancel,
  onBack,
  onSaveSuccess,
  onSave,
}: ProductEditSectionProps) {
  const currentInitial = initialProduct || initialData;

  const [editProduct, setEditProduct] = useState(
    currentInitial || { category: '', productName: '', modelName: '', color: '', imageUrl: '', isNew: true }
  );

  const getInitialDetailRows = () => {
    let rows = currentInitial?.detailRows || currentInitial?.detail_rows || [];
    
    if (typeof rows === 'string') {
      try {
        rows = JSON.parse(rows);
      } catch (e) {
        rows = [];
      }
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return [
        { id: 1, text: '', image: null },
        { id: 2, text: '', image: null },
      ];
    }

    if (rows.length === 1) {
      return [
        rows[0],
        { id: Date.now() + 1, text: '', image: null },
      ];
    }

    return rows;
  };

  const [detailRows, setDetailRows] = useState<any[]>(getInitialDetailRows);

  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    '가전 다품목1 (무시료)',
    '가전 다품목2',
    '삼성 가전다품목',
    '갤럭시 다품목1(폰제외)',
    '갤럭시 다품목2',
    '갤럭시 다품목3',
    '삼성 갤럭시',
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('products').select('category');
      if (data && data.length > 0) {
        const categories = Array.from(
          new Set(data.map((item) => item.category).filter((c) => c && c.trim() !== ''))
        ) as string[];

        if (categories.length > 0) {
          setCategoryOptions(categories);
        }
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductInfo = async () => {
      const currentModel = editProduct.modelName?.trim();

      if (!currentModel) return;
      if (currentInitial?.modelName === currentModel && !currentInitial?.isNew) return;

      const { data } = await supabase
        .from('products')
        .select('category, product_name, color')
        .eq('model_name', currentModel)
        .maybeSingle();

      if (data) {
        setEditProduct((prev: any) => ({
          ...prev,
          category: data.category || prev.category,
          productName: data.product_name || prev.productName,
          color: data.color || prev.color,
        }));
      }
    };

    const timer = setTimeout(() => {
      fetchProductInfo();
    }, 500);

    return () => clearTimeout(timer);
  }, [editProduct.modelName, currentInitial]);

  const handleGoBack = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    if (onBack) {
      onBack();
      return;
    }
    window.history.back();
  };

  const handleProductInfoChange = (field: string, value: string) => {
    const updated = { ...editProduct, [field]: value };
    if (field === 'modelName') {
      const trimmed = value.trim();
      updated.imageUrl = trimmed ? `${NAS_BASE_URL}${trimmed}.png` : '';
    }
    setEditProduct(updated);
  };

  const handleSave = async () => {
    if (!editProduct?.modelName || !editProduct.modelName.trim()) {
      alert('🚨 모델명을 입력해 주세요!');
      return;
    }

    const payload = {
      category: editProduct.category,
      model_name: editProduct.modelName.trim(),
      product_name: editProduct.productName,
      color: editProduct.color,
      image_url: editProduct.imageUrl,
      detail_rows: detailRows,
    };

    let error;
    if (editProduct.id && !editProduct.isNew) {
      const res = await supabase.from('products').update(payload).eq('id', editProduct.id);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert([payload]);
      error = res.error;
    }

    if (error) {
      if (error.code === '23505') {
        alert('🚨 이미 DB에 등록된 모델명입니다!');
      } else {
        alert('저장 실패: ' + error.message);
      }
      return;
    }

    alert('제품 정보가 Supabase DB에 저장되었습니다! 💾');
    if (onSave) onSave(payload);
    if (onSaveSuccess) onSaveSuccess();
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newRows = [...detailRows];
        if (newRows[index]) {
          newRows[index].image = reader.result;
          setDetailRows(newRows);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newRows = [...detailRows];
    if (newRows[index]) {
      newRows[index].image = null;
      setDetailRows(newRows);
    }
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-neutral-900">
      {/* 상단 타이틀 및 취소/저장 버튼 */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-xl font-bold text-neutral-900">제품 리스트</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="px-5 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg font-bold hover:bg-neutral-50 transition cursor-pointer text-xs"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition cursor-pointer text-xs shadow-xs"
          >
            저장
          </button>
        </div>
      </div>

      {/* 상단 정보 영역 */}
      <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0 items-stretch">
        <div className="flex flex-col gap-3">
          {/* 1) 모델명 */}
          <div className="border border-neutral-200 bg-white rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-[#FAFAFA] border-b border-neutral-200 py-2.5 text-center text-[13px] font-bold text-neutral-700">모델명</div>
            <div className="p-2">
              <input 
                type="text" 
                placeholder="예: RM70F90M1DD" 
                className="w-full text-center text-[13px] font-semibold text-neutral-800 outline-none placeholder:text-neutral-300 bg-transparent" 
                value={editProduct.modelName || editProduct.model_name || ''} 
                onChange={(e) => handleProductInfoChange('modelName', e.target.value)} 
              />
            </div>
          </div>

          {/* 2) 품목 */}
          <div className="border border-neutral-200 bg-white rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-[#FAFAFA] border-b border-neutral-200 py-2.5 text-center text-[13px] font-bold text-neutral-700">품목</div>
            <div className="p-2">
              <select
                className="w-full text-center text-[13px] font-semibold text-neutral-800 outline-none bg-white cursor-pointer appearance-none"
                value={editProduct.category || ''}
                onChange={(e) => handleProductInfoChange('category', e.target.value)}
              >
                <option value="" disabled>
                  품목(카테고리)을 선택해 주세요
                </option>
                {categoryOptions.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3) 제품명 */}
          <div className="border border-neutral-200 bg-white rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-[#FAFAFA] border-b border-neutral-200 py-2.5 text-center text-[13px] font-bold text-neutral-700">제품명</div>
            <div className="p-2">
              <input 
                type="text" 
                placeholder="예: 비스포크 4도어 푸드쇼케이스" 
                className="w-full text-center text-[13px] font-semibold text-neutral-800 outline-none placeholder:text-neutral-300 bg-transparent" 
                value={editProduct.productName || editProduct.product_name || ''} 
                onChange={(e) => handleProductInfoChange('productName', e.target.value)} 
              />
            </div>
          </div>

          {/* 4) 색상 */}
          <div className="border border-neutral-200 bg-white rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-[#FAFAFA] border-b border-neutral-200 py-2.5 text-center text-[13px] font-bold text-neutral-700">색상</div>
            <div className="p-2">
              <input 
                type="text" 
                placeholder="예: 새틴 그레이 / 새틴 화이트" 
                className="w-full text-center text-[13px] font-semibold text-neutral-800 outline-none placeholder:text-neutral-300 bg-transparent" 
                value={editProduct.color || ''} 
                onChange={(e) => handleProductInfoChange('color', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* 우측: 제품 이미지 */}
        <div className="border border-neutral-200 bg-white rounded-lg overflow-hidden shadow-2xs flex flex-col h-full">
          <div className="bg-[#FAFAFA] border-b border-neutral-200 py-2.5 text-center text-[13px] font-bold text-neutral-700 flex-shrink-0">제품 이미지</div>
          <div className="flex-1 flex items-center justify-center p-6 bg-white min-h-0">
            {editProduct.imageUrl || editProduct.image_url ? (
              <img 
                src={editProduct.imageUrl || editProduct.image_url} 
                alt="제품 이미지" 
                className="max-h-full max-w-full object-contain" 
                onError={(e: any) => { e.currentTarget.style.display = 'none'; }} 
              />
            ) : (
              <div className="w-[60%] min-w-[200px] h-[70%] min-h-[160px] bg-[#E2E2E2] flex items-center justify-center text-neutral-400 text-xs rounded"></div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 세부 내용 입력 영역 */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-2xs bg-white flex-shrink-0">
        <div className="bg-[#FAFAFA] border-b border-neutral-200 py-3 text-center text-[13px] font-bold text-neutral-700">내용</div>
        <div className="flex flex-col divide-y divide-neutral-200">
          {detailRows.map((row, idx) => (
            <div key={row.id || idx} className="grid grid-cols-[1fr_2fr] min-h-[180px]">
              <div className="p-6 flex justify-center items-center border-r border-neutral-200 group relative">
                {row.image ? (
                  <div className="relative w-full max-w-[220px] aspect-[4/3] flex items-center justify-center bg-white border border-neutral-200 rounded">
                    <img src={row.image} alt="내용 이미지" className="max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded">
                      <label className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded cursor-pointer hover:bg-blue-700 transition">변경<input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(idx, e)} /></label>
                      <button onClick={() => handleRemoveImage(idx)} className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-bold rounded hover:bg-red-600 transition cursor-pointer">삭제</button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full max-w-[220px] aspect-[4/3] bg-[#FAFAFA] border border-neutral-200 rounded flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-100 transition cursor-pointer">
                    <span className="text-xl mb-1.5">+</span><span className="text-[12px] font-medium">이미지 추가</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(idx, e)} />
                  </label>
                )}
              </div>
              
              {/* 🚀 핵심 수정: flex flex-col items-center justify-center 및 my-auto 적용으로 텍스트 가로/세로 정중앙 정렬! */}
              <div className="p-6 flex flex-col items-center justify-center w-full h-full min-h-[180px]">
                <textarea 
                  className="w-full my-auto outline-none resize-none overflow-hidden text-[12px] text-neutral-800 leading-[1.8] text-center bg-transparent placeholder:text-neutral-400" 
                  placeholder="내용 입력" 
                  value={row.text || ''}
                  rows={3}
                  onChange={(e) => {
                    const newRows = [...detailRows];
                    if (newRows[idx]) { 
                      newRows[idx].text = e.target.value; 
                      setDetailRows(newRows); 
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setDetailRows([...detailRows, { id: Date.now(), text: '', image: null }])} className="w-full py-3 bg-[#FAFAFA] text-neutral-600 border-t border-neutral-200 text-[12px] font-bold hover:bg-neutral-100 transition cursor-pointer">
          + 내용 추가
        </button>
      </div>
    </div>
  );
}