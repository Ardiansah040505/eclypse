// ══════════════════════════════════════════════════════════════════════════
// ECLYPSE APP - Main Entry Point
// Modular JavaScript Architecture
// ══════════════════════════════════════════════════════════════════════════

// Load modules in order (dependencies first)
// 1. State management
// 2. Utilities (modal, toast, background)
// 3. Recap & tracking
// 4. Auth
// 5. Navigation
// 6. Tahap 1-5

// ══════════════════════════════════════════════════════════════════════════
// MODULE LOADER (Fallback for browsers without ES modules)
// ══════════════════════════════════════════════════════════════════════════

// Initialize question builder on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  if (typeof initQuestionBuilder === 'function') {
    initQuestionBuilder();
  }
});

console.log('Eclypse App loaded - Modular JS Architecture');
