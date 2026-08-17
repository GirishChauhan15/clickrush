import { useEffect, useState } from "react";
import {
  BarChart3,
  History,
  Target,
  Trophy,
  Gamepad2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { countries } from "countries-list";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [ranks, setRanks] = useState({});

  const [editingNationality, setEditingNationality] = useState(false);
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [updatingNationality, setUpdatingNationality] = useState(false);

  const countryList = Object.entries(countries).map(([code, country]) => ({
    code,
    name: country.name,
  }));

  const getCountryName = (code) => {
    return countries[code]?.name || "Not set";
  };

  async function handleNationalityUpdate() {
    if (!nationality || updatingNationality) return;

    try {
      setUpdatingNationality(true);

      const { data } = await api.patch("/auth/update-nationality", {
        nationality,
      });

      setUser((previous) => ({
        ...previous,
        nationality: data.user.nationality,
      }));

      setNationality(data.user.nationality);
      setEditingNationality(false);
    } catch (error) {
      // console.error("Failed to update nationality:", error);
    } finally {
      setUpdatingNationality(false);
    }
  }

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/games/stats"),
          api.get("/games/history"),
        ]);

        setStats(statsRes.data);
        setGames(historyRes.data.games || []);

        const periods = ["global", "daily", "weekly"];
        const modes = ["easy", "medium", "hard"];

        const results = await Promise.all(
          periods.map(async (period) => {
            const modeResults = await Promise.all(
              modes.map(async (mode) => {
                try {
                  const { data } = await api.get(
                    `/leaderboards/me?period=${period}&mode=${mode}`
                  );

                  return {
                    mode,
                    data,
                  };
                } catch {
                  return {
                    mode,
                    data: null,
                  };
                }
              })
            );

            const rankedModes = modeResults
              .filter(({ data }) => data?.ranked)
              .sort(
                (a, b) =>
                  Number(b.data.score || 0) - Number(a.data.score || 0)
              );

            if (!rankedModes.length) {
              return [
                period,
                {
                  rank: null,
                  score: null,
                  mode: null,
                  ranked: false,
                },
              ];
            }

            const best = rankedModes[0];

            return [
              period,
              {
                ...best.data,
                mode: best.mode,
              },
            ];
          })
        );

        setRanks(Object.fromEntries(results));
      } catch (error) {
        // console.error("Failed to load profile:", error);
      }
    }

    loadProfile();
  }, [user?.id]);

  if (!stats) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#f7f9ff] px-6 font-space">
        <p className="text-sm font-medium text-slate-400">
          Loading profile...
        </p>
      </div>
    );
  }

  const totalClicks =
    Number(stats?.summary?.totalCorrectClicks || 0) +
    Number(stats?.summary?.totalIncorrectClicks || 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9ff] font-space text-slate-800">
      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-center gap-4 p-6 sm:gap-5 sm:p-8 lg:p-10">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.25rem] bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 text-2xl font-black text-white shadow-lg shadow-purple-500/20 sm:h-20 sm:w-20 sm:rounded-[1.5rem] sm:text-3xl">
                {user.name.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-[0.65rem] font-bold tracking-[0.08em] text-purple-600 sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  PLAYER PROFILE
                </div>

                <h1 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {user.name}
                </h1>

                <p className="mt-1 max-w-[18rem] truncate text-sm text-slate-500 sm:max-w-md sm:text-base">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8 lg:min-w-[22rem] lg:border-l lg:border-t-0 lg:p-10">
              {!editingNationality ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nationality
                  </p>

                  <div className="flex items-center justify-between gap-5">
                    <div className="min-w-0">
                      <p className="truncate text-xl font-black text-slate-900">
                        {getCountryName(nationality)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Your player profile
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingNationality(true)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-purple-600 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50 active:scale-95"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Update nationality
                  </p>

                  <div className="flex flex-col gap-3">
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                    >
                      <option value="">Select your country</option>

                      {countryList.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={updatingNationality}
                        onClick={handleNationalityUpdate}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingNationality ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <Check size={14} />
                        )}

                        Save
                      </button>

                      <button
                        type="button"
                        disabled={updatingNationality}
                        onClick={() => {
                          setNationality(user?.nationality || "");
                          setEditingNationality(false);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            icon={<Target size={22} />}
            label="Best score"
            value={stats.summary.bestScore}
            gradient="from-blue-500 to-cyan-400"
          />

          <Stat
            icon={<BarChart3 size={22} />}
            label="Games played"
            value={stats.summary.games}
            gradient="from-purple-500 to-pink-500"
          />

          <Stat
            icon={<Target size={22} />}
            label="Total clicks"
            value={totalClicks}
            gradient="from-pink-500 to-orange-400"
          />
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-600">
                <Trophy size={18} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                Rankings
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              See how you stack up against other players.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {["global", "daily", "weekly"].map((period, index) => (
              <RankCard
                key={period}
                period={period}
                rank={ranks[period]?.rank}
                score={ranks[period]?.score}
                mode={ranks[period]?.mode}
                ranked={ranks[period]?.ranked}
                index={index}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <History size={18} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                Game history
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Keep track of your recent ClickRush challenges.
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-xl shadow-slate-200/50">
            <div className="hidden md:block">
              <div className="grid grid-cols-[7rem_1fr_7rem_12rem] items-center gap-4 bg-slate-50/70 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Mode</span>
                <span>Clicks</span>
                <span>Score</span>
                <span>Date</span>
              </div>

              {games.map((game) => (
                <div
                  key={game._id}
                  className="grid grid-cols-[7rem_1fr_7rem_12rem] items-center gap-4 border-t border-slate-100 px-6 py-5 transition hover:bg-purple-50/30"
                >
                  <span
                    className={`w-max rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold uppercase ${
                      game.mode === "easy"
                  ? "bg-[#e9f8ef] text-[#249556]"
                  : game.mode === "medium"
                    ? "bg-[#fff3dc] text-[#bd7715]"
                    : "bg-[#ffe7ed] text-[#d44161]"
              }`}
                  >
                    {game.mode}
                  </span>

                  <span className="font-medium text-slate-700">
                    {game.clicks}
                  </span>

                  <strong className="font-black text-slate-900">
                    {Number(game.score || 0).toLocaleString()}
                  </strong>

                  <span className="text-sm text-slate-400">
                    {new Date(game.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {games.map((game) => (
                <div key={game._id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold uppercase ${
                        game.mode === "easy"
                          ? "text-green-600"
                          : game.mode === "medium"
                            ? "text-yellow-500"
                            : "text-red-600"
                      }`}
                    >
                      {game.mode}
                    </span>

                    <div className="text-right">
                      <span className="block text-xs text-slate-400">
                        Score
                      </span>

                      <strong className="text-xl font-black text-slate-900">
                        {Number(game.score || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>{game.clicks} clicks</span>

                    <span className="max-w-[11rem] truncate text-right">
                      {new Date(game.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {!games.length && (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-purple-50 text-purple-500">
                  <Gamepad2 size={24} />
                </div>

                <h3 className="font-bold text-slate-800">No games yet</h3>

                <p className="mt-1 text-sm text-slate-400">
                  Play a game to start building your history.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-[2rem] bg-linear-to-r from-blue-500 via-purple-600 to-pink-500 px-6 py-10 text-center shadow-xl shadow-purple-500/10 sm:px-10">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Ready for another challenge?
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
            Jump back in and see if you can beat your best score.
          </p>

          <a
            href="/play"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-purple-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Gamepad2 size={18} />
            Play now
          </a>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, label, value, gradient }) {
  return (
    <div className="rounded-[1.5rem] border border-white bg-white p-5 shadow-lg shadow-slate-200/50 transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-6">
      <div
        className={`mb-5 grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br ${gradient} text-white shadow-md`}
      >
        {icon}
      </div>

      <span className="block text-sm font-medium text-slate-500">
        {label}
      </span>

      <strong className="mt-1 block text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        {Number(value || 0).toLocaleString()}
      </strong>
    </div>
  );
}

function RankCard({ period, rank, score, mode, ranked, index }) {
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-500",
    "from-pink-500 to-orange-400",
  ];

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white bg-white p-6 shadow-lg shadow-slate-200/50 transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-linear-to-br ${gradients[index]} opacity-10`}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold capitalize text-slate-500">
            {period} ranking
          </span>

          {mode && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide text-slate-500">
              {mode}
            </span>
          )}
        </div>

        <strong className="mt-3 block text-4xl font-black tracking-tight text-slate-900">
          {ranked && rank ? `#${rank}` : "—"}
        </strong>

        <span className="mt-1 block text-sm text-slate-400">
          {ranked
            ? `${Number(score || 0).toLocaleString()} points`
            : "Not currently ranked"}
        </span>

        {!ranked && (
          <p className="mt-3 text-xs leading-5 text-slate-400">
            You have not reached the qualifying score for this leaderboard.
          </p>
        )}
      </div>
    </div>
  );
}