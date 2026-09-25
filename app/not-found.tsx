import Link from "next/link";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white mb-3">
        404 - Page Not Found
      </h1>
      <p className="text-slate-400 max-w-md text-sm sm:text-base mb-8">
        The celebration venue or page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
        <Link
          href="/events"
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-sm transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Venues
        </Link>
      </div>
    </div>
  );
}
