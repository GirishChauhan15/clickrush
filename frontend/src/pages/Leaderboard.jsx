import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Trophy, Wifi } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Leaderboard() {
  const { user } = useAuth();

  const [period, setPeriod] = useState("global");
  const [mode, setMode] = useState("easy");
  const [rows, setRows] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [live, setLive] = useState(false);
  const [minimumScore, setMinimumScore] = useState(0);

  async function load() {
    try {
      const params = new URLSearchParams({
        period,
        mode,
        limit: "20",
      });

      const { data } = await api.get(`/leaderboards?${params}`);

      setRows(data.leaderboard);
      setMinimumScore(data.minimumScore);

      if (user) {
        const { data: mine } = await api.get(
          `/leaderboards/me?period=${period}&mode=${mode}`
        );

        setMyRank(mine);
      } else {
        setMyRank(null);
      }
    } catch (error) {
      // console.error("Failed to load leaderboard:", error);
    }
  }

  useEffect(() => {
    load();
  }, [period, mode, user]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("leaderboard:update", load);

    return () => socket.disconnect();
  }, [period, mode, user]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f9ff] font-space text-slate-800">
      <div className="mx-auto w-[92vw] max-w-[70rem] py-8 sm:py-10 lg:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.12em] text-purple-600">
              <Trophy size={15} />
              COMPETE
            </div>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Leaderboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              The fastest fingers rise to the top.
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold shadow-sm ${
              live
                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                live ? "animate-pulse bg-emerald-500" : "bg-slate-300"
              }`}
            />

            <Wifi size={14} />

            {live ? "Live" : "Offline"}
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
            {["global", "daily", "weekly"].map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold capitalize transition sm:flex-none ${
                  period === item
                    ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 sm:ml-auto sm:w-auto"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {minimumScore > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />

            <span>
              You need at least{" "}
              <strong className="font-bold text-slate-600">
                {minimumScore.toLocaleString()} points
              </strong>{" "}
              to appear on the {period} leaderboard.
            </span>
          </div>
        )}

        {user && myRank && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-4 sm:px-5">
            <span className="text-xs font-semibold text-slate-500">
              Your rank
            </span>

            {myRank.ranked ? (
              <>
                <strong className="text-2xl font-black text-slate-900">
                  #{myRank.rank}
                </strong>

                <span className="text-sm font-medium text-slate-500">
                  {Number(myRank.score || 0).toLocaleString()} points
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-400">
                Not currently ranked
              </span>
            )}
          </div>
        )}

        <div className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 sm:rounded-[2rem]">
          <div>
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_6rem_5rem_6rem] items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-4 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-400 sm:grid-cols-[4.375rem_minmax(0,1fr)_7.5rem_6.25rem_6.875rem] sm:px-5">
              <span>#</span>
              <span>Player</span>
              <span>Mode</span>
              <span>Clicks</span>
              <span>Score</span>
            </div>

            {rows.length ? (
              rows.map((row) => (
                <div
                  key={`${row.userId}-${row.rank}`}
                  className={`grid grid-cols-[3rem_minmax(0,1fr)_6rem_5rem_6rem] items-center gap-3 border-t border-slate-100 px-4 py-4 text-sm sm:grid-cols-[4.375rem_minmax(0,1fr)_7.5rem_6.25rem_6.875rem] sm:px-5 ${
                    row.userId === user?.id ? "bg-purple-50" : "bg-white"
                  }`}
                >
                  <span className="font-black text-slate-700">
                    {row.rank <= 3
                      ? ["🥇", "🥈", "🥉"][row.rank - 1]
                      : row.rank}
                  </span>

                  <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-800">
                    <span className="truncate">{row.name}</span>

                    {row.userId === user?.id && (
                      <em className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[0.5625rem] font-black not-italic text-purple-600">
                        YOU
                      </em>
                    )}
                  </span>

                  <span className="w-fit rounded-lg bg-slate-100 px-2 py-1 text-[0.625rem] font-bold uppercase text-slate-500">
                    {row.gameMode}
                  </span>

                  <span className="text-slate-600">
                    {row.correctClicks}
                  </span>

                  <strong className="font-black text-slate-900">
                    {Number(row.score || 0).toLocaleString()}
                  </strong>
                </div>
              ))
            ) : (
              <div className="flex min-h-[27rem] items-center justify-center p-10 text-center text-sm text-slate-400">
                No completed games for this filter yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}