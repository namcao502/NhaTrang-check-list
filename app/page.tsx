"use client";

import { useChecklist } from "@/lib/useChecklist";
import CategorySection from "@/components/CategorySection";
import ChecklistStats from "@/components/ChecklistStats";
import AddCategoryForm from "@/components/AddCategoryForm";

export default function Home() {
  const {
    categories,
    loaded,
    totalItems,
    checkedItems,
    toggleItem,
    addItem,
    removeItem,
    addCategory,
    renameItem,
    updateNote,
    renameCategory,
    bulkToggleCategory,
    resetAll,
  } = useChecklist();

  if (!loaded) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12 text-center text-gray-400">
        Đang tải...
      </main>
    );
  }

  const allDone = checkedItems === totalItems && totalItems > 0;

  return (
    <>
      {/* Animated wave bar */}
      <div
        className="fixed top-0 left-0 w-full h-2 z-50 animate-wave-shift"
        style={{
          background: "linear-gradient(90deg, #ffd60a, #f77f00, #0077b6, #ffd60a)",
          backgroundSize: "300% 100%",
        }}
      />

      <main className="max-w-xl mx-auto px-4 pt-4 pb-10">
        <header className="text-center mb-8">
          <div className="inline-block bg-coral-100 text-coral-600 text-sm font-medium px-4 py-1.5 rounded-full mb-3">
            ✈️ Kế hoạch chuyến đi
          </div>
          <h1 className="text-4xl font-bold font-playfair text-gray-900 mb-2">
            Nha Trang Packing List
          </h1>
          <p className="text-gray-600 text-sm">🏖️ Biển · 🎢 Vinwonders · 🦁 Safari</p>
        </header>

        {allDone && (
          <div className="mb-4 text-center bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-green-700 font-medium">
            🎉 Đã chuẩn bị xong! Chúc cả gia đình có chuyến đi tuyệt vời! 🌊
          </div>
        )}

        <div className="flex flex-col gap-4">
          <ChecklistStats
            checked={checkedItems}
            total={totalItems}
            onReset={resetAll}
          />

          {categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              onToggleItem={(itemId) => toggleItem(cat.id, itemId)}
              onAddItem={(label, tag) => addItem(cat.id, label, tag)}
              onRemoveItem={(itemId) => removeItem(cat.id, itemId)}
              onRenameCategory={(newName) => renameCategory(cat.id, newName)}
              onBulkToggle={() => bulkToggleCategory(cat.id)}
              onRenameItem={(itemId, newLabel) => renameItem(cat.id, itemId, newLabel)}
              onNoteChange={(itemId, note) => updateNote(cat.id, itemId, note)}
            />
          ))}

          <AddCategoryForm onAdd={addCategory} />
        </div>
      </main>
    </>
  );
}
