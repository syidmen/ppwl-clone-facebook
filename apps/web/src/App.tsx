import { useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";

type Page = "login" | "register" | "profile";

export function App() {
  const [page, setPage] = useState<Page>("login");

  return (
    <main className="min-h-screen bg-[#F0F2F5]">
      <nav className="sticky top-0 z-10 border-b border-[#CED0D4] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage("login")}
            className="text-[18px] font-bold text-[#1877F2]"
          >
            PPWL Social
          </button>

          <div className="flex rounded-[6px] bg-[#F0F2F5] p-1">
            {(["login", "register", "profile"] as const).map((item) => (
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
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {page === "login" && (
        <LoginPage
          onSuccess={() => setPage("profile")}
          onGoRegister={() => setPage("register")}
        />
      )}

      {page === "register" && (
        <RegisterPage
          onSuccess={() => setPage("profile")}
          onGoLogin={() => setPage("login")}
        />
      )}

      {page === "profile" && <ProfilePage />}
    </main>
  );
}
