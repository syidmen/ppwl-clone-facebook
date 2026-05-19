
import { useEffect, useState } from 'react';
import { getComments, getCommentsByPostId, createComment } from '../../api/comments.api';
import { useAuthStore } from '../../stores/auth.store';
import { CommentItem } from '../../components/comment/CommentItem';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const PostDetailPage = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [postId, setPostId] = useState('');
  
  const { isAuthenticated, user } = useAuthStore();

  const resolvePostId = async () => {
    const queryPostId = new URLSearchParams(window.location.search).get('postId');
    if (queryPostId) return queryPostId;

    const latestComments = await getComments();
    return latestComments[0]?.postId ?? '';
  };

  const fetchComments = async (targetPostId: string) => {
    try {
      setLoading(true);
      const data = await getCommentsByPostId(targetPostId);
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const resolvedPostId = await resolvePostId();

        if (!resolvedPostId) {
          setError('Belum ada post/komentar untuk dites.');
          return;
        }

        setPostId(resolvedPostId);
        await fetchComments(resolvedPostId);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!postId) return;

    try {
      await createComment(postId, newComment);
      setNewComment('');
      fetchComments(postId);
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar. (Maksimal 5 komentar)');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
        
        {/* Mocking Bagian Postingan dari Anggota 4 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600"></div>
            <div>
              <p className="font-bold text-[15px]">Anggota Tim Feed</p>
              <p className="text-[12px] text-gray-500">2 jam yang lalu</p>
            </div>
          </div>
          <p className="text-[15px]">Ini adalah *mockup* postingan sementara. Nanti akan diganti secara otomatis saat integrasi dengan pekerjaan Anggota 4.</p>
          {postId && <p className="mt-2 text-[12px] text-gray-500">Post ID: {postId}</p>}
        </div>
        
        <hr className="my-4 border-gray-200" />
        
        {/* Bagian Menampilkan List Komentar */}
        <div className="mb-6">
          {loading && <p className="text-gray-500 text-sm">Memuat komentar...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!loading && !error && comments.length === 0 && (
            <p className="text-gray-500 text-sm mb-4">Belum ada komentar. Jadilah yang pertama!</p>
          )}

          {/* Mapping Data ke Komponen CommentItem */}
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>

        {/* Bagian Form Input Komentar */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-start">
             <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                {user?.name?.charAt(0) || 'U'}
             </div>
             <Input 
                label="Komentar"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar publik..."
                className="flex-1 rounded-full bg-[#f0f2f5] border-none px-4 py-2"
             />
             <Button type="submit" className="rounded-full bg-blue-600 text-white font-semibold">Kirim</Button>
          </form>
        ) : (
          <div className="text-center p-3 bg-gray-50 rounded-lg border text-sm">
             Silakan <a href="/login" className="text-blue-600 hover:underline font-bold">Log In</a> untuk memberikan komentar.
          </div>
        )}
      </div>
    </div>
  );
};
