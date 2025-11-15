import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center py-6 px-10 border-b border-yellow-400/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-extrabold text-xl shadow-yellow-400/40 shadow-md">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Digital Dharmas</h1>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-yellow-300 hover:text-yellow-400 transition font-semibold"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition shadow-yellow-400/40 shadow-md"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-col items-center justify-center text-center flex-1 px-6">
        <span className="bg-yellow-400/20 text-yellow-300 px-4 py-1 rounded-full text-sm font-medium tracking-wide mb-6">
          AI-Powered Climate & Health Platform
        </span>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Predict Health Risks <br />
          <span className="text-yellow-400">Protect Families</span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-gray-300 leading-relaxed">
          Advanced AI simulates climate-driven disease outbreaks, heatwave risks,
          and environmental hazards. Get early warnings, personalized guidance,
          and family-safe alerts — all in one intelligent platform.
        </p>

        <div className="mt-10 flex flex-wrap gap-5 justify-center">
          <Link
            to="/register"
            className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-semibold text-lg hover:bg-yellow-500 transition shadow-yellow-400/40 shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-yellow-400 text-yellow-300 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Login
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-yellow-400/20 text-gray-400 text-sm">
        © 2025 Digital Dharmas — Climate Health Intelligence
      </footer>
    </div>
  );
}
