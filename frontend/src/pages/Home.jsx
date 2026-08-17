import {
  Play,
  Trophy,
  Brain,
  Timer,
  Users,
  Star,
  ChevronRight,
  MousePointerClickIcon,
  ZapIcon,
  Gamepad,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "Brain Training",
      text: "Improve focus and attention.",
    },
    {
      icon: Timer,
      title: "Fast Gameplay",
      text: "Quick 60-second challenges.",
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      text: "Compete globally.",
    },
    {
      icon: Users,
      title: "Profiles",
      text: "Track stats and progress.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f9ff] font-space text-slate-800">
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-15 lg:flex-row">
        <div className="flex-1">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm font-medium">
              The Ultimate Brain Challenge
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Match Colors.
            <br />
            <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Beat Time.
            </span>
            <br />
            Train Your Brain.
          </h1>

          <p className="mt-8 max-w-xl text-lg text-slate-600">
            ClickRush is a fast-paced color reflex game inspired by cognitive
            training apps. Improve focus, reaction speed, memory, and attention
            while competing against players worldwide.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/play"
              className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-105"
            >
              <Gamepad size={20} />
              Start the challenge
            </Link>

            <Link
              to="/leaderboard"
              className="rounded-2xl border-2 border-slate-300 bg-white px-8 py-4 font-semibold transition hover:border-purple-500"
            >
              View leaderboard
            </Link>
          </div>
        </div>

        <div className="mt-16 max-w-96 sm:min-w-96 flex-1 lg:mt-0">
          <div className="relative mx-auto max-w-md rounded-[40px] bg-white p-6 shadow-2xl">
            <div className="rounded-3xl bg-linear-to-br from-blue-50 to-purple-50 p-6">
              <div className="mb-6 flex justify-between">
                <div className="rounded-xl bg-white px-4 py-2 shadow">
                  00:42
                </div>

                <div className="rounded-xl bg-white px-4 py-2 shadow">
                  Score: 1200
                </div>
              </div>

              <h2 className="mb-10 text-center text-5xl font-black text-red-500">
                BLUE
              </h2>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div className="flex h-20 animate-pulse items-end justify-end rounded-2xl bg-blue-500 shadow-lg duration-75">
                  <MousePointerClickIcon className="fill-black animate-none opacity-100" />
                </div>

                <div className="h-20 rounded-2xl bg-green-500 shadow-lg" />

                <div className="h-20 rounded-2xl bg-red-500 shadow-lg" />

                <div className="h-20 rounded-2xl bg-yellow-400 shadow-lg" />

                <div className="hidden h-20 rounded-2xl bg-pink-500 shadow-lg lg:flex" />

                <div className="hidden h-20 rounded-2xl bg-purple-500 shadow-lg lg:flex" />
              </div>
            </div>

            <div className="absolute -right-6 -top-6 flex items-center justify-between gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black shadow-lg">
              +100
              <ZapIcon size={18} className="fill-black" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-15">
        <div className="text-center">
          <h2 className="text-5xl font-black">
            Why Players Love ClickRush
          </h2>

          <p className="mt-4 text-slate-500">
            Fun gameplay mixed with brain training.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <item.icon className="mb-6 text-purple-600" size={40} />

              <h3 className="text-2xl font-bold">{item.title}</h3>

              <p className="mt-3 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-15 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            NO ACCOUNT REQUIRED
          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Ready to see how fast
            <span className="block bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              you really are?
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            Jump into a 60-second challenge. No signup, no setup. Just you,
            your reflexes, and the clock.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4">
            <Link
              to="/play"
              className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl"
            >
              <Play size={18} className="fill-white" />
              Play for free

              <ChevronRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <span className="text-xs text-slate-400">
              Sign in later to save your scores and track your progress.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}