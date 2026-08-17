import { useState } from "react";
import { Eye, EyeOff, Brain, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth({ mode = "login" }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }

      navigate(location.state?.from || "/play");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f9ff] font-space">
      <main className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-5 pb-12 pt-6">
        <div className="grid max-w-6xl overflow-hidden rounded-[32px] bg-white p-4 shadow-[0_25px_80px_rgba(70,60,130,0.15)] sm:px-10 lg:w-full lg:grid-cols-2 lg:p-0">
          <div className="relative hidden overflow-hidden bg-linear-to-br from-blue-500 via-purple-600 to-pink-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

            <div className="relative z-10 flex h-full flex-col justify-center">
              <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Zap
                  size={16}
                  className="fill-yellow-300 text-yellow-300"
                />
                Train your brain
              </div>

              <h1 className="max-w-md text-5xl font-black leading-[1.05]">
                Think fast.
                <br />
                Click faster.
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
                Join ClickRush and challenge your reaction speed, focus, and
                decision-making skills.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-7 sm:p-10 lg:p-14">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                  <Brain className="text-white" size={28} />
                </div>

                <h1 className="text-3xl font-black">ClickRush</h1>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {isLogin ? "Welcome back!" : "Create your account"}
                </h1>

                <p className="mt-2 text-slate-500">
                  {isLogin
                    ? "Sign in to save scores and compete."
                    : "Save your scores and appear on the rankings."}
                </p>
              </div>

              <div className="my-7 h-px flex-1 bg-slate-200" />

              <form className="space-y-5" onSubmit={submit}>
                {!isLogin && (
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Name

                    <input
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                )}

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="text-sm font-bold text-slate-700">
                  Password

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      minLength="8"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-600"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </label>

                {error && (
                  <div
                    role="alert"
                    className="mx-auto mt-4 flex w-full max-w-md items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm sm:mt-5 sm:px-5 sm:py-3.5 sm:text-base"
                  >
                    <span className="mt-0.5 shrink-0 text-red-500">⚠</span>

                    <p className="min-w-0 wrap-break-word leading-5">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  disabled={busy}
                  className={`group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-500 via-purple-600 to-pink-500 px-5 py-4 font-black text-white shadow-lg shadow-purple-500/20 transition delay-150 ${
                    !busy &&
                    "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30"
                  } disabled:cursor-not-allowed disabled:opacity-80`}
                >
                  {busy ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : isLogin ? (
                    "Login"
                  ) : (
                    "Create account"
                  )}
                </button>

                <div className="mt-8 flex justify-center text-center text-sm text-slate-500">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}

                  <span className="pl-1 font-black text-purple-600 hover:text-purple-700">
                    <Link to={isLogin ? "/register" : "/login"}>
                      {isLogin ? "Register" : "Login"}
                    </Link>
                  </span>
                </div>
              </form>

              <div className="mt-8 select-none rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-400">
                  🔒 Your account and game progress are securely stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}