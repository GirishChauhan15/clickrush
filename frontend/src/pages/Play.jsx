import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LightbulbIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import demoGif from "../assets/demo.png";
import { api } from "../api";

function DifficultyOption({ value, selected, onChange }) {
  return (
    <label className="inline-flex cursor-pointer">
      <input
        type="radio"
        name="difficulty"
        value={value}
        checked={selected}
        onChange={onChange}
        className="peer sr-only"
      />

      <span
        className={`
          inline-flex min-w-[4.75rem] items-center justify-center
          whitespace-nowrap rounded-full
          border border-[#e3e0e9] bg-[#f8f7fa]
          px-4 py-2
          text-xs font-semibold text-black
          transition-colors duration-200
          hover:border-[#bcb5ca]
          ${selected ? "" : "hover:bg-[#d9d8d8]"}
          peer-checked:border-[#171719]
          peer-checked:bg-[#171719]
          peer-checked:text-white
          peer-checked:shadow-[0_5px_12px_rgba(23,23,25,0.15)]
          peer-focus-visible:outline-none
          peer-focus-visible:ring-2
          peer-focus-visible:ring-[#171719]
          peer-focus-visible:ring-offset-2
        `}
      >
        {value}
      </span>
    </label>
  );
}

const COLORS = [
  { name: "Blue", color: "bg-blue-500", text: "text-blue-500" },
  { name: "Red", color: "bg-red-500", text: "text-red-500" },
  { name: "Orange", color: "bg-orange-500", text: "text-orange-500" },
  { name: "Yellow", color: "bg-yellow-400", text: "text-yellow-400" },
  { name: "Gray", color: "bg-gray-600", text: "text-gray-600" },
  { name: "Lime", color: "bg-lime-400", text: "text-lime-400" },
  { name: "Black", color: "bg-black", text: "text-black" },
  { name: "Purple", color: "bg-purple-600", text: "text-purple-600" },
  { name: "Pink", color: "bg-pink-500", text: "text-pink-500" },
];

const LEVEL_CONFIG = {
  Easy: {
    colors: 4,
    wrongPenalty: 150,
    columns: "grid-cols-2",
    tile: "size-20 sm:size-24 lg:size-28",
  },
  Medium: {
    colors: 6,
    wrongPenalty: 250,
    columns: "grid-cols-3",
    tile: "size-20 sm:size-24 lg:size-28",
  },
  Hard: {
    colors: 9,
    wrongPenalty: 400,
    columns: "grid-cols-3",
    tile: "size-20 sm:size-24 lg:size-28",
  },
};

function Play() {
  const { user, setUser } = useAuth();

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [gameStart, setGameStart] = useState(false);
  const [end, setEnd] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [level, setLevel] = useState("Easy");
  const [htp, setHTP] = useState(false);

  const [randomColor, setRandomColor] = useState([]);
  const [chosenColor, setChosenColor] = useState(null);
  const [textRandomColor, setTextRandomColor] = useState(null);

  const [score, setScore] = useState(0);
  const [correctClk, setCorrectClk] = useState(0);
  const [incorrectClk, setIncorrectClk] = useState(0);
  const [time, setTime] = useState(60);

  const scoreTimeoutRef = useRef(null);

  const config = LEVEL_CONFIG[level];
  const mode = level.toLowerCase();
  const currentHighScore = user?.highScores?.[mode] ?? 0;

  const generateRound = useCallback(() => {
    const amount = LEVEL_CONFIG[level].colors;
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    const availableColors = shuffled.slice(0, amount);

    const answer =
      availableColors[Math.floor(Math.random() * availableColors.length)];

    const textColor =
      availableColors[Math.floor(Math.random() * availableColors.length)];

    setRandomColor(availableColors);
    setChosenColor(answer);
    setTextRandomColor(textColor);
  }, [level]);

  async function finish() {
    const totalClicks = correctClk + incorrectClk;

    const accuracy =
      totalClicks === 0 ? 0 : (correctClk / totalClicks) * 100;

    if (!user) {
      setResult({
        guest: true,
        mode,
        newHighScore: false,
        score,
        correct: correctClk,
        incorrect: incorrectClk,
        highScore: 0,
        accuracy,
      });

      return;
    }

    try {
      const { data } = await api.post("/games/submit", {
        mode,
        accuracy,
        correctClicks: correctClk,
        incorrectClicks: incorrectClk,
        score,
      });

      setResult(data);

      setUser((previous) => ({
        ...previous,
        highScores: data.highScores,
      }));
    } catch (err) {
      // console.error("SUBMIT GAME ERROR:", err);

      setError(
        err.response?.data?.message || "Could not submit score"
      );
    }
  }

  useEffect(() => {
    if (!gameStart || paused) return;

    const interval = setInterval(() => {
      setTime((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStart, paused]);

  useEffect(() => {
    if (time !== 0 || !gameStart) return;

    setGameStart(false);
    setPaused(false);
    setEnd(true);

    finish();
  }, [time, gameStart, score, level]);

  const startGame = () => {
    setEnd(false);
    setGameStart(true);
    setPaused(false);
    setScore(0);
    setCorrectClk(0);
    setIncorrectClk(0);
    setTime(60);
    setError("");
    generateRound();
  };

  const exitGame = () => {
    setGameStart(false);
    setPaused(false);
    setEnd(false);
    setTime(60);
  };

  const pauseGame = () => {
    setPaused((previous) => !previous);
  };

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
  };

  const handleColorClick = (color) => {
    if (!chosenColor || time === 0 || paused) return;

    const isCorrect = color.name === chosenColor.name;

    if (isCorrect) {
      setScore((previous) => previous + 100);
      setCorrectClk((previous) => previous + 1);
    } else {
      setScore((previous) =>
        Math.max(0, previous - config.wrongPenalty)
      );
      setIncorrectClk((previous) => previous + 1);
    }

    setCorrect(isCorrect);
    setShowScore(true);

    clearTimeout(scoreTimeoutRef.current);

    scoreTimeoutRef.current = setTimeout(() => {
      setShowScore(false);
    }, 450);

    generateRound();
  };

  useEffect(() => {
    return () => clearTimeout(scoreTimeoutRef.current);
  }, []);

  const feedbackText = useMemo(
    () => (correct ? "+100" : `-${config.wrongPenalty}`),
    [correct, config.wrongPenalty]
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(116,103,240,0.1),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(255,91,130,0.08),transparent_30%),#f7f6fa] font-space">
      {!gameStart && !end && (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-[2.5rem] py-[1rem]">
          <button
            onClick={() => setHTP(true)}
            className="absolute right-7 top-7 grid h-[3rem] w-[3rem] cursor-pointer place-items-center rounded-[14px] border border-[#dddbe5] bg-white/75 text-xl font-extrabold text-[#6f687b] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_25px_rgba(30,25,45,0.1)] max-sm:right-[1rem] max-sm:top-[1rem] max-sm:h-10 max-sm:w-10"
            aria-label="How to play"
          >
            ?
          </button>

          <div className="relative z-[2] w-full max-w-[32.5rem] rounded-[2rem] border border-white/80 bg-white/80 px-[2.5rem] pb-[2.5rem] pt-[3rem] text-center shadow-[0_30px_80px_rgba(37,30,61,0.1),0_5px_20px_rgba(37,30,61,0.05)] backdrop-blur-[20px] max-sm:rounded-[25px] max-sm:px-[1.5rem] max-sm:pb-7 max-sm:pt-[2rem]">
            {!user && (
              <div className="absolute -top-15 right-10 rounded-full border border-[#13121273] px-2.5 py-[.5rem] text-xs text-[#050505]">
                <span>Guest mode</span>
              </div>
            )}

            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[20px] bg-[#171719] text-[1.8rem] shadow-[0_12px_25px_rgba(0,0,0,0.16)]">
              🎨
            </div>

            <p className="mb-2 text-[11px] font-extrabold tracking-[0.2em] text-[#8a8495]">
              COLOR REACTION GAME
            </p>

            <h1 className="m-0 text-[clamp(42px,9vw,68px)] font-extrabold leading-[0.95] tracking-[-0.07em] text-[#171719]">
              Click
              <span className="block bg-linear-to-r from-[#5961e9] via-[#8c6cf3] to-[#e05f9b] bg-clip-text text-transparent">
                Rush
              </span>
            </h1>

            <p className="my-[1.2rem] mb-[1.8rem] text-[1rem] leading-[1.6] text-[#77717f]">
              Think fast. Ignore the distraction.
              <br />
              Choose the color the word means.
            </p>

            <div className="mb-[1.5rem]">
              <p className="mb-3 text-[.8rem] font-extrabold tracking-[0.16em] text-[#8a8495]">
                SELECT DIFFICULTY
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <DifficultyOption
                  value="Easy"
                  selected={level === "Easy"}
                  onChange={handleLevelChange}
                />

                <DifficultyOption
                  value="Medium"
                  selected={level === "Medium"}
                  onChange={handleLevelChange}
                />

                <DifficultyOption
                  value="Hard"
                  selected={level === "Hard"}
                  onChange={handleLevelChange}
                />
              </div>
            </div>

            <button
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[15px] border-0 bg-[#171719] px-[1.4rem] py-[1rem] text-[1rem] font-extrabold text-white shadow-[0_12px_24px_rgba(23,23,25,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2c2b30] hover:shadow-[0_16px_30px_rgba(23,23,25,0.2)] active:translate-y-px"
              onClick={startGame}
            >
              <span>▶</span>
              Start Game
            </button>

            {currentHighScore > 0 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-[.6rem] font-bold text-[#918b9a]">
                <span>BEST SCORE</span>
                <strong className="text-[1rem] text-[#7467f0]">
                  {currentHighScore}
                </strong>
              </div>
            )}
          </div>

          {htp && (
            <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(20,18,25,0.48)] p-5 backdrop-blur-[.8rem]">
              <div className="relative max-h-[90vh] w-full max-w-[37.5rem] overflow-y-auto rounded-[28px] bg-white p-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.2)] max-sm:px-5 max-sm:py-[1.5rem]">
                <button
                  className="absolute right-[1.1rem] top-[1.1rem] grid h-[2rem] w-[2rem] cursor-pointer place-items-center rounded-full border-0 bg-[#f1eff5] text-[25px] leading-none text-[#67616f]"
                  onClick={() => setHTP(false)}
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="mb-[1.5rem] overflow-hidden rounded-[18px] bg-[#f4f3f7]">
                  <img
                    className="block max-h-[15rem] w-full object-contain"
                    src={demoGif}
                    alt="How to play demonstration"
                  />
                </div>

                <p className="mb-2 text-[11px] font-extrabold tracking-[0.2em] text-[#8a8495]">
                  HOW TO PLAY
                </p>

                <h2 className="mb-[1.5rem] text-[1.8rem] font-bold">
                  Beat the distraction.
                </h2>

                <div className="grid gap-3">
                  <div className="flex items-start gap-4 rounded-[15px] bg-[#f7f6fa] p-4">
                    <span className="text-xs font-extrabold text-[#7467f0]">
                      01
                    </span>

                    <p className="m-0 text-[14px] leading-[1.5] text-[#686270]">
                      Look at the <strong>word</strong> displayed in the center.
                    </p>
                  </div>

                  <div className="flex items-start gap-4 rounded-[15px] bg-[#f7f6fa] p-4">
                    <span className="text-xs font-extrabold text-[#7467f0]">
                      02
                    </span>

                    <p className="m-0 text-[14px] leading-[1.5] text-[#686270]">
                      Ignore the color the word is actually
                      <strong> written in</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-4 rounded-[15px] bg-[#f7f6fa] p-4">
                    <span className="text-xs font-extrabold text-[#7467f0]">
                      03
                    </span>

                    <p className="m-0 text-[14px] leading-[1.5] text-[#686270]">
                      Tap the tile that matches the
                      <strong> meaning of the word</strong>.
                    </p>
                  </div>
                </div>

                <div className="mt-[18px] flex gap-3 rounded-[15px] border border-[#e6e2ff] bg-[#f5f3ff] p-4">
                  <span>
                    <LightbulbIcon size={18} />
                  </span>

                  <p className="m-0 text-[13px] leading-[1.5] text-[#625b77]">
                    <strong>Remember:</strong> the word's meaning matters, not
                    the ink color.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {gameStart && (
        <section className="relative mx-auto min-h-screen w-full max-w-[56.25rem] px-5 pb-[3.125rem] pt-6">
          <div className="mx-auto grid max-w-[37rem] grid-cols-[1fr_auto_1fr] items-center gap-3 max-sm:gap-[0.5rem]">
            <div className="flex flex-col rounded-[1rem] border border-[#e3e0e9] bg-white/80 px-4 py-[0.8rem] shadow-[0_0.3125rem_0.9375rem_rgba(40,34,50,0.04)] max-sm:px-[0.8rem] max-sm:py-[0.6rem]">
              <span className="text-[0.6rem] font-extrabold tracking-[0.12em] text-[#a09aa8]">
                TIME
              </span>

              <strong
                className={`mt-[0.125rem] text-[1.25rem] max-sm:text-[1.0625rem] ${
                  time <= 10 ? "text-[#ed4d69]" : ""
                }`}
              >
                00:{String(time).padStart(2, "0")}
              </strong>
            </div>

            <div className="flex flex-col rounded-[0.9375rem] border border-[#e3e0e9] bg-white/80 px-4 py-[0.6875rem] text-center shadow-[0_0.3125rem_0.9375rem_rgba(40,34,50,0.04)] max-sm:px-[0.6875rem] max-sm:py-[0.5625rem]">
              <span className="text-[0.5625rem] font-extrabold tracking-[0.12em] text-[#a09aa8]">
                SCORE
              </span>

              <strong className="mt-[0.125rem] text-[1.25rem] text-[#7467f0] max-sm:text-[1.0625rem]">
                {score}
              </strong>
            </div>

            <button
              className="h-[3rem] w-[3rem] cursor-pointer justify-self-end rounded-[0.9375rem] border border-[#ddd9e5] bg-white text-[1rem] font-extrabold text-[#39353e] shadow-[0_0.3125rem_0.9375rem_rgba(40,34,50,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0.625rem_1.375rem_rgba(40,34,50,0.1)] max-sm:h-[2.6875rem] max-sm:w-[2.6875rem]"
              onClick={pauseGame}
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span
              className={`rounded-full px-[0.625rem] py-[0.3125rem] text-[0.625rem] font-extrabold uppercase tracking-[0.08em] ${
                level === "Easy"
                  ? "bg-[#e9f8ef] text-[#249556]"
                  : level === "Medium"
                    ? "bg-[#fff3dc] text-[#bd7715]"
                    : "bg-[#ffe7ed] text-[#d44161]"
              }`}
            >
              {level}
            </span>

            <span className="text-[0.6875rem] font-bold text-[#9a94a2]">
              ✓ {correctClk} &nbsp; · &nbsp; ✕ {incorrectClk}
            </span>
          </div>

          <div className="relative mt-[1.5625rem] flex flex-col items-center">
            {showScore && (
              <div
                className={`pointer-events-none absolute left-1/2 top-[-0.625rem] z-10 -translate-x-1/2 animate-ping text-[1.875rem] font-extrabold duration-300 ${
                  correct ? "text-[#22a463]" : "text-[#e14f68]"
                }`}
              >
                {feedbackText}
              </div>
            )}

            <p className="mt-5 text-[0.625rem] font-extrabold tracking-[0.18em] text-[#aaa5b0]">
              SELECT THE MEANING
            </p>

            <div className="grid min-h-[9.6875rem] place-items-center">
              <h2
                className={`m-0 text-[clamp(3rem,10vw,4.75rem)] font-extrabold leading-none tracking-[-0.05em] [text-shadow:0.1875rem_0.1875rem_0_rgba(0,0,0,0.05)] select-none animate-word-appear ${
                  textRandomColor?.text || "text-black"
                }`}
              >
                {chosenColor?.name}
              </h2>
            </div>

            <p className="-mt-2 mb-[1.5625rem] text-xs text-[#aaa5b0]">
              Which color does this word represent?
            </p>

            <div
              className={`grid justify-center gap-[0.8125rem] max-sm:gap-[0.625rem] ${config.columns}`}
            >
              {randomColor.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorClick(color)}
                  className={`group relative cursor-pointer rounded-[1.1875rem] border-0 shadow-[inset_0_0_0_0.0625rem_rgba(0,0,0,0.12),0_0.5rem_1.125rem_rgba(35,30,45,0.1)] transition duration-[130ms] hover:scale-[1.025] hover:shadow-[inset_0_0_0_0.125rem_rgba(255,255,255,0.65),0_0.875rem_1.5625rem_rgba(35,30,45,0.15)] active:scale-[0.93] active:shadow-[inset_0_0.9375rem_0_rgba(255,255,255,0.45)] ${color.color} ${config.tile}`}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {paused && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(20,18,25,0.45)] p-5 backdrop-blur-[0.625rem]">
              <div className="w-full max-w-[24.375rem] rounded-[1.75rem] bg-white p-[2.375rem] text-center shadow-[0_1.875rem_5rem_rgba(0,0,0,0.2)]">
                <div className="mx-auto mb-5 grid h-[3.75rem] w-[3.75rem] place-items-center rounded-[1.125rem] bg-[#171719] text-[1.125rem] text-white">
                  Ⅱ
                </div>

                <p className="mb-2 text-[0.6875rem] font-extrabold tracking-[0.2em] text-[#8a8495]">
                  GAME PAUSED
                </p>

                <h2 className="my-2 text-[1.875rem] font-bold">
                  Take a breath.
                </h2>

                <p className="mb-[1.5625rem] text-[0.875rem] text-[#89838f]">
                  Your score and timer are waiting for you.
                </p>

                <button
                  className="mb-3 flex w-full cursor-pointer items-center justify-center gap-[0.625rem] rounded-[0.9375rem] border-0 bg-[#171719] px-[1.375rem] py-[0.9375rem] text-[0.9375rem] font-extrabold text-white shadow-[0_0.75rem_1.5rem_rgba(23,23,25,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2c2b30] hover:shadow-[0_1rem_1.875rem_rgba(23,23,25,0.2)] active:translate-y-px"
                  onClick={pauseGame}
                >
                  ▶ Continue
                </button>

                <button
                  className="w-full cursor-pointer rounded-[0.9375rem] border border-[#dddbe5] bg-white px-5 py-[0.8125rem] font-bold text-[#5e5967] transition duration-200 hover:bg-[#f5f4f8]"
                  onClick={exitGame}
                >
                  Exit Game
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {end && (
        <section className="relative grid min-h-screen place-items-center px-[1.8rem] py-[1.2rem]">
          <div className="w-full max-w-[31.25rem] rounded-[1.875rem] border border-white/80 bg-white/90 p-[2.375rem] text-center shadow-[0_1.875rem_5rem_rgba(37,30,61,0.1)] max-sm:px-5 max-sm:py-[1.875rem]">
            <div className="mb-2 text-[2.625rem]">
              {result?.newHighScore ? "🏆" : "⚡"}
            </div>

            <p className="mb-2 text-[0.6875rem] font-extrabold tracking-[0.2em] text-[#8a8495]">
              TIME'S UP
            </p>

            <h1 className="my-[0.3125rem] mb-[1.125rem] text-[2.625rem] font-bold tracking-[-0.05em] max-sm:text-[2.1875rem]">
              Game Over
            </h1>

            {result?.newHighScore && (
              <div className="inline-block rounded-full bg-[#f0edff] px-3 py-[0.4375rem] text-[0.625rem] font-extrabold tracking-[0.08em] text-[#7467f0]">
                ✨ NEW RECORD ✨
              </div>
            )}

            <div className="my-[1.5625rem] flex flex-col">
              <span className="text-[0.625rem] font-extrabold tracking-[0.16em] text-[#a09aa8]">
                YOUR SCORE
              </span>

              <strong className="mt-[0.125rem] text-xl text-[#7467f0] max-sm:text-[1.0625rem]">
                {result?.score}
              </strong>
            </div>

            <div className="mb-7 grid grid-cols-3 overflow-hidden rounded-[1.125rem] border border-[#ebe8f0]">
              <div className="flex flex-col items-center border-r border-[#ebe8f0] p-4 max-sm:px-2">
                <span className="mb-1 text-[1.0625rem] text-[#25a263]">
                  ✓
                </span>

                <strong className="text-[1.3125rem]">
                  {result?.correct}
                </strong>

                <small className="mt-[0.125rem] text-[0.5625rem] font-bold uppercase text-[#aaa4b0]">
                  Correct
                </small>
              </div>

              <div className="flex flex-col items-center border-r border-[#ebe8f0] p-4 max-sm:px-2">
                <span className="mb-1 text-[1.0625rem] text-[#e05a72]">
                  ×
                </span>

                <strong className="text-[1.3125rem]">
                  {result?.incorrect}
                </strong>

                <small className="mt-[0.125rem] text-[0.5625rem] font-bold uppercase text-[#aaa4b0]">
                  Incorrect
                </small>
              </div>

              <div className="flex flex-col items-center p-4 max-sm:px-2">
                <span className="mb-1 text-[1.0625rem] text-[#7467f0]">
                  🏆
                </span>

                <strong className="text-[0.875rem] text-[#7467f0]">
                  {result?.highScore}
                </strong>

                <small className="mt-[0.125rem] text-[0.5625rem] font-bold uppercase text-[#aaa4b0]">
                  Best
                </small>
              </div>
            </div>

            <div className="mb-[1.5625rem] text-left">
              <div className="mb-2 flex justify-between text-[0.6875rem] font-bold text-[#8f8997]">
                <span>Accuracy</span>

                <strong className="text-[#7467f0]">
                  {result?.correct + result?.incorrect === 0
                    ? 0
                    : Math.round(
                        (result?.correct /
                          (result?.correct + result?.incorrect)) *
                          100
                      )}
                  %
                </strong>
              </div>

              <div className="flex h-[0.625rem] w-full overflow-hidden rounded-full bg-slate-200">
                <progress
                  className="h-full w-full appearance-none [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-linear-to-r [&::-webkit-progress-value]:from-blue-500 [&::-webkit-progress-value]:via-purple-500 [&::-webkit-progress-value]:to-pink-500 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-purple-500"
                  value={result?.correct}
                  max={result?.correct + result?.incorrect || 1}
                />
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-3 text-[0.625rem] font-extrabold tracking-[0.16em] text-[#8a8495]">
                PLAY AGAIN
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <DifficultyOption
                  value="Easy"
                  selected={level === "Easy"}
                  onChange={handleLevelChange}
                />

                <DifficultyOption
                  value="Medium"
                  selected={level === "Medium"}
                  onChange={handleLevelChange}
                />

                <DifficultyOption
                  value="Hard"
                  selected={level === "Hard"}
                  onChange={handleLevelChange}
                />
              </div>
            </div>

            <button
              className="flex w-full cursor-pointer items-center justify-center gap-[0.625rem] rounded-[0.9375rem] border-0 bg-[#171719] px-[1.375rem] py-[0.9375rem] text-[0.9375rem] font-extrabold text-white shadow-[0_0.75rem_1.5rem_rgba(23,23,25,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2c2b30] hover:shadow-[0_1rem_1.875rem_rgba(23,23,25,0.2)] active:translate-y-px"
              onClick={startGame}
            >
              ↻ Play Again
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Play;