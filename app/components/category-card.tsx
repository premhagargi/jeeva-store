"use client";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  bg: string;
}

interface CategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={() => onClick?.(category)}
      className="flex flex-col items-center gap-2 group w-full"
    >
      {/* Emoji box */}
      <div
        className={`w-full aspect-square rounded-2xl flex items-center justify-center text-4xl ${category.bg} transition-all duration-150 group-active:scale-95 group-hover:brightness-95 shadow-sm`}
      >
        {category.emoji}
      </div>

      {/* Label — fixed 2-line height keeps grid aligned */}
      <span className="text-[11.5px] font-semibold text-gray-700 text-center leading-snug line-clamp-2 w-full px-0.5">
        {category.name}
      </span>
    </button>
  );
}