import { useState, useRef } from "react";

interface Author {
  name: string;
  avatar: string;
}

interface PostFormProps {
  currentUser: Author;
  onClose: () => void;
  onSavePost: (text: string, imageFile: File | null) => Promise<void>;
}

export default function PostForm({ currentUser, onClose, onSavePost }: PostFormProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Ref untuk menghubungkan ikon gambar ke input file HTML asli
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi saat user memilih gambar dari komputer/HP
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Membuat preview gambar lokal sementara
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) return;
    
    setLoading(true);
    // Mengirimkan teks dan file mentah ke fungsi handleCreatePost di FeedPage
    await onSavePost(text, imageFile);
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(244, 244, 244, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 8, width: 500, boxShadow: "0 12px 28px rgba(0,0,0,0.2)", padding: 16, position: "relative", fontFamily: "inherit" }}>
        
        {/* Header Modal */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #ced0d4", paddingBottom: 16, marginBottom: 16, position: "relative" }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#050505" }}>Buat postingan</h3>
          <button onClick={onClose} style={{ position: "absolute", right: 0, background: "#e4e6eb", border: "none", width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Profil Pengguna */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <img src={currentUser.avatar} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#050505" }}>{currentUser.name}</div>
            <div style={{ background: "#e4e6eb", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, display: "inline-block", marginTop: 2 }}>👥 Teman ▼</div>
          </div>
        </div>

        {/* Tempat Input Teks */}
        <textarea 
          placeholder={`Apa yang Anda pikirkan, ${currentUser.name.split(" ")[0]}?`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          style={{ width: "100%", border: "none", outline: "none", resize: "none", minHeight: 120, fontSize: 18, color: "#050505" }}
        />

        {/* Wadah Preview Gambar (Hanya muncul jika gambar sudah dipilih) */}
        {imagePreview && (
          <div style={{ position: "relative", marginBottom: 16, border: "1px solid #ced0d4", borderRadius: 6, overflow: "hidden", maxHeight: 200, background: "#f0f2f5" }}>
            <img src={imagePreview} alt="Pratinjau unggahan" style={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block" }} />
            <button 
              onClick={() => { setImageFile(null); setImagePreview(null); }} 
              style={{ position: "absolute", top: 8, right: 8, background: "#fff", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Bar Tambahan Item (Tempat Tombol Ikon Foto Gambar) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #ced0d4", padding: "8px 16px", borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#050505" }}>Tambahkan ke postingan Anda</span>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            
            {/* Input File Asli (Disembunyikan lewat CSS) */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }} 
            />
            
            {/* Tombol Ikon Foto Tiruan Facebook yang Bisa Diklik */}
            <span 
              onClick={() => fileInputRef.current?.click()} 
              style={{ fontSize: 24, cursor: "pointer", userSelect: "none" }}
              title="Foto/video"
            >
              🖼️
            </span>
            <span style={{ fontSize: 24, cursor: "not-allowed", opacity: 0.5 }}>👥</span>
            <span style={{ fontSize: 24, cursor: "not-allowed", opacity: 0.5 }}>😃</span>
            <span style={{ fontSize: 24, cursor: "not-allowed", opacity: 0.5 }}>📍</span>
            <span style={{ fontSize: 24, fontWeight: "bold", color: "#00a400", cursor: "not-allowed", opacity: 0.5 }}>GIF</span>
          </div>
        </div>

        {/* Tombol Kirim Postingan */}
        <button 
          onClick={handleSubmit} 
          disabled={(!text.trim() && !imageFile) || loading}
          style={{ 
            width: "100%", 
            background: (text.trim() || imageFile) && !loading ? "#1877f2" : "#e4e6eb", 
            color: (text.trim() || imageFile) && !loading ? "#fff" : "#bcc0c4", 
            border: "none", 
            padding: "10px 0", 
            borderRadius: 6, 
            fontWeight: 600, 
            fontSize: 15,
            cursor: (text.trim() || imageFile) && !loading ? "pointer" : "not-allowed" 
          }}
        >
          {loading ? "Memproses..." : "Kirim"}
        </button>

      </div>
    </div>
  );
}