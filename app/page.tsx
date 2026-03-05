"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useChecklist } from "@/lib/useChecklist";
import CategorySection from "@/components/CategorySection";
import ChecklistStats from "@/components/ChecklistStats";
import AddCategoryForm from "@/components/AddCategoryForm";
import FilterBar from "@/components/FilterBar";
import CountdownBanner from "@/components/CountdownBanner";
import ExportButton from "@/components/ExportButton";
import PrintButton from "@/components/PrintButton";
import UndoButton from "@/components/UndoButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useTemplates } from "@/lib/useTemplates";
import TemplateManager from "@/components/TemplateManager";

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
    removeCategory,
    renameItem,
    updateNote,
    renameCategory,
    bulkToggleCategory,
    resetAll,
    loadCategories,
    updateCategoryIcon,
    moveCategory,
    undo,
    canUndo,
  } = useChecklist();

  const { templates, saveAsTemplate, deleteTemplate } = useTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [mustOnly, setMustOnly] = useState(false);
  const [hideChecked, setHideChecked] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const allDone = checkedItems === totalItems && totalItems > 0;

  const prevAllDone = useRef(false);
  useEffect(() => {
    if (!loaded) {
      prevAllDone.current = allDone; // prime ref during loading so first real eval is accurate
      return;
    }
    if (allDone && !prevAllDone.current) {
      import('canvas-confetti').then((mod) => {
        mod.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      });
    }
    prevAllDone.current = allDone;
  }, [allDone, loaded]);

  // Stable undo ref so the keyboard handler doesn't re-bind on every canUndo change
  const undoRef = useRef(undo);
  undoRef.current = undo;
  const canUndoRef = useRef(canUndo);
  canUndoRef.current = canUndo;

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Ctrl+Z / Cmd+Z -> undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInput) {
      if (canUndoRef.current) {
        e.preventDefault();
        undoRef.current();
      }
      return;
    }

    // "/" -> focus search
    if (e.key === '/' && !isInput) {
      e.preventDefault();
      searchInputRef.current?.focus();
      return;
    }

    // Escape in search -> clear and blur
    if (e.key === 'Escape' && target === searchInputRef.current) {
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  if (!loaded) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12 text-center text-gray-400 dark:text-gray-400">
        Đang tải...
      </main>
    );
  }

  const anyFilterActive = searchQuery.trim() !== '' || mustOnly || hideChecked;

  const visibleCategories = categories
    .map((cat) => {
      let items = cat.items;
      if (searchQuery.trim()) {
        items = items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
      }
      if (mustOnly) {
        items = items.filter((item) => item.tag === 'must');
      }
      if (hideChecked) {
        items = items.filter((item) => !item.checked);
      }
      return { cat, visibleItems: items };
    })
    .filter(({ visibleItems }) => !anyFilterActive || visibleItems.length > 0);

  return (
    <>
      {/* Animated wave bar */}
      <div
        className="print-hide fixed top-0 left-0 w-full h-2 z-50 animate-wave-shift"
        style={{
          background: "linear-gradient(90deg, #ffd60a, #f77f00, #0077b6, #ffd60a)",
          backgroundSize: "300% 100%",
        }}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-8 pt-6 pb-20 sm:pb-10">
        <header className="text-center mb-8 relative">
          <div className="print-hide absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <div className="inline-block bg-coral-100 text-coral-600 dark:bg-coral-600/30 dark:text-coral-400 text-sm font-medium px-4 py-1.5 rounded-full mb-3">
            ✈️ Kế hoạch chuyến đi
          </div>
          <h1 className="text-4xl font-bold font-playfair text-gray-900 dark:text-gray-100 mb-2">
            Nha Trang Packing List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">🏖️ Biển · 🎢 Vinwonders · 🦁 Safari</p>
          <CountdownBanner />
        </header>

        {allDone && (
          <div className="mb-4 text-center bg-green-50 border border-green-200 dark:bg-green-900/40 dark:border-green-800 rounded-2xl px-5 py-4 text-green-700 dark:text-green-200 font-medium">
            🎉 Đã chuẩn bị xong! Chúc cả gia đình có chuyến đi tuyệt vời! 🌊
          </div>
        )}

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="sticky top-3 z-10">
            <ChecklistStats
              checked={checkedItems}
              total={totalItems}
              onReset={resetAll}
            />
          </div>

          <div className="print-hide">
            <ExportButton categories={categories} />
          </div>

          <div className="print-hide">
            <TemplateManager
              templates={templates}
              onSave={saveAsTemplate}
              onLoad={loadCategories}
              onDelete={deleteTemplate}
              currentCategories={categories}
            />
          </div>

          <PrintButton />

          <div className="print-hide">
            <FilterBar
              ref={searchInputRef}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              mustOnly={mustOnly}
              onMustOnlyChange={setMustOnly}
              hideChecked={hideChecked}
              onHideCheckedChange={setHideChecked}
            />
          </div>

          {visibleCategories.map(({ cat, visibleItems }) => {
            const origIdx = categories.findIndex((c) => c.id === cat.id);
            return (
              <CategorySection
                key={cat.id}
                category={cat}
                visibleItems={visibleItems}
                onToggleItem={(itemId) => toggleItem(cat.id, itemId)}
                onAddItem={(label, tag, note) => addItem(cat.id, label, tag, note)}
                onRemoveItem={(itemId) => removeItem(cat.id, itemId)}
                onRemoveCategory={() => removeCategory(cat.id)}
                onRenameCategory={(newName) => renameCategory(cat.id, newName)}
                onBulkToggle={() => bulkToggleCategory(cat.id)}
                onRenameItem={(itemId, newLabel) => renameItem(cat.id, itemId, newLabel)}
                onNoteChange={(itemId, note) => updateNote(cat.id, itemId, note)}
                onUpdateIcon={(icon) => updateCategoryIcon(cat.id, icon)}
                onMoveUp={origIdx > 0 ? () => moveCategory(cat.id, 'up') : undefined}
                onMoveDown={origIdx < categories.length - 1 ? () => moveCategory(cat.id, 'down') : undefined}
              />
            );
          })}

          <div className="print-hide">
            <AddCategoryForm onAdd={addCategory} />
          </div>
        </div>
      </main>

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </>
  );
}
