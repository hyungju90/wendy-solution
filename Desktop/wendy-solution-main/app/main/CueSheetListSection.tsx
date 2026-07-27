'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 클라이언트 단일 생성 (컴포넌트 바깥 배치로 중복 생성 에러 방지)
const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaW56anRmZmtuZ3hta2RveWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDA5OTgsImV4cCI6MjA5OTExNjk5OH0.dkgztr_ZbKyP83JcJy7ieZ3MH4pnhDkVBeB_B6AqeT0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NAS_BASE_URL = 'https://vvendynas.synology.me/web_images/';

export default function CueSheetListSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [editProduct, setEditProduct] = useState<any>(null);

  const [detailRows, setDetailRows] = useState<any[]>([
    { id: 1, text: '', image: null },
    { id: 2, text: '', image: null },
  ]);

  // 2. Supabase에서 제품 목록 불러오기
  const fetchProductsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase 데이터 조회 오류 상세:', JSON.stringify(error, null, 2));
        return;
      }

      if (data) {
        const formattedData = data.map((p: any) => ({
          id: p.id,
          category: p.category || '',
          modelName: p.model_name || '',
          productName: p.product_name || '',
          imageUrl: p.image_url || (p.model_name ? `${NAS_BASE_URL}${p.model_name}.png` : ''),
          detailRows: p.detail_rows || [
            { id: 1, text: '', image: null },
            { id: 2, text: '', image: null },
          ],
        }));
        setProducts(formattedData);
      }
    } catch (error) {
      console.error('Supabase 연동 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromSupabase();
  }, []);

  useEffect(() => {
    if (editProduct) {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    }
  }, [detailRows, editProduct]);

  const handleGoBack = () => {
    const confirmLeave = window.confirm(
      '🚨 작성 중인 내용이 저장되지 않았습니다. 저장하지 않고 정말 나가시겠습니까?'
    );
    if (confirmLeave) {
      setEditProduct(null);
    }
  };

  const handleAddProduct = () => {
    setEditProduct({
      category: '',
      productName: '',
      modelName: '',
      imageUrl: '',
      isNew: true,
    });
    setDetailRows([
      { id: 1, text: '', image: null },
      { id: 2, text: '', image: null },
    ]);
  };

  const handleEditProduct = (product: any) => {
    setEditProduct({ ...product });
    setDetailRows(
      product?.detailRows || [
        { id: 1, text: '', image: null },
        { id: 2, text: '', image: null },
      ]
    );
  };

  const handleProductInfoChange = (field: string, value: string) => {
    const updated = { ...editProduct, [field]: value };
    if (field === 'modelName') {
      const trimmed = value.trim();
      updated.imageUrl = trimmed ? `${NAS_BASE_URL}${trimmed}.png` : '';
    }
    setEditProduct(updated);
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = window.confirm('정말 이 제품을 DB에서 삭제하시겠습니까?');
    if (confirmDelete) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        alert('삭제에 실패했습니다: ' + error.message);
      } else {
        alert('성공적으로 삭제되었습니다.');
        fetchProductsFromSupabase();
      }
    }
  };

  // 3. Supabase DB에 직접 제품 저장하기
  const handleSave = async () => {
    if (!editProduct?.modelName || !editProduct.modelName.trim()) {
      alert('🚨 모델명을 입력해 주세요!');
      return;
    }

    const payload = {
      category: editProduct.category,
      model_name: editProduct.modelName.trim(),
      product_name: editProduct.productName,
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
    setEditProduct(null);
    fetchProductsFromSupabase();
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

  // 1. 제품 상세 정보 작성/수정 페이지
  if (editProduct) {
    return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans text-xs">
      
      {/* 1. 통일된 타이틀 및 우측 액션 버튼 */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        
        {/* 👇 여기 있는 h1 태그를 수정하셔야 화면이 바뀝니다! 👇 */}
        <h1 className="text-xl font-medium text-neutral-900">제품 리스트</h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* 기존 함수 */}}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
          >
            + 제품 추가
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

        <div className="border border-neutral-300 rounded-lg overflow-hidden mb-8 shadow-sm">
          <div className="grid grid-cols-3 bg-neutral-50/80 border-b border-neutral-300 py-3.5 text-sm font-bold text-neutral-600 text-center">
            <div>품목</div>
            <div>제품명</div>
            <div>제품 이미지</div>
          </div>

          <div className="grid grid-cols-3 py-6 text-center items-center border-b border-neutral-300 bg-white">
            <div className="px-4 h-full">
              <input
                type="text"
                placeholder="예: 김치냉장고"
                className="w-full text-center font-semibold text-neutral-800 text-base outline-none p-2 rounded focus:bg-blue-50 transition"
                value={editProduct.category || ''}
                onChange={(e) => handleProductInfoChange('category', e.target.value)}
              />
            </div>
            <div className="px-4 h-full border-l border-r border-neutral-100">
              <input
                type="text"
                placeholder="예: 비스포크 3도어 김치냉장고 키친핏"
                className="w-full text-center font-semibold text-neutral-800 text-base outline-none p-2 rounded focus:bg-blue-50 transition"
                value={editProduct.productName || ''}
                onChange={(e) => handleProductInfoChange('productName', e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <div className="h-28 w-40 bg-white border border-neutral-200 rounded flex items-center justify-center p-1 shadow-sm overflow-hidden relative">
                {editProduct.imageUrl ? (
                  <img
                    src={editProduct.imageUrl}
                    alt="제품 이미지"
                    className="max-h-full max-w-full object-contain"
                    onError={(e: any) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs text-neutral-400">
                    모델명 입력 시<br />
                    이미지 표시
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50/30 py-8 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-blue-700">모델명</span>
              <span className="text-[10px] text-blue-500 bg-blue-100 px-2 py-0.5 rounded font-semibold border border-blue-200">
                입력 시 NAS 이미지 자동 연동 됨
              </span>
            </div>
            <input
              type="text"
              placeholder="예: RQ33DB74C1AP"
              className="w-1/2 text-center text-3xl font-bold text-blue-700 tracking-wide outline-none bg-transparent border-b-2 border-transparent focus:border-blue-300 focus:bg-white rounded transition py-2"
              value={editProduct.modelName || ''}
              onChange={(e) => handleProductInfoChange('modelName', e.target.value)}
            />
          </div>
        </div>

        <div className="border border-neutral-300 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-neutral-50/80 border-b border-neutral-300 py-3.5 text-sm font-bold text-neutral-600 text-center">
            내용
          </div>

          <div className="divide-y divide-neutral-200">
            {(detailRows || []).map((row, idx) => (
              <div key={row.id || idx} className="grid grid-cols-2">
                <div className="p-8 border-r border-neutral-200 flex items-center justify-center bg-white relative group">
                  {row.image ? (
                    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
                      <img
                        src={row.image}
                        alt="문단 이미지 미리보기"
                        className="max-h-[200px] object-contain rounded"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                        <label className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-blue-700 transition shadow-sm">
                          이미지 변경
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 cursor-pointer transition shadow-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full min-h-[200px] border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-50 transition hover:border-blue-400 hover:text-blue-500 cursor-pointer">
                      <span className="text-3xl font-light mb-2">+</span>
                      <span className="text-sm font-semibold">이 문단에 이미지 추가</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(idx, e)}
                      />
                    </label>
                  )}
                </div>

                <div className="p-8 h-full flex flex-col items-center justify-center bg-white focus-within:bg-blue-50/40 transition">
                  <textarea
                    className="w-full bg-transparent outline-none resize-none overflow-hidden text-center text-neutral-700 leading-relaxed font-medium placeholder-neutral-400"
                    placeholder="내용을 입력하세요."
                    value={row.text || ''}
                    rows={1}
                    onChange={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
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

          <div className="bg-neutral-50 border-t border-neutral-200">
            <button
              onClick={() =>
                setDetailRows([...(detailRows || []), { id: Date.now(), text: '', image: null }])
              }
              className="w-full py-4 text-neutral-500 font-bold hover:bg-neutral-100 hover:text-blue-600 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-xl leading-none">+</span> 내용(행) 추가하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. 제품 목록 페이지
  const term = (searchTerm || '').toLowerCase();
  const filteredProducts = (products || []).filter((p) => {
    const category = (p?.category || '').toLowerCase();
    const modelName = (p?.modelName || '').toLowerCase();
    const productName = (p?.productName || '').toLowerCase();

    return category.includes(term) || modelName.includes(term) || productName.includes(term);
  });

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-neutral-900">제품 리스트</h1>
        <button
          onClick={handleAddProduct}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition text-sm cursor-pointer flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> 제품 추가
        </button>
      </div>

      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center">
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

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg outline-none focus:border-blue-500 text-sm transition shadow-sm"
            placeholder="제품명, 모델명 또는 품목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-5 bg-neutral-50/80 border-b border-neutral-200 py-3.5 px-6 text-xs font-bold text-neutral-500 text-center">
          <div>품목</div>
          <div>모델명</div>
          <div>제품명</div>
          <div>이미지</div>
          <div>관리</div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-5 py-3 px-6 text-sm text-center items-center hover:bg-blue-50/40 transition"
              >
                <div className="font-semibold text-neutral-600">{product.category}</div>
                <div className="font-medium text-neutral-800 break-all px-2 leading-tight">
                  {product.modelName}
                </div>
                <div className="text-neutral-600 break-keep whitespace-normal px-2 leading-tight">
                  {product.productName}
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-12 bg-white rounded border border-neutral-200 flex items-center justify-center overflow-hidden shadow-sm p-1">
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-full h-full object-contain"
                      onError={(e: any) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-1.5">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
                  >
                    작성하기
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            {isLoading ? (
              <p className="text-sm font-bold text-neutral-400 mb-1">
                데이터를 가져오는 중입니다...
              </p>
            ) : (
              <p className="text-sm font-bold text-neutral-400 mb-1">
                등록된 제품이 없습니다. 우측 상단 [+ 제품 추가] 버튼으로 등록해 보세요!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}