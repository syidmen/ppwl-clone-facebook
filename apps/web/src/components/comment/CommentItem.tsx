// apps/web/src/components/comment/CommentItem.tsx
import React from 'react';

export const CommentItem = ({ comment }: { comment: any }) => {
  // Format tanggal ke format lokal (opsional)
  const date = new Date(comment.createdAt).toLocaleDateString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="flex gap-2 mb-4">
      {/* Avatar Placeholder */}
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
        {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      
      {/* Bubble Komentar */}
      <div>
        <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2 max-w-full inline-block">
          <p className="text-[13px] font-semibold text-gray-900 cursor-pointer hover:underline">
            {comment.author?.name || 'Pengguna Tanpa Nama'}
          </p>
          <p className="text-[15px] text-gray-900 leading-tight break-words">
            {comment.content}
          </p>
        </div>
        
        {/* Tombol Aksi di Bawah Komentar (Suka, Balas, Waktu) */}
        <div className="flex gap-4 mt-1 ml-3 text-[12px] text-gray-500 font-bold">
          <button className="hover:underline cursor-pointer">Suka</button>
          <button className="hover:underline cursor-pointer">Balas</button>
          <span className="font-normal text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  );
};