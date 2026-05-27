import { useState, useRef } from "react";
import PostForm from "../../components/post/PostForm";
import PostCard from "../../components/post/PostCard";

export type Author = { name: string; avatar: string };
export type CommentType = { id: number; author: Author; text: string; time: string };
export type PostType = {
  id: string;
  author: Author;
  time: string;
  privacy: string;
  text?: string;
  image?: string;
  likes: number;
  reactions: string[];
  comments: CommentType[];
  shares: number;
};

// Data pengguna yang sedang aktif (Simulasi Login)
const CURRENT_USER: Author = {
  name: "Atikoh Ika",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
};

// Data Cerita / Stories Dummy Lengkap (dari Kode 2)
const STORIES = [
  { name: "Riska Riska",   img: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80" },
  { name: "Tika Tri",     img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80" },
  { name: "Kevin",        img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80" },
  { name: "Muhajir",      img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
  { name: "Angga Saputra",img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
  { name: "Welah Lediez", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80" },
  { name: "Serlina",      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
  { name: "Fikri",        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
];

// Data Postingan Awal di Beranda (Lengkap dari Kode 2)
const INITIAL_POSTS: PostType[] = [
  {
    id: "post1",
    author: {
      name: "Erinn",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    },
    time: "22 jam",
    privacy: "public",
    text: "Jastip dimsum untuk isok guyss ii 🔥 cuss di pesan guyss ... banyak pilihannya loh, ada yang kukus ada yang goreng, harga terjangkau kualitas bintang lima! 😋",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
    likes: 42,
    reactions: ["👍", "❤️", "😮"],
    comments: [],
    shares: 2,
  },
  {
    id: "post2",
    author: {
      name: "Asiseh",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    time: "1 hari",
    privacy: "public",
    text: "Asiseh sedang di 📍 Pontianak, Kalimantan Barat. Makan siang dulu yuk sebelum lanjut kerja! Warung soto langganan udah buka 🍜",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    likes: 87,
    reactions: ["👍", "❤️", "😍"],
    comments: [],
    shares: 5,
  },
];

function StoriesRow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const CARD_W = 120;

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: CARD_W * 3, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", marginBottom: 16, overflow: "hidden" }}>
      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none",
          msOverflowStyle: "none", paddingBottom: 4,
        }}
      >
        {/* Tombol Buat Cerita Sendiri */}
        <div 
          style={{ width: 112, height: 200, borderRadius: 10, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", overflow: "hidden", position: "relative", cursor: "pointer", flexShrink: 0 }}
          className="group"
        >
          <div style={{ width: "100%", height: 150, overflow: "hidden" }}>
            <img 
              src={CURRENT_USER.avatar} 
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} 
              className="group-hover:scale-105"
              alt="" 
            />
          </div>
          <div style={{ background: "#1877f2", width: 32, height: 32, borderRadius: "50%", border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", fontSize: 20 }}>+</div>
          <div style={{ position: "absolute", bottom: 8, width: "100%", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#050505" }}>Buat cerita</div>
        </div>

        {/* Daftar Cerita Teman dengan Animasi Zoom ala Facebook */}
        {STORIES.map((story, idx) => (
          <div
            key={idx}
            style={{
              width: 112, height: 200, borderRadius: 10,
              position: "relative", cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)", flexShrink: 0,
              overflow: "hidden"
            }}
            className="group"
          >
            <img 
              src={story.img} 
              style={{ 
                width: "100%", height: "100%", objectFit: "cover", 
                transition: "transform 0.4s ease" 
              }}
              className="group-hover:scale-105"
              alt=""
            />
            <div 
              style={{ 
                position: "absolute", inset: 0, borderRadius: 10, 
                background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
                transition: "background 0.3s ease"
              }} 
              className="group-hover:bg-black/20"
            />
            <img
              src={story.img}
              style={{ width: 36, height: 36, borderRadius: "50%", position: "absolute", top: 8, left: 8, border: "3px solid #1877f2", objectFit: "cover", zIndex: 1 }}
              alt=""
            />
            <span style={{ position: "absolute", bottom: 8, left: 8, right: 8, color: "#fff", fontSize: 12, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.8)", zIndex: 1 }}>
              {story.name}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={scrollRight}
        style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-60%)", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#050505",
        }}
      >
        ›
      </button>
    </div>
  );
}

export default function FeedPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [posts, setPosts] = useState<PostType[]>(INITIAL_POSTS);

  // 1. SIMULASI CREATE POST MURNI LOKAL (Bypass API Backend seperti Kode 1)
  const handleCreatePost = async (postText: string, imageFile: File | null) => {
    // Membuat URL blob lokal tiruan jika user memilih gambar di komputer mereka
    let localImageUrl = undefined;
    if (imageFile) {
      localImageUrl = URL.createObjectURL(imageFile);
    }

    // Merakit objek postingan tiruan yang sesuai dengan format UI React
    const newMockPost: PostType = {
      id: `mock-${Date.now()}`, // ID Unik sementara berbasis waktu komputer
      author: CURRENT_USER,
      time: "Baru saja",
      privacy: "public",
      text: postText,
      image: localImageUrl,
      likes: 0,
      reactions: [],
      comments: [],
      shares: 0
    };

    // Suntik langsung ke State layar lokal agar langsung muncul di baris paling atas
    setPosts([newMockPost, ...posts]);
    setIsFormOpen(false);
  };

  // 2. SIMULASI UPDATE POST MURNI LOKAL
  const handleUpdateState = (id: string, newText: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, text: newText } : p));
  };

  // 3. SIMULASI DELETE POST MURNI LOKAL
  const handleDeleteState = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div style={{ background: "#f0f2f5", color: "#050505", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <div style={{ display: "flex", maxWidth: 1250, margin: "0 auto", padding: "16px 8px", gap: 16, alignItems: "flex-start" }}>

        {/* ── Kolom Kiri (UI Menu Lengkap dari Kode 2) ── */}
        <div style={{ width: 260, flexShrink: 0, position: "sticky", top: 72, maxHeight: "calc(100vh - 80px)", overflowY: "auto" }} className="hidden lg:block">
          <div
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e4e6eb")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <img src={CURRENT_USER.avatar} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} alt="" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{CURRENT_USER.name}</span>
          </div>

          {[
            { name: "Meta AI", icon: "🔮" },
            { name: "Teman", icon: "👥" },
            { name: "Kenangan", icon: "⏳" },
            { name: "Tersimpan", icon: "🔖" },
            { name: "Grup", icon: "👨‍👩‍👧‍👦" },
            { name: "Video", icon: "📺" },
            { name: "Kabar", icon: "📰" },
            { name: "Acara", icon: "📅" },
            { name: "Pengelola Iklan", icon: "📊" }
          ].map(menu => (
            <div
              key={menu.name}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#e4e6eb")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{menu.icon}</span>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{menu.name}</span>
            </div>
          ))}
        </div>

        {/* ── Kolom Tengah (Feed Utama dari Kode 2 dengan Tombol Aktif) ── */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 590, margin: "0 auto" }}>
          
          {/* Kotak Pemicu Modal Buat Postingan */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.1)", padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={CURRENT_USER.avatar} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} alt="" />
              <div
                onClick={() => setIsFormOpen(true)}
                style={{ flex: 1, background: "#f0f2f5", borderRadius: 20, padding: "10px 16px", fontSize: 15, cursor: "pointer", color: "#65676b", fontWeight: 500 }}
              >
                Apa yang Anda pikirkan, {CURRENT_USER.name.split(" ")[0]}?
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span onClick={() => setIsFormOpen(true)} style={{ color: "#f3425f", fontSize: 22, cursor: "pointer" }}>📹</span>
                <span onClick={() => setIsFormOpen(true)} style={{ color: "#45bd62", fontSize: 22, cursor: "pointer" }}>🖼️</span>
                <span onClick={() => setIsFormOpen(true)} style={{ color: "#f7b928", fontSize: 22, cursor: "pointer" }}>😊</span>
              </div>
            </div>
          </div>

          {/* Baris Cerita */}
          <StoriesRow />

          {/* Menampilkan Daftar Postingan */}
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onEditPost={handleUpdateState}
              onDeletePost={handleDeleteState}
            />
          ))}
        </div>

        {/* ── Kolom Kanan (Kontak Aktif & Ultah dari Kode 2) ── */}
        <div style={{ width: 260, flexShrink: 0, position: "sticky", top: 72, maxHeight: "calc(100vh - 80px)", overflowY: "auto" }} className="hidden lg:block">
          <div style={{ paddingBottom: 16, borderBottom: "1px solid #ced0d4", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: "#65676b", marginBottom: 10, fontSize: 16 }}>Ulang Tahun</div>
            <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span>🎁</span>
              <span><strong>N Fazilaa</strong> berulang tahun hari ini.</span>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: "#65676b", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16 }}>
              <span>Kontak</span>
              <div style={{ display: "flex", gap: 12, cursor: "pointer" }}><span>🔍</span><span>•••</span></div>
            </div>

            {[
              { name: "Riska Riska",         active: true  },
              { name: "Serlina Ramadhani",   active: false },
              { name: "Muhajir",             active: true  },
              { name: "Fikri",               active: false },
            ].map((contact, idx) => (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px", cursor: "pointer", borderRadius: 8 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#e4e6eb")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ced0d4", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{contact.name[0]}</span>
                  {contact.active && (
                    <div style={{ width: 10, height: 10, background: "#31a24c", borderRadius: "50%", position: "absolute", bottom: -1, right: -1, border: "2px solid #fff" }} />
                  )}
                </div>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{contact.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Komponen Modal Input PopUp Status */}
      {isFormOpen && (
        <PostForm
          currentUser={CURRENT_USER}
          onClose={() => setIsFormOpen(false)}
          onSavePost={handleCreatePost}
        />
      )}
    </div>
  );
}