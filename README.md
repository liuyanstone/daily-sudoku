# Daily Sudoku / 每日数独

A bilingual, accessible daily Sudoku game, built as a static website for GitHub Pages. No account, build step, or ChatGPT required.

## Play

One puzzle per local calendar day. The same date always produces the same puzzle. Every puzzle has exactly one solution. The difficulty varies across days, rather than being chosen by the player.

| Difficulty | Completion score |
| --- | ---: |
| Easy / 简单 | 300 |
| Medium / 中等 | 600 |
| Hard / 困难 | 1,000 |
| Expert / 专家 | 1,500 |

Points are awarded once when the complete grid is valid. Time has no effect on score. Notes, undo, conflict checking, progress, language, sound preference and daily score history are stored in this browser/device. There is no account or cross-device synchronization. A new day starts a fresh puzzle; unfinished older puzzles remain in local storage but are not offered for play.

## Controls

Select a square, then tap a number or use 1–9. Arrow keys move selection; N toggles pencil notes; Backspace/Delete erases; Ctrl/Cmd+Z undoes. Confirming a digit removes that pencil note from its peers. Check identifies duplicate numbers in rows, columns and boxes; it does not reveal the answer. Fixed clues cannot be edited. English and Chinese are available in the header. Sound is generated locally through Web Audio.

## Puzzle generation and difficulty

`puzzles.mjs` contains 48 original base puzzles, 12 per tier, generated with seeded random search and clue removal. Each removed clue is checked with a solver that counts up to two solutions. Daily puzzles apply date-seeded digit, row, column, band, stack and transpose transformations that preserve uniqueness. Difficulty is re-rated after transformation using implemented solving techniques: naked singles, hidden singles, locked candidates and naked pairs. Expert puzzles exceed that technique set. Difficulty labels are estimates, not a standardized human rating.

## Run and verify

Serve this directory with a static web server, for example `python3 -m http.server 8777`. Open localhost:8777. ES modules require serving over HTTP/HTTPS rather than opening index.html directly.

With Node.js installed, run `node check.mjs`. It validates all base puzzles, 365 transformed daily puzzles, all four score tiers, date stability, completion scoring, notes, undo, corrupt-save handling and translation parity. Run `node generate.mjs` only when intentionally replacing the base library; changing the library changes daily puzzles, so saved progress from the previous version may no longer apply.

## Publish

Publish the main branch root with GitHub Pages. All runtime files are static. Google Fonts is optional; built-in system fonts provide fallbacks. No analytics, advertising, or external game API is used.
