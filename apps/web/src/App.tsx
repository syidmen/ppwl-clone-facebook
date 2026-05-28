import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import { AppLayout } from "./components/Layout";
import LoginPage from "./pages/auth/LoginPage";
import FeedPage from "./pages/feed/FeedPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import { PostDetailPage } from "./pages/post-detail";
import ProfilePage from "./pages/profile/ProfilePage";
import { useEffect, useState } from "react";
import facebookLogo from "./assets/icons/facebook.svg";
import fromMetaLogo from "./assets/icons/from-meta.svg";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f7f8fb]">
      <img src={facebookLogo} alt="Facebook" className="h-24 w-24" />
      <div className="absolute bottom-8 flex items-center justify-center">
        <img src={fromMetaLogo} alt="Meta" className="h-8 w-auto" />
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
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/post-detail" element={<PostDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
