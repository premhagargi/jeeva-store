"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Search as SearchIcon, Clock, TrendingUp, X } from "lucide-react";
import ProductCard from "@/app/components/products/ProductCard";
import { ShimmerCardGrid } from "@/app/components/ShimmerCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  unit: string;
  quantityValue: number | null;
  price: number;
  emoji: string;
  bg: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface CategorySuggestion {
  id: string;
  slug: string;
  name: string;
  productCount: number;
  emoji: string;
  bg: string;
}

const RECENT_KEY = "jeeva-recent-searches";
const TRENDING_TERMS = ["Rice", "Milk", "Soap", "Bread", "Eggs", "Sugar", "Oil", "Atta"];

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string").slice(0, 4) : [];
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  if (typeof window === "undefined") return;
  const t = term.trim();
  if (!t) return;
  const existing = loadRecent().filter((s) => s.toLowerCase() !== t.toLowerCase());
  const next = [t, ...existing].slice(0, 4);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(loadRecent());
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Read initial search params
  useEffect(() => {
    const getParams = async () => {
      const { q } = await searchParams;
      const initialQuery = (q ?? "").trim();
      setQuery(initialQuery);
      if (initialQuery) {
        await performSearch(initialQuery);
      }
    };
    getParams();
  }, [searchParams]);

  // Force-focus the input on mount (autoFocus alone is unreliable after client-side nav, especially on mobile)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const focus = () => {
      el.focus();
      // Move caret to end so the user can keep typing
      const len = el.value.length;
      try { el.setSelectionRange(len, len); } catch {}
    };
    focus();
    const t = setTimeout(focus, 80);
    return () => clearTimeout(t);
  }, []);

  async function performSearch(searchQuery: string) {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        setRecommendations([]);
        return;
      }
      const data = await res.json();
      setRecommendations(data.products || []);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(q)}`);
    await performSearch(q);
    inputRef.current?.blur();
  };

  // Debounced live search as the user types
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      if (hasSearched && q.length === 0) {
        setRecommendations([]);
        setHasSearched(false);
      }
      return;
    }
    const t = setTimeout(() => {
      window.history.replaceState(null, "", `/search?q=${encodeURIComponent(q)}`);
      performSearch(q);
      saveRecent(q);
      setRecent(loadRecent());
    }, 250);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  function pickTerm(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  function clearRecent() {
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {}
    setRecent([]);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>

        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <SearchIcon size={16} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              enterKeyHint="search"
              placeholder="Search products, categories..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRecommendations([]);
                  setHasSearched(false);
                  window.history.replaceState(null, "", "/search");
                  inputRef.current?.focus();
                }}
                aria-label="Clear"
                className="text-gray-400 active:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>

      {!hasSearched && query === "" ? (
        <div className="px-4 pt-4 pb-8 flex flex-col gap-5">
          {recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                    Recent
                  </p>
                </div>
                <button
                  onClick={clearRecent}
                  className="text-[11px] font-semibold text-gray-400 active:text-gray-600"
                >
                  Clear
                </button>
              </div>
              <div className="flex gap-2 overflow-hidden">
                {recent.slice(0, 4).map((t) => (
                  <button
                    key={t}
                    onClick={() => pickTerm(t)}
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-100 rounded-full pl-3 pr-2 py-1.5 text-[12px] font-semibold text-gray-700 active:bg-gray-50 shrink-0 min-w-0"
                  >
                    <span className="truncate max-w-[110px]">{t}</span>
                    <span
                      role="button"
                      aria-label={`Remove ${t}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = recent.filter((s) => s !== t);
                        setRecent(next);
                        try {
                          window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
                        } catch {}
                      }}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 active:text-gray-700"
                    >
                      <X size={11} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={13} className="text-emerald-500" />
              <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                Trending
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TERMS.map((t) => (
                <button
                  key={t}
                  onClick={() => pickTerm(t)}
                  className="bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 text-[12px] font-semibold text-emerald-700 active:bg-emerald-100"
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {categories.length > 0 && (
            <section>
              <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Browse categories
              </p>
              <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl shadow-sm ${c.bg} group-active:scale-95 transition-transform`}
                    >
                      {c.emoji}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700 text-center leading-snug line-clamp-2">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Type to search across all products
          </p>
        </div>
      ) : loading ? (
        // Shimmer skeleton while searching
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <LoaderSpinner />
            <p className="text-[12px] text-gray-400">Searching for "{query}"...</p>
          </div>
          <ShimmerCardGrid count={6} />
        </div>
      ) : recommendations.length === 0 && hasSearched ? (
        <div className="px-8 py-16 text-center">
          <div className="text-5xl mb-3">🤔</div>
          <p className="text-[14px] font-semibold text-gray-700">No matches for "{query}"</p>
          <p className="text-[12px] text-gray-400 mt-1">Try a shorter or different term.</p>
        </div>
      ) : (
        <>
          <p className="px-4 pt-4 pb-2 text-[12px] text-gray-500">
            {recommendations.length} result{recommendations.length === 1 ? "" : "s"} for "{query}"
          </p>
          <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LoaderSpinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  );
}