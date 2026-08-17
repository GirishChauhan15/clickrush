import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, Layout, ProtectedRoute } from "./components";
import { AuthProvider } from "./context/AuthContext.jsx";
import {
  Auth,
  Home,
  Leaderboard,
  Play,
  Profile,
} from "./pages/index.js";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/play" element={<Play />} />

            <Route element={<GuestRoute />}>
              <Route
                path="/login"
                element={<Auth mode="login" />}
              />

              <Route
                path="/register"
                element={<Auth mode="register" />}
              />
            </Route>

            <Route
              path="/leaderboard"
              element={<Leaderboard />}
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}