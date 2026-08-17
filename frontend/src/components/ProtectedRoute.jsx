import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
  return (
    <div className="fixed inset-0 flex h-dvh w-full items-center justify-center sm:overflow-auto md:overflow-hidden bg-[#f7f9ff] px-4">
      <div className="flex flex-col items-center">

        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500" />
        </div>
      </div>
    </div>
  );
}
  
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}
