/**
 * Tests for FEAT-remove-buttons
 *
 * Verifies that the removed components (ExportButton, PrintButton,
 * TemplateManager, useTemplates) are no longer part of the codebase
 * and are not referenced in the main page module.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Deleted component files no longer exist
// ---------------------------------------------------------------------------

describe("FEAT-remove-buttons — deleted component files", () => {
  const deletedFiles = [
    "components/ExportButton.tsx",
    "components/PrintButton.tsx",
    "components/TemplateManager.tsx",
    "lib/useTemplates.ts",
  ];

  it.each(deletedFiles)(
    "%s does not exist in the codebase",
    (filePath) => {
      expect(fs.existsSync(path.join(ROOT, filePath))).toBe(false);
    }
  );
});

// ---------------------------------------------------------------------------
// Deleted test files no longer exist
// ---------------------------------------------------------------------------

describe("FEAT-remove-buttons — deleted test files", () => {
  const deletedTestFiles = [
    "__tests__/ExportButton.test.tsx",
    "e2e/export.spec.ts",
  ];

  it.each(deletedTestFiles)(
    "%s does not exist in the codebase",
    (filePath) => {
      expect(fs.existsSync(path.join(ROOT, filePath))).toBe(false);
    }
  );
});

// ---------------------------------------------------------------------------
// page.tsx does not import removed components
// ---------------------------------------------------------------------------

describe("FEAT-remove-buttons — page.tsx imports", () => {
  const pageSource = fs.readFileSync(
    path.join(ROOT, "app/page.tsx"),
    "utf-8"
  );

  const removedImports = [
    "ExportButton",
    "PrintButton",
    "TemplateManager",
    "useTemplates",
  ];

  it.each(removedImports)(
    "page.tsx does not import %s",
    (name) => {
      expect(pageSource).not.toContain(name);
    }
  );

  const removedButtonLabels = [
    "Sao chép danh sách",
    "Chia sẻ",
    "Mẫu chuyến đi",
    "In danh sách",
  ];

  it.each(removedButtonLabels)(
    "page.tsx does not contain removed button label '%s'",
    (label) => {
      expect(pageSource).not.toContain(label);
    }
  );
});

// ---------------------------------------------------------------------------
// e2e helpers no longer reference copyButton
// ---------------------------------------------------------------------------

describe("FEAT-remove-buttons — e2e helpers cleanup", () => {
  const helpersSource = fs.readFileSync(
    path.join(ROOT, "e2e/helpers.ts"),
    "utf-8"
  );

  it("e2e/helpers.ts does not declare a copyButton property", () => {
    expect(helpersSource).not.toContain("copyButton");
  });
});
