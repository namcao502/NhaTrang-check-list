"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useChecklist } from "@/lib/useChecklist";
import { useTemplates } from "@/lib/useTemplates";
import CategorySection from "@/components/CategorySection";
import SortableCategory from "@/components/SortableCategory";
import ChecklistStats from "@/components/ChecklistStats";
import AddCategoryForm from "@/components/AddCategoryForm";
import FilterBar from "@/components/FilterBar";
import CountdownBanner from "@/components/CountdownBanner";
import UndoButton from "@/components/UndoButton";
import ThemeToggle from "@/components/ThemeToggle";
import AmbientFireworks from "@/components/AmbientFireworks";
import ExportButtons from "@/components/ExportButtons";
import PackingCardModal from "@/components/PackingCardModal";
import ImportTextModal from "@/components/ImportTextModal";
import TemplatePicker from "@/components/TemplatePicker";
import ArchiveConfirmModal from "@/components/ArchiveConfirmModal";
import TripHistoryModal from "@/components/TripHistoryModal";
import { useTripHistory } from "@/lib/useTripHistory";
import { useSuggestions } from "@/lib/useSuggestions";
import SmartSuggestions from "@/components/SmartSuggestions";
import WeatherWidget from "@/components/WeatherWidget";
import type { Suggestion } from "@/lib/suggestionsData";
import { COMMON, HEADER, EXPORT, IMPORT } from "@/lib/constants";

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
    updateQuantity,
    updateCategoryIcon,
    reorderItems,
    reorderCategories,
    importItems,
    loadCategories,
    undo,
    canUndo,
  } = useChecklist();

  const {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useTemplates();

  const { trips, archiveTrip, deleteTrip } = useTripHistory();

  const [departureDate, setDepartureDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("beach-departure");
      if (stored) setDepartureDate(stored);
    } catch {
      // Ignore read errors
    }

    // Listen for changes from CountdownBanner
    function handleStorage(e: StorageEvent) {
      if (e.key === "beach-departure") {
        setDepartureDate(e.newValue);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const { suggestions, dismiss: dismissSuggestion } = useSuggestions(categories, departureDate);

  const handleAddSuggestion = useCallback((suggestion: Suggestion) => {
    // Find matching category by name (case-insensitive)
    const targetCat = categories.find(
      (c) => c.name.toLowerCase() === suggestion.targetCategoryName.toLowerCase()
    );
    const categoryId = targetCat?.id ?? categories[0]?.id;
    if (!categoryId) return;
    addItem(categoryId, suggestion.label, suggestion.tag, suggestion.note);
    dismissSuggestion(suggestion.id);
  }, [categories, addItem, dismissSuggestion]);

  const [searchQuery, setSearchQuery] = useState('');
  const [mustOnly, setMustOnly] = useState(false);
  const [hideChecked, setHideChecked] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPackingCard, setShowPackingCard] = useState(false);

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

  const categorySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleCategoryDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = categories.findIndex((c) => c.id === active.id);
    const toIndex = categories.findIndex((c) => c.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    reorderCategories(fromIndex, toIndex);
  }, [categories, reorderCategories]);

  if (!loaded) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12 text-center text-gray-400 dark:text-gray-400">
        {COMMON.LOADING}
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
      <AmbientFireworks />

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
            {HEADER.TRIP_BADGE}
          </div>
          <h1 className="text-4xl font-bold font-playfair text-gray-900 dark:text-gray-100 mb-2">
            Nha Trang Packing List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{HEADER.SUBTITLE}</p>
          <CountdownBanner />
          <div className="mt-4">
            <WeatherWidget departureDate={departureDate} />
          </div>
        </header>

        {allDone && (
          <div className="mb-4 text-center bg-green-50 border border-green-200 dark:bg-green-900/40 dark:border-green-800 rounded-2xl px-5 py-4 text-green-700 dark:text-green-200 font-medium">
            {HEADER.ALL_DONE}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="sticky top-3 z-10">
            <ChecklistStats
              checked={checkedItems}
              total={totalItems}
              onResetRequest={() => setShowArchiveModal(true)}
              onShowHistory={() => setShowHistoryModal(true)}
            />
          </div>

          <div className="print-hide flex gap-2">
            <div className="flex-1">
              <ExportButtons categories={categories} />
            </div>
            <button
              type="button"
              onClick={() => setShowPackingCard(true)}
              className="rounded-xl px-3 py-2 text-sm font-medium transition-colors bg-white/70 dark:bg-slate-700/70 text-ocean-600 dark:text-ocean-300 border border-ocean-200 dark:border-ocean-700 hover:bg-ocean-50 hover:text-ocean-700 dark:hover:bg-ocean-700/30 dark:hover:text-ocean-200"
            >
              {EXPORT.SHARE_PROGRESS}
            </button>
          </div>

          <div className="print-hide">
            <TemplatePicker
              templates={templates}
              onSave={(name) => saveTemplate(name, categories)}
              onLoad={(id) => {
                const cats = loadTemplate(id);
                if (cats) loadCategories(cats);
              }}
              onDelete={deleteTemplate}
            />
          </div>

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

          <DndContext
            id="categories"
            sensors={categorySensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={visibleCategories.map(({ cat }) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleCategories.map(({ cat, visibleItems }) => (
                <SortableCategory key={cat.id} id={cat.id}>
                  <CategorySection
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
                    onReorderItems={(from, to) => reorderItems(cat.id, from, to)}
                    onQuantityChange={(itemId, qty) => updateQuantity(cat.id, itemId, qty)}
                    onUpdateIcon={(icon) => updateCategoryIcon(cat.id, icon)}
                  />
                </SortableCategory>
              ))}
            </SortableContext>
          </DndContext>

          <div className="print-hide flex flex-col gap-3">
            <AddCategoryForm onAdd={addCategory} />
            <SmartSuggestions
              suggestions={suggestions}
              onAdd={handleAddSuggestion}
              onDismiss={dismissSuggestion}
            />
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-base text-gray-400 dark:text-gray-400 hover:border-ocean-400 hover:text-ocean-600 dark:hover:border-ocean-500 dark:hover:text-ocean-400 transition-colors"
            >
              {IMPORT.BUTTON}
            </button>
          </div>
        </div>
      </main>

      {showImportModal && (
        <ImportTextModal
          categories={categories}
          onImport={importItems}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {showArchiveModal && (
        <ArchiveConfirmModal
          onArchiveAndReset={(name) => {
            archiveTrip(name, categories);
            resetAll();
            setShowArchiveModal(false);
          }}
          onResetWithoutArchive={() => {
            resetAll();
            setShowArchiveModal(false);
          }}
          onCancel={() => setShowArchiveModal(false)}
        />
      )}

      {showHistoryModal && (
        <TripHistoryModal
          trips={trips}
          onDeleteTrip={deleteTrip}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      <PackingCardModal
        open={showPackingCard}
        onClose={() => setShowPackingCard(false)}
        checkedItems={checkedItems}
        totalItems={totalItems}
      />

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </>
  );
}
