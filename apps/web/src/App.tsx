import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import { AppLayout } from "./components/Layout";
import { AuthGuard } from "./components/auth/AuthGuard";
import LoginPage from "./pages/auth/LoginPage";
import FeedPage from "./pages/feed/FeedPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import { PostDetailPage } from "./pages/post-detail";
import ProfilePage from "./pages/profile/ProfilePage";
import { useEffect, useState } from "react";
import fakebookLogo from "./assets/icons/Fakebook-1.png";
import meteLogo from "./assets/icons/mete.png";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f7f8fb]">
      <img src={fakebookLogo} alt="Fakebook" className="h-24 w-24 object-contain" />
      <div className="absolute bottom-8 flex items-center justify-center">
        <img src={meteLogo} alt="Mete" className="h-24 w-auto" />
      </div>
    </div>
  );
}

function LoginRoute() {
  const navigate = useNavigate();

  return (
    <LoginPage
      onSuccess={() => navigate("/")}
      onGoRegister={() => navigate("/register")}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();

  return (
    <RegisterPage
      onSuccess={() => navigate("/")}
      onGoLogin={() => navigate("/login")}
    />
  );
}

export function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {isLoading && <LoadingScreen />}
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route element={<AppLayout />}>
          <Route index element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/notifications"
            element={
              <AuthGuard>
                <NotificationsPage />
              </AuthGuard>
            }
          />
          <Route path="/post-detail" element={<PostDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
