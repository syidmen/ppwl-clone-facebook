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
  return (
    <BrowserRouter>
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
