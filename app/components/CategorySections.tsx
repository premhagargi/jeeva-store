"use client";

import CategoryCard, { Category } from "./category-card";

const sections: { title: string; categories: Category[] }[] = [
  {
    title: "Grocery & Kitchen",
    categories: [
      { id: "fruits-veg",   name: "Fruits & Vegetables",    emoji: "🥦", bg: "bg-green-100" },
      { id: "dairy-bread",  name: "Dairy, Bread & Eggs",    emoji: "🥛", bg: "bg-yellow-100" },
      { id: "atta-rice",    name: "Atta, Rice, Oil & Dals", emoji: "🌾", bg: "bg-orange-100" },
      { id: "meat-fish",    name: "Meat, Fish & Eggs",      emoji: "🍗", bg: "bg-red-100" },
      { id: "masala",       name: "Masala & Dry Fruits",    emoji: "🌶️", bg: "bg-amber-100" },
      { id: "breakfast",    name: "Breakfast & Sauces",     emoji: "🥣", bg: "bg-sky-100" },
      { id: "packaged",     name: "Packaged Food",          emoji: "📦", bg: "bg-purple-100" },
      { id: "cold-drinks",  name: "Cold Drinks & Juices",   emoji: "🧃", bg: "bg-cyan-100" },
    ],
  },
  {
    title: "Beauty & Personal Care",
    categories: [
      { id: "skin-care",    name: "Skin Care",              emoji: "🧴", bg: "bg-pink-100" },
      { id: "hair-care",    name: "Hair Care",              emoji: "💆", bg: "bg-fuchsia-100" },
      { id: "oral-care",    name: "Oral Care",              emoji: "🦷", bg: "bg-blue-100" },
      { id: "fragrances",   name: "Fragrances & Deos",      emoji: "🌸", bg: "bg-violet-100" },
      { id: "bath-body",    name: "Bath & Body",            emoji: "🛁", bg: "bg-teal-100" },
      { id: "makeup",       name: "Makeup",                 emoji: "💄", bg: "bg-rose-100" },
      { id: "feminine",     name: "Feminine Care",          emoji: "🌺", bg: "bg-pink-50" },
      { id: "baby-care",    name: "Baby Care",              emoji: "👶", bg: "bg-yellow-50" },
    ],
  },
  {
    title: "Household Essentials",
    categories: [
      { id: "cleaning",     name: "Cleaning Supplies",      emoji: "🧹", bg: "bg-teal-100" },
      { id: "detergent",    name: "Detergents & Fabric",    emoji: "🧺", bg: "bg-indigo-100" },
      { id: "kitchen-tools",name: "Kitchen Tools",          emoji: "🍳", bg: "bg-stone-100" },
      { id: "pooja",        name: "Pooja Needs",            emoji: "🪔", bg: "bg-yellow-100" },
      { id: "stationery",   name: "Stationery & Office",    emoji: "✏️", bg: "bg-blue-50" },
      { id: "pet-care",     name: "Pet Care",               emoji: "🐾", bg: "bg-amber-50" },
      { id: "electrical",   name: "Electrical & Batteries", emoji: "🔋", bg: "bg-gray-100" },
      { id: "health",       name: "Health & Wellness",      emoji: "💊", bg: "bg-green-50" },
    ],
  },
];

export default function CategorySections() {
  return (
    <div className="px-4 py-4 flex flex-col gap-8 bg-white">
      {sections.map((section) => (
        <section key={section.title}>
          {/* Section heading */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
              {section.title}
            </h2>
            <button className="text-xs font-semibold text-emerald-600 active:opacity-60">
              See all
            </button>
          </div>

          {/* 4-column grid */}
          <div className="grid grid-cols-4 gap-x-3 gap-y-5">
            {section.categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}