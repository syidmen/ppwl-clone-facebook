import { useState, useRef, useEffect } from "react";

const REACTIONS_LIST = [
  { emoji: "👍", label: "Suka",  color: "#1877f2" },
  { emoji: "❤️", label: "Super", color: "#f33e5b" },
  { emoji: "😘", label: "Haha",  color: "#f7b928" },
  { emoji: "😄", label: "Haha",  color: "#f7b928" },
  { emoji: "😮", label: "Wow",   color: "#f7b928" },
  { emoji: "😢", label: "Sedih", color: "#f7b928" },
  { emoji: "😡", label: "Marah", color: "#e1582b" },
];

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + " rb";
  return String(n);
}

type Author = { name: string; avatar: string };
export type PostType = {
  id: string; author: Author; time: string; privacy: string;
  text?: string; image?: string; likes: number;
  reactions: string[]; comments: any[]; shares: number;
};
type CommentItem = { id: number; author: Author; text: string; time: string };

const CURRENT_USER: Author = {
  name: "Atikoh Ika",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
};

// ── Ikon aksi — persis Facebook (gambar 2) ───────────────────
function IconThumbOutline({ color = "#65676b" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}

function IconComment({ color = "#65676b" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2.5C7.6 2.5 2.5 7.1 2.5 12.8c0 2.1.7 4.1 1.9 5.7L3 25l6.7-1.7c1.3.7 2.8 1.2 4.4 1.2 6.4 0 11.5-4.6 11.5-10.3S20.4 2.5 14 2.5z"/>
    </svg>
  );
}

function IconShare({ color = "#65676b" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13"/>
      <path d="M22 2L15 22 11 13 2 9l20-7z"/>
    </svg>
  );
}

// ── Lingkaran reaksi di pojok kanan ──────────────────────────
// 👍 SAJA = lingkaran biru + thumbs up SVG putih (seperti gambar)
// Emoji lainnya = tampil apa adanya sebagai emoji besar
function ReactionBadge({ reaction }: { reaction: typeof REACTIONS_LIST[0] }) {
  if (reaction.emoji === "👍") {
    return (
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "#1877f2",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
        </svg>
      </div>
    );
  }
  return <span style={{ fontSize: 22, lineHeight: 1 }}>{reaction.emoji}</span>;
}

// ── Tombol suka (kiri bawah) — tampilkan ikon sesuai reaksi ──
function SukaIcon({ reaction, liked }: { reaction: typeof REACTIONS_LIST[0]; liked: boolean }) {
  if (!liked) return <IconThumbOutline color="#65676b" />;
  if (reaction.emoji === "👍") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={reaction.color}>
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
      </svg>
    );
  }
  if (reaction.emoji === "❤️") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={reaction.color}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    );
  }
  return <span style={{ fontSize: 20, lineHeight: 1 }}>{reaction.emoji}</span>;
}

// ── Dropdown menu icons ───────────────────────────────────────
const MenuIcons = {
  save:     <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>,
  edit:     <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  audience: <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  notif:    <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  translate:<svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="m12.87 15.07-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7 1.62-4.33L19.12 17h-3.24z"/></svg>,
  info:     <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
  date:     <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>,
  archive:  <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>,
  trash:    <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  hide:     <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>,
  report:   <svg viewBox="0 0 24 24" width="20" height="20" fill="#050505"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
};

function MenuItem({ icon, label, sublabel, onClick }: { icon: React.ReactNode; label: string; sublabel?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 16px", cursor:"pointer" }}
      onMouseEnter={e=>(e.currentTarget.style.background="#f2f2f2")}
      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      <div style={{ width:36, height:36, borderRadius:"50%", background:"#e4e6eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontWeight:600, fontSize:15, color:"#050505" }}>{label}</div>
        {sublabel && <div style={{ fontSize:13, color:"#65676b" }}>{sublabel}</div>}
      </div>
    </div>
  );
}
function Divider() { return <div style={{ height:1, background:"#e4e6eb", margin:"4px 0" }} />; }

// ── Modal Bagikan ─────────────────────────────────────────────
function ShareModal({ post, onClose }: { post: PostType; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const fakeUrl = `https://sosmedkw.com/post/${post.id}`;
  const copyLink = () => { navigator.clipboard.writeText(fakeUrl).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:460, boxShadow:"0 4px 32px rgba(0,0,0,0.3)", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid #e4e6eb" }}>
          <span style={{ fontWeight:700, fontSize:17 }}>Bagikan postingan</span>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", border:"none", background:"#e4e6eb", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>
        <div style={{ margin:16, border:"1px solid #e4e6eb", borderRadius:8, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px" }}>
            <img src={post.author.avatar} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover" }} alt="" />
            <div><div style={{ fontWeight:600, fontSize:14 }}>{post.author.name}</div><div style={{ fontSize:12, color:"#65676b" }}>{post.time}</div></div>
          </div>
          {post.text && <p style={{ margin:"0 12px 10px", fontSize:14, color:"#050505", lineHeight:1.4 }}>{post.text}</p>}
          {post.image && <img src={post.image} style={{ width:"100%", maxHeight:180, objectFit:"cover", display:"block" }} alt="" />}
        </div>
        {[
          { icon:"📰", label:"Bagikan ke Feed",  desc:"Posting ulang ke beranda kamu" },
          { icon:"💬", label:"Kirim pesan",       desc:"Kirim ke teman lewat chat" },
          { icon:"📖", label:"Bagikan ke Story", desc:"Tampilkan di ceritamu 24 jam" },
          { icon:"👥", label:"Bagikan ke Grup",  desc:"Posting ke grup yang kamu ikuti" },
        ].map((opt,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", cursor:"pointer" }} onMouseEnter={e=>(e.currentTarget.style.background="#f0f2f5")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"#e4e6eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{opt.icon}</div>
            <div><div style={{ fontWeight:600, fontSize:15 }}>{opt.label}</div><div style={{ fontSize:13, color:"#65676b" }}>{opt.desc}</div></div>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"8px 16px 16px", background:"#f0f2f5", borderRadius:8, padding:"10px 12px" }}>
          <span style={{ flex:1, fontSize:13, color:"#65676b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{fakeUrl}</span>
          <button onClick={copyLink} style={{ padding:"6px 14px", borderRadius:6, border:"none", background:copied?"#44b700":"#1877f2", color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer", flexShrink:0 }}>
            {copied?"✓ Tersalin!":"Salin tautan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────
interface PostCardProps {
  post: PostType;
  onEditPost?: (id: string, newText: string) => void;
  onDeletePost?: (id: string) => void;
}

export default function PostCard({ post, onEditPost, onDeletePost }: PostCardProps) {
  const [liked, setLiked]               = useState(false);
  const [reaction, setReaction]         = useState(REACTIONS_LIST[0]);
  const [count, setCount]               = useState(post.likes ?? 0);
  const [showPopup, setShowPopup]       = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare]       = useState(false);
  const [comments, setComments]         = useState<CommentItem[]>([]);
  const [commentText, setCommentText]   = useState("");
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [editText, setEditText]         = useState(post.text || "");

  const enterTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const menuRef    = useRef<HTMLDivElement>(null);

  const isOwnPost = post.author.name === CURRENT_USER.name;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const onEnterLike  = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); enterTimer.current = setTimeout(()=>setShowPopup(true),500); };
  const onLeaveLike  = () => { if (enterTimer.current) clearTimeout(enterTimer.current); leaveTimer.current = setTimeout(()=>setShowPopup(false),300); };
  const onEnterPopup = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); };
  const onLeavePopup = () => { leaveTimer.current = setTimeout(()=>setShowPopup(false),150); };

  const onClickSuka = () => {
    setShowPopup(false);
    if (liked) { setLiked(false); setReaction(REACTIONS_LIST[0]); setCount(c=>c-1); }
    else        { setLiked(true);  setReaction(REACTIONS_LIST[0]); setCount(c=>c+1); }
  };
  const onPickReact = (r: typeof REACTIONS_LIST[0]) => {
    if (!liked) setCount(c=>c+1);
    setLiked(true); setReaction(r); setShowPopup(false);
  };
  const onSubmitComment = () => {
    if (!commentText.trim()) return;
    setComments(prev=>[...prev,{ id:Date.now(), author:CURRENT_USER, text:commentText.trim(), time:"Baru saja" }]);
    setCommentText("");
  };
  const handleSaveEdit = () => {
    if (editText.trim() && onEditPost) { onEditPost(post.id, editText); setIsEditing(false); }
  };

  const totalComments = (post.comments?.length ?? 0) + comments.length;

  return (
    <>
      <div style={{ background:"#fff", borderRadius:8, boxShadow:"0 1px 2px rgba(0,0,0,0.1)", marginBottom:16, position:"relative", overflow:"visible" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={post.author.avatar} style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover" }} alt="" />
            <div>
              <div style={{ fontWeight:600, fontSize:15, color:"#050505" }}>{post.author.name}</div>
              <div style={{ fontSize:12, color:"#65676b", marginTop:2 }}>{post.time} · {post.privacy==="public"?"🌐":"👥"}</div>
            </div>
          </div>

          {/* ••• */}
          <div style={{ position:"relative" }} ref={menuRef}>
            <div onClick={()=>setIsMenuOpen(v=>!v)}
              style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18, color:"#65676b", userSelect:"none" }}
              onMouseEnter={e=>(e.currentTarget.style.background="#f2f2f2")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
            >•••</div>

            {isMenuOpen && (
              <div style={{ position:"absolute", right:0, top:38, background:"#fff", borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.15)", width:360, zIndex:1000, padding:"8px 0" }}>
                <MenuItem icon={MenuIcons.save} label="Simpan postingan" sublabel="Tambahkan ini ke item tersimpan." />
                <Divider />
                {isOwnPost ? (
                  <>
                    <MenuItem icon={MenuIcons.edit}      label="Edit postingan"     onClick={()=>{ setIsEditing(true); setIsMenuOpen(false); }} />
                    <MenuItem icon={MenuIcons.audience}  label="Edit audiens" />
                    <MenuItem icon={MenuIcons.notif}     label="Nonaktifkan notifikasi untuk postingan ini" />
                    <MenuItem icon={MenuIcons.translate} label="Matikan terjemahan" />
                    <MenuItem icon={MenuIcons.info}      label="Mengapa saya melihat postingan ini?" />
                    <MenuItem icon={MenuIcons.date}      label="Edit tanggal" />
                    <Divider />
                    <MenuItem icon={MenuIcons.archive}   label="Pindahkan ke arsip" />
                    <MenuItem icon={MenuIcons.trash}     label="Pindahkan ke sampah" sublabel="Item di sampah dihapus setelah 30 hari."
                      onClick={()=>{ if(window.confirm("Pindahkan ke sampah?")){ if(onDeletePost) onDeletePost(post.id); } setIsMenuOpen(false); }} />
                  </>
                ) : (
                  <>
                    <MenuItem icon={MenuIcons.hide}      label="Sembunyikan postingan" sublabel="Lihat lebih sedikit postingan seperti ini." />
                    <MenuItem icon={MenuIcons.notif}     label="Nonaktifkan notifikasi untuk postingan ini" />
                    <MenuItem icon={MenuIcons.translate} label="Matikan terjemahan" />
                    <MenuItem icon={MenuIcons.info}      label="Mengapa saya melihat postingan ini?" />
                    <Divider />
                    <MenuItem icon={MenuIcons.report}    label="Laporkan postingan" sublabel="Kami tidak akan memberi tahu siapa yang melaporkan." />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Teks / Edit */}
        <div style={{ padding:"12px 16px 4px" }}>
          {isEditing ? (
            <div>
              <textarea value={editText} onChange={e=>setEditText(e.target.value)}
                style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #ced0d4", fontSize:15, fontFamily:"inherit", resize:"none", boxSizing:"border-box" }} rows={3} />
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
                <button onClick={()=>setIsEditing(false)} style={{ background:"#e4e6eb", border:"none", padding:"6px 16px", borderRadius:6, fontWeight:600, cursor:"pointer", fontSize:14 }}>Batal</button>
                <button onClick={handleSaveEdit} style={{ background:"#1877f2", color:"#fff", border:"none", padding:"6px 16px", borderRadius:6, fontWeight:600, cursor:"pointer", fontSize:14 }}>Simpan</button>
              </div>
            </div>
          ) : (
            post.text && <p style={{ fontSize:15, margin:0, color:"#050505", lineHeight:1.5, whiteSpace:"pre-wrap" }}>{post.text}</p>
          )}
        </div>

        {/* Gambar */}
        {post.image && !isEditing && (
          <div style={{ marginTop:8 }}>
            <img src={post.image} style={{ width:"100%", maxHeight:500, objectFit:"cover", display:"block" }} alt="" />
          </div>
        )}

        {/* Summary Row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", borderBottom:"1px solid #e4e6eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <IconThumbOutline color={liked?reaction.color:"#65676b"} />
              <span style={{ fontSize:14, color:"#65676b" }}>{formatCount(count)}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <IconComment color="#65676b" />
              <span style={{ fontSize:14, color:"#65676b" }}>{formatCount(totalComments)}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <IconShare color="#65676b" />
            </div>
          </div>
          {/* Pojok kanan: badge berubah sesuai reaksi */}
          {liked && <ReactionBadge reaction={reaction} />}
        </div>

        {/* Tombol Aksi */}
        <div style={{ display:"flex", padding:"4px", position:"relative" }}>
          {showPopup && (
            <div onMouseEnter={onEnterPopup} onMouseLeave={onLeavePopup}
              style={{ position:"absolute", bottom:50, left:4, background:"#fff", borderRadius:30, padding:"8px 12px", display:"flex", gap:6, boxShadow:"0 4px 20px rgba(0,0,0,0.2)", zIndex:999, animation:"popIn 0.18s ease" }}>
              {REACTIONS_LIST.map((r,i)=>(
                <span key={i} onClick={()=>onPickReact(r)} title={r.label}
                  style={{ fontSize:32, cursor:"pointer", lineHeight:1, display:"block", transition:"transform 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.4) translateY(-6px)")}
                  onMouseLeave={e=>(e.currentTarget.style.transform="scale(1) translateY(0)")}
                >{r.emoji}</span>
              ))}
            </div>
          )}

          {/* Suka */}
          <button onClick={onClickSuka} onMouseEnter={onEnterLike} onMouseLeave={onLeaveLike}
            style={{ flex:1, height:40, border:"none", background:"none", borderRadius:6, cursor:"pointer", fontSize:15, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7, color:liked?reaction.color:"#65676b", transition:"color 0.15s" }}
            onMouseEnterCapture={e=>{const b=(e.target as HTMLElement).closest("button");if(b)(b as HTMLElement).style.background="#f0f2f5";}}
            onMouseLeaveCapture={e=>{const b=(e.target as HTMLElement).closest("button");if(b)(b as HTMLElement).style.background="none";}}
          >
            <SukaIcon reaction={reaction} liked={liked} />
            <span>{liked?reaction.label:"Suka"}</span>
          </button>

          {/* Komentar */}
          <button onClick={()=>setShowComments(v=>!v)}
            style={{ flex:1, height:40, border:"none", background:"none", borderRadius:6, cursor:"pointer", fontSize:15, fontWeight:600, color:showComments?"#1877f2":"#65676b", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
            onMouseEnter={e=>(e.currentTarget.style.background="#f0f2f5")} onMouseLeave={e=>(e.currentTarget.style.background="none")}
          >
            <IconComment color={showComments?"#1877f2":"#65676b"} /> <span>Komentar</span>
          </button>

          {/* Bagikan */}
          <button onClick={()=>setShowShare(true)}
            style={{ flex:1, height:40, border:"none", background:"none", borderRadius:6, cursor:"pointer", fontSize:15, fontWeight:600, color:"#65676b", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
            onMouseEnter={e=>(e.currentTarget.style.background="#f0f2f5")} onMouseLeave={e=>(e.currentTarget.style.background="none")}
          >
            <IconShare /> <span>Bagikan</span>
          </button>
        </div>

        {/* Komentar */}
        {showComments && (
          <div style={{ borderTop:"1px solid #e4e6eb", padding:"12px 16px" }}>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <img src={CURRENT_USER.avatar} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} alt="" />
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:"#f0f2f5", borderRadius:20, padding:"0 12px" }}>
                <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSubmitComment()}
                  placeholder="Tulis komentar..."
                  style={{ flex:1, border:"none", background:"transparent", outline:"none", fontSize:14, padding:"10px 0", color:"#050505" }} />
                <button onClick={onSubmitComment} disabled={!commentText.trim()}
                  style={{ border:"none", background:"none", cursor:commentText.trim()?"pointer":"default", fontSize:18, opacity:commentText.trim()?1:0.4 }}>➤</button>
              </div>
            </div>
            {comments.length===0 && <div style={{ textAlign:"center", color:"#65676b", fontSize:14, padding:"8px 0" }}>Jadilah yang pertama berkomentar 👋</div>}
            {comments.map(c=>(
              <div key={c.id} style={{ display:"flex", gap:8, marginBottom:10 }}>
                <img src={c.author.avatar} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} alt="" />
                <div>
                  <div style={{ background:"#f0f2f5", borderRadius:18, padding:"8px 14px" }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{c.author.name}</div>
                    <div style={{ fontSize:14, color:"#050505" }}>{c.text}</div>
                  </div>
                  <div style={{ display:"flex", gap:12, marginTop:4, paddingLeft:12 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#65676b", cursor:"pointer" }}>Suka</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#65676b", cursor:"pointer" }}>Balas</span>
                    <span style={{ fontSize:12, color:"#65676b" }}>{c.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`@keyframes popIn{from{opacity:0;transform:translateY(8px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      </div>

      {showShare && <ShareModal post={post} onClose={()=>setShowShare(false)} />}
    </>
  );
}