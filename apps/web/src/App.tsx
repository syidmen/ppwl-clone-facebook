import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import { AppLayout } from "./components/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import { PostDetailPage } from "./pages/post-detail";
import ProfilePage from "./pages/profile/ProfilePage";
import FeedPage from "./pages/feed/FeedPage";
import { PostDetailPage } from "./pages/post-detail";

type Page =
  | "login"
  | "register"
  | "profile"
  | "feed"
  | "post-detail";

export function App() {

  const [page, setPage] =
    useState<Page>("login");

  return (
    <main className="min-h-screen bg-[#F0F2F5]">

      <nav className="sticky top-0 z-10 border-b border-[#CED0D4] bg-white/95 px-4 py-3 backdrop-blur">

        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">

          <button
            type="button"
            onClick={() => setPage("feed")}
            className="text-[18px] font-bold text-[#1877F2]"
          >
            PPWL Social
          </button>

          <div className="flex rounded-[6px] bg-[#F0F2F5] p-1">

            {(
              [
                "login",
                "register",
                "profile",
                "feed",
                "post-detail"
              ] as const
            ).map((item) => (

              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`rounded-[5px] px-3 py-1.5 text-[13px] font-semibold capitalize transition ${
                  page === item
                    ? "bg-white text-[#1877F2] shadow-sm"
                    : "text-[#606770] hover:text-[#1C1E21]"
                }`}
              >
                {item === "post-detail"
                  ? "Post Detail"
                  : item}
              </button>

            ))}

          </div>
        </div>

      </nav>

      {page === "login" && (
        <LoginPage
          onSuccess={() => setPage("feed")}
          onGoRegister={() => setPage("register")}
        />
      )}

      {page === "register" && (
        <RegisterPage
          onSuccess={() => setPage("feed")}
          onGoLogin={() => setPage("login")}
        />
      )}

      {page === "profile" && (
        <ProfilePage />
      )}
      {page === "feed" && (
        <FeedPage />
      )}
      {page === "post-detail" && (
        <PostDetailPage />
      )}

    </main>
function LoginRoute() {
  const navigate = useNavigate();

  return (
    <LoginPage
      onSuccess={() => navigate("/profile")}
      onGoRegister={() => navigate("/register")}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();

  return (
    <RegisterPage
      onSuccess={() => navigate("/profile")}
      onGoLogin={() => navigate("/login")}
    />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/post-detail" element={<PostDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
