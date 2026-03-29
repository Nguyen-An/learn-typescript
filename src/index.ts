/**
 * ============================================================
 *   LEARN TYPESCRIPT – ENTRY POINT
 *   Chạy: npx ts-node src/index.ts
 * ============================================================
 *
 *  Chạy từng bài:
 *    npm run lesson:01   → Type System
 *    npm run lesson:02   → Advanced Types
 *    npm run lesson:03   → Functions & Objects
 *    npm run lesson:04   → Modules & Config
 *    npm run lesson:05   → TypeScript với API
 *    npm run lesson:06   → Utility Types
 *    npm run lesson:07   → Advanced
 * ============================================================
 */

const lessons = [
  { id: "01", title: "Type System",              cmd: "npm run lesson:01" },
  { id: "02", title: "Advanced Types",           cmd: "npm run lesson:02" },
  { id: "03", title: "Functions & Objects",      cmd: "npm run lesson:03" },
  { id: "04", title: "Modules & Config",         cmd: "npm run lesson:04" },
  { id: "05", title: "TypeScript với API",       cmd: "npm run lesson:05" },
  { id: "06", title: "Utility Types",            cmd: "npm run lesson:06" },
  { id: "07", title: "Advanced",                 cmd: "npm run lesson:07" },
];

console.log("╔══════════════════════════════════════════════════╗");
console.log("║      🚀  LEARN TYPESCRIPT – Khoá học đầy đủ     ║");
console.log("╠══════════════════════════════════════════════════╣");
lessons.forEach(({ id, title, cmd }) => {
  console.log(`║  Bài ${id}: ${title.padEnd(28)}        ║`);
  console.log(`║    → ${cmd.padEnd(42)}║`);
});
console.log("╠══════════════════════════════════════════════════╣");
console.log("║  Cấu trúc project:                               ║");
console.log("║    src/01-type-system/       → Bài 01            ║");
console.log("║    src/02-advanced-types/    → Bài 02            ║");
console.log("║    src/03-functions-objects/ → Bài 03            ║");
console.log("║    src/04-modules-config/    → Bài 04            ║");
console.log("║    src/05-api/               → Bài 05            ║");
console.log("║    src/06-utility-types/     → Bài 06            ║");
console.log("║    src/07-advanced/          → Bài 07            ║");
console.log("╚══════════════════════════════════════════════════╝");
