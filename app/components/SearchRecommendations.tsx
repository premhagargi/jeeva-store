"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import ProductCard from "./products/ProductCard";

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

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 20;

export default function SearchRecommendations() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch recommendations with debounce
  const fetchRecommendations = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        setRecommendations([]);
        return;
      }
      const data = await res.json();
      setRecommendations(data.products?.slice(0, MAX_RESULTS) ?? []);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchRecommendations(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, fetchRecommendations]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400 focus-within:shadow-md"
      >
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowResults(true);
          }}
          onBlur={() => setIsFocused(false)}
          onClick={() => setShowResults(true)}
          placeholder='Search for "rice", "soap"...'
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setRecommendations([]);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <Loader2 size={14} className="text-gray-400 animate-spin shrink-0" />
        )}
      </form>

      {/* Inline search results panel */}
      {showResults && (query.length >= MIN_QUERY_LENGTH || recommendations.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-3 grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-3">
                  <div className="aspect-square rounded-xl bg-gray-100 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            query.length >= MIN_QUERY_LENGTH ? (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🤔</div>
                <p className="text-[13px] font-semibold text-gray-700">
                  No matches for &quot;{query}&quot;
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Try a shorter or different term.</p>
              </div>
            ) : null
          ) : (
            <>
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {recommendations.length} result{recommendations.length === 1 ? "" : "s"}
              </p>
              <div className="p-3 grid grid-cols-2 gap-3">
                {recommendations.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}