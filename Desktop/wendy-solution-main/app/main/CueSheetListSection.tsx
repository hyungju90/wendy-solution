'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ProductEditSection } from './ProductEditSection';

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

  const fetchProductsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
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

  // ✅ 제품 작성/수정 중일 때, 우리가 방금 만든 파일(ProductEditSection)을 화면에 보여줍니다!
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

  // ✅ 제품 리스트 (메인 화면)
  const term = (searchTerm || '').toLowerCase();
  const filteredProducts = products.filter((p) => {
    return (p.category?.toLowerCase() || '').includes(term) || 
           (p.modelName?.toLowerCase() || '').includes(term) || 
           (p.productName?.toLowerCase() || '').includes(term);
  });

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-neutral-900">제품 리스트</h1>
        <button onClick={() => setEditProduct({ isNew: true })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition text-sm cursor-pointer flex items-center gap-1">
          <span className="text-lg leading-none">+</span> 제품 추가
        </button>
      </div>

      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-blue-600 font-bold text-xs bg-blue-100 px-2.5 py-1 rounded">공지사항</span>
          <span className="text-xs text-neutral-700 font-medium">26년 2분기 쿠팡 선물 대잔치 공지</span>
        </div>
      </div>

      <div className="mb-6 relative max-w-md">
        <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg outline-none focus:border-blue-500 text-sm shadow-sm" placeholder="제품명, 모델명 또는 품목 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <svg className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-5 bg-neutral-50/80 border-b border-neutral-200 py-3.5 px-6 text-xs font-bold text-neutral-500 text-center">
          <div>품목</div><div>모델명</div><div>제품명</div><div>이미지</div><div>관리</div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className="grid grid-cols-5 py-3 px-6 text-sm text-center items-center hover:bg-blue-50/40 transition">
                <div className="font-semibold text-neutral-600">{product.category}</div>
                <div className="font-medium text-neutral-800 break-all px-2 leading-tight">{product.modelName}</div>
                <div className="text-neutral-600 break-keep whitespace-normal px-2 leading-tight">{product.productName}</div>
                <div className="flex justify-center"><div className="w-16 h-12 bg-white rounded border border-neutral-200 p-1 flex items-center justify-center"><img src={product.imageUrl} className="max-h-full max-w-full object-contain" onError={(e: any) => e.currentTarget.style.display = 'none'} /></div></div>
                <div className="flex justify-center gap-1.5">
                  <button onClick={() => setEditProduct(product)} className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition">작성하기</button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-1.5 bg-white border border-red-200 text-red-500 font-bold rounded-lg text-xs hover:bg-red-50 transition">삭제</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-sm font-bold text-neutral-400">데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}