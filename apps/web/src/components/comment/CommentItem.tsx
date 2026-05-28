import defaultProfile from "../../assets/icons/default-profile.png";

export const CommentItem = ({ comment }: { comment: any }) => {
  const date = new Date(comment.createdAt).toLocaleDateString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
  const author = comment.author ?? comment.user;
  const avatarUrl = author?.avatarUrl || author?.avatar || defaultProfile;

  return (
    <div className="flex gap-2 mb-4">
      <img
        src={avatarUrl}
        alt={author?.name || "Profil"}
        className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
      />
      
      {/* Bubble Komentar */}
      <div>
        <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2 max-w-full inline-block">
          <p className="text-[13px] font-semibold text-gray-900 cursor-pointer hover:underline">
            {author?.name || 'Pengguna Tanpa Nama'}
          </p>
          <p className="text-[15px] text-gray-900 leading-tight break-words">
            {comment.content}
          </p>
        </div>
        
        <div className="mt-1 ml-3 text-[12px] text-gray-400">
          {date}
        </div>
      </div>
    </div>
  );
};
