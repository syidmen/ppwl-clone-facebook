Penjelasan UAS/Tugas Besar PPWL:
Buat Sosial Media KW (Facebook, X, Instagram, Quora, Reddit, Thread, Pinterest, Linkedin).
Fitur: Login/Registrasi pakai email & password atau pakai OAuth Google, Beranda, Postingan (CRUD, Like, Komentar), Notifikasi, Edit Profile (Avatar, name, email, password).
Halaman: Login/Sign In, Beranda, Form Postingan, Notifikasi, Detail Postingan (berisi text postingan atau gambar).
Proyek stack Monorepo pakai Bun Typescript:
FE: Vite, React, Tailwind, ShadcnUI (opsional).
BE: ElysiaJS, Prisma ORM.
Shared: Shared type/utilitas antara BE & FE.
UI dapat layout Mobile & Desktop.
Deploy FE & BE ke AWS. Jika frontend kendala Cloudfront, pakai Domain, jika gagal pakai Vercel.
Database production pakai AWS RDS Postgress.
Demi keamanan: 1 User hanya bisa buat 2 postingan & beri 5 komentar. komentar juga harus dapat diberi komentar balasan. Batasi postingan tidak dapat upload video.
Autoriasi: User yang belum login dapat melihat beranda & postingan, jika ingin buat post react atau komentar harus login dulu.


15 # Progress Capstone
Target #15 (senin):
AWS Lambda (Backend) & S3 (Front-end) sudah Ready sebagai media deployment.
Frontend masing-masing fitur sudah ready. Tidak wajib logika terpasang.
Target per job:
Registrasi & Login Berhasil.  Data tersimpan di backend & dapat diakses di url backend. /users?key=your-secret-key
Beranda: Halaman sudah dapat request dari backend. Buat dummy data SQL untuk postingan. Test GET data dan tampil di FE.
Komenetar: sama seperti beranda, sudah ada data dummy di SQL untuk test GET data dan tampil di FE. 
Notif: ada data dummy di backend yang tampil di bagian Halaman List notif, dan ada testing pas awal login, ada notif popup selamat datang (pakai ShadCN Sonner).
Backend Skema Database sudah ready (buat diagramnya).


Update Rules:
Cukup 1 level komentar. Tidak perlu komentar balas komentar. Komentar tidak wajib fitur hapus,edit.
Notif untuk si pemilik postingan, jika ada yang komentar maka notif muncul ke si pemilik post. Notif dapat di trigger dengan event refresh seperti geser layar ke bawah sampai muncul loading.
Jika ada kendala, masukkan ke issue repo kalian buat abg examine & bantu resolve.

Saran tools:
Frontend bisa pake Zustrand untuk handle state yg dipakai di berbagai file, seperti user_data yang dipakai di component NavBar dan page Post, dsb.

Contoh database handle login pakai google & form biasa.
User:
Name
Email
Password
Isgoogle (if true, password not needed & must login using google auth).


Tips Skema Awal
Berikut skema database relasional untuk aplikasi sosial media dengan fitur:
Login/Register (Email & Password + OAuth Google)
Beranda
Postingan CRUD
Like
Komentar
Notifikasi
Edit Profile (avatar, nama, email, password)

Struktur Tabel Utama
1. users
Menyimpan data akun pengguna.
Field
Type
Keterangan
id
bigint PK
ID user
name
varchar
Nama pengguna
username
varchar UNIQUE
Username
email
varchar UNIQUE
Email
password
varchar NULL
Password hash (NULL jika OAuth-only)
avatar_url
text NULL
Foto profil
bio
text NULL
Bio user
provider
enum(email, google)
Metode login
provider_id
varchar NULL
ID dari Google OAuth
email_verified_at
timestamp NULL
Verifikasi email
created_at
timestamp


updated_at
timestamp




2. posts
Menyimpan postingan user.
Field
Type
Keterangan
id
bigint PK
ID post
user_id
bigint FK -> users.id
Pemilik post
content
text
Isi posting
image_url
text NULL
Gambar post
created_at
timestamp


updated_at
timestamp



Relasi:
1 user punya banyak posts

3. post_likes
Menyimpan like pada postingan.
Field
Type
Keterangan
id
bigint PK


post_id
bigint FK -> posts.id
Post yang dilike
user_id
bigint FK -> users.id
User yang like
created_at
timestamp



Constraint:
UNIQUE(post_id, user_id)
Agar user tidak bisa like berkali-kali.

4. comments
Menyimpan komentar post.
Field
Type
Keterangan
id
bigint PK


post_id
bigint FK -> posts.id


user_id
bigint FK -> users.id


parent_comment_id
bigint NULL FK -> comments.id
Reply komentar
content
text
Isi komentar
created_at
timestamp


updated_at
timestamp



Mendukung:
komentar biasa
reply komentar/thread

5. notifications
Menyimpan notifikasi user.
Field
Type
Keterangan
id
bigint PK


user_id
bigint FK -> users.id
Penerima notifikasi
actor_id
bigint FK -> users.id
Pelaku aksi
type
enum(like, comment, follow)
Jenis notif
post_id
bigint NULL FK -> posts.id


comment_id
bigint NULL FK -> comments.id


is_read
boolean
Status dibaca
created_at
timestamp



Contoh:
A like post B
A comment post B

Relasi Antar Tabel
users
 ├── posts
 ├── comments
 ├── post_likes
 └── notifications

posts
 ├── comments
 └── post_likes

comments
 └── comments (reply)

ERD (Entity Relationship Diagram)
+------------------+
| users            |
+------------------+
| id PK            |
| name             |
| username         |
| email            |
| password         |
| avatar_url       |
| bio              |
| provider         |
| provider_id      |
| email_verified_at|
| created_at       |
| updated_at       |
+------------------+

        1
        |
        | has many
        v

+------------------+
| posts            |
+------------------+
| id PK            |
| user_id FK       |
| content          |
| image_url        |
| created_at       |
| updated_at       |
+------------------+

        |
  +-----+------+
  |            |
  v            v

+------------------+      +------------------+
| comments         |      | post_likes       |
+------------------+      +------------------+
| id PK            |      | id PK            |
| post_id FK       |      | post_id FK       |
| user_id FK       |      | user_id FK       |
| parent_comment_id|      | created_at       |
| content          |      +------------------+
| created_at       |
| updated_at       |
+------------------+

+------------------+
| notifications    |
+------------------+
| id PK            |
| user_id FK       |
| actor_id FK      |
| type             |
| post_id FK       |
| comment_id FK    |
| is_read          |
| created_at       |
+------------------+

Alur Fitur ke Database
Login/Register Email
users.email
users.password
Password disimpan dalam bentuk hash:
bcrypt
argon2

Login Google OAuth
Gunakan:
provider = "google"
provider_id = Google ID
Jika login Google pertama kali:
insert user baru
Jika sudah ada:
login langsung

Beranda
Query:
ambil posts terbaru
join users
hitung like/comment
Contoh:
SELECT posts.*, users.name, users.avatar_url
FROM posts
JOIN users ON users.id = posts.user_id
ORDER BY posts.created_at DESC;

Like Post
Insert ke:
post_likes
Buat notifikasi:
notifications

Komentar
Insert ke:
comments
Buat notifikasi:
notifications

Edit Profile
Update:
users.name
users.avatar_url
users.email
users.password

Fitur State Management
Untuk aplikasi sosial media seperti ini, state yang cocok disimpan di Zustand adalah state yang:
dipakai lintas banyak halaman/component
sering berubah
dibutuhkan secara global
tidak ideal jika terus di-props drilling

State yang Sebaiknya Global (Zustand)
1. Auth State
Paling penting untuk global state.
Digunakan di:
Navbar
Protected Route
Profile
Post creation
Notification
Comment
Like button
Data
type AuthUser = {
  id: string
  name: string
  username: string
  email: string
  avatarUrl?: string
}
Store
type AuthStore = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean

  setUser: (user: AuthUser | null) => void
  logout: () => void
}
Kenapa global?
Karena hampir semua halaman perlu tahu:
user login atau tidak
avatar user
token auth

2. Notification State
Dipakai di:
navbar badge
halaman notification
realtime update
Data
type Notification = {
  id: string
  type: "like" | "comment"
  isRead: boolean
}
Store
type NotificationStore = {
  notifications: Notification[]
  unreadCount: number

  setNotifications: () => void
  markAsRead: (id: string) => void
}
Kenapa global?
Navbar dan halaman notif perlu sinkron.

3. Theme / UI State
Jika ada:
dark mode
sidebar state
modal state
Contoh
type UIStore = {
  theme: "light" | "dark"
  sidebarOpen: boolean

  toggleTheme: () => void
  toggleSidebar: () => void
}

4. Feed / Timeline Cache (Opsional)
Jika ingin:
infinite scroll
cache home feed
menghindari refetch
Store
type FeedStore = {
  posts: Post[]

  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (post: Post) => void
  deletePost: (id: string) => void
}
Kenapa opsional?
Kalau pakai:
TanStack Query
SWR
biasanya feed lebih baik dikelola server-state, bukan Zustand.

5. Realtime State (Opsional)
Jika pakai:
websocket
realtime notification
online user
Contoh
type RealtimeStore = {
  onlineUsers: string[]
  socketConnected: boolean
}

Yang TIDAK Perlu Zustand
Form Input
Jangan global.
Contoh:
login form
register form
edit profile form
create post textarea
Cukup:
useState
react-hook-form

Modal Kecil Lokal
Kalau cuma dipakai 1 component:
const [open, setOpen] = useState(false)
Tidak perlu Zustand.

Arsitektur Recommended
Gunakan Kombinasi:
Zustand → Client Global State
Untuk:
auth
UI
notif realtime
TanStack Query → Server State
Untuk:
posts
comments
likes
profile data
Karena:
caching
refetch
pagination
optimistic update
loading state
lebih cocok ditangani Query library.

Struktur Store Recommended
src/
 ├── stores/
 │    ├── auth.store.ts
 │    ├── notification.store.ts
 │    ├── ui.store.ts
 │    └── realtime.store.ts

Contoh auth.store.ts
import { create } from "zustand"

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type AuthStore = {
  user: User | null
  token: string | null

  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) =>
    set({
      user,
      token
    }),

  logout: () =>
    set({
      user: null,
      token: null
    })
}))

Prioritas State untuk Aplikasi Ini
Wajib Zustand
Auth user
Token/session
Notification badge
UI state


Contoh Pakai Zustrand untuk auth.store.ts
Contoh flow modern untuk login Google dengan Zustand biasanya seperti ini:
Frontend → Google OAuth
→ dapat token/user
→ kirim ke backend
→ backend verifikasi
→ backend kirim JWT + user
→ simpan ke Zustand
→ redirect

1. Install Zustand
npm install zustand

2. Buat auth store
src/stores/auth.store.ts
import { create } from "zustand"

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

type AuthStore = {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
}))

3. Install Google OAuth
Pakai:
Google Identity Services
atau @react-oauth/google
Install:
npm install @react-oauth/google

4. Wrap App
main.tsx
import ReactDOM from "react-dom/client"
import App from "./App"
import { GoogleOAuthProvider } from "@react-oauth/google"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
)

5. Login Page
src/pages/LoginPage.tsx
import { GoogleLogin } from "@react-oauth/google"
import { useAuthStore } from "../stores/auth.store"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth)

  const navigate = useNavigate()

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      // token dari google
      const googleToken = credentialResponse.credential

      // kirim ke backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: googleToken
          })
        }
      )

      const data = await response.json()

      // simpan ke zustand
      setAuth(data.user, data.accessToken)

      // redirect
      navigate("/")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => console.log("Login Failed")}
      />
    </div>
  )
}

6. Contoh Response Backend
Backend mengembalikan:
{
  "user": {
    "id": "1",
    "name": "Leo",
    "email": "leo@gmail.com",
    "avatarUrl": "https://..."
  },
  "accessToken": "jwt_token_here"
}

7. Pakai State di Component Lain
Contoh navbar:
Navbar.tsx
import { useAuthStore } from "../stores/auth.store"

export default function Navbar() {
  const user = useAuthStore((state) => state.user)

  return (
    <nav>
      <img src={user?.avatarUrl} width={40} />
      <span>{user?.name}</span>
    </nav>
  )
}

8. Logout
import { useAuthStore } from "../stores/auth.store"

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
}

9. Protected Route
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../stores/auth.store"

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

10. Persist Login Setelah Refresh
Tambahkan middleware persist.
auth.store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
    }),
    {
      name: "auth-storage"
    }
  )
)
Sekarang login tetap tersimpan setelah refresh browser.

Flow Lengkap
Klik Login Google
    ↓
Google OAuth popup
    ↓
Frontend dapat credential token
    ↓
POST /auth/google ke backend
    ↓
Backend verifikasi token Google
    ↓
Backend generate JWT sendiri
    ↓
Frontend simpan user + JWT ke Zustand
    ↓
User dianggap login

Best Practice
Simpan di Zustand
✅ user
✅ access token
✅ auth status

Jangan simpan
❌ password
❌ refresh token sensitif di localStorage

Stack yang Cocok
Frontend:
React Router
Zustand
@react-oauth/google
Backend:
Google Auth Library
jsonwebtoken




