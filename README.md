# Daily Sudoku / 每日数独

A bilingual, accessible daily Sudoku game, built as a static website for GitHub Pages. No account, build step, or ChatGPT required.

## Play

One puzzle per local calendar day. Choose from four difficulty levels and optionally enable step-by-step mode before the first number entry or pencil note. Both settings then lock for the day, including after undo or reopening. The same date and difficulty always produce the same puzzle. Every puzzle has exactly one solution. A fresh day resets the puzzle, settings, and mistake count.

| Difficulty | Given numbers | Base score |
| --- | ---: | ---: |
| Easy / 简单 | 46 | 300 |
| Medium / 中等 | 38 | 600 |
| Hard / 困难 | 32 | 1,000 |
| Expert / 专家 | 25–29 | 1,500 |

Points are awarded once when the complete grid is valid. Time has no effect on score. Notes, undo, conflict checking, progress, language, sound preference and daily score history are stored in this browser/device. There is no account or cross-device synchronization. A new day starts a fresh puzzle; unfinished older puzzles remain in local storage but are not offered for play.

## Step-by-step mode / 逐步模式

Each changed number entry is checked against the unique solution. Correct entries receive positive feedback; wrong entries remain editable, are marked and announced, and add one mistake. Candidate notes, erasing and repeating an unchanged number are not penalized. Undo, erasing and reopening preserve the mistake count.

Cumulative deduction = base score × min(100%, 2% × mistakes²). Thus one mistake deducts 2%, two 8%, three 18%, four 32%, five 50%, six 72%, seven 98%, and eight or more 100%. Completion score never falls below zero. There is no speed penalty. Normal mode does not give answer feedback or deduct points for wrong entries. The score card shows base points, mistakes, deductions and remaining available points.

## Controls

Select a square, then tap a number or use 1–9. Arrow keys move selection; N toggles pencil notes; Backspace/Delete erases; Ctrl/Cmd+Z undoes. Confirming a digit removes that pencil note from its peers. In normal mode, Check identifies duplicate numbers in rows, columns and boxes. In step-by-step mode, it identifies currently incorrect entries without adding penalties. Fixed clues cannot be edited. English and Chinese are available in the header. Sound is generated locally through Web Audio.

## Puzzle generation and difficulty

`puzzles.mjs` contains 48 original base puzzles, 12 per tier, generated with seeded random search and clue removal. Each removed clue is checked with a solver that counts up to two solutions. Daily puzzles apply date-seeded digit, row, column, band, stack and transpose transformations that preserve uniqueness. The base library is rated using naked singles, hidden singles, locked candidates and naked pairs. Selected daily puzzles add solution clues deterministically to reach 46, 38 or 32 givens; Expert retains the base puzzle’s 25–29. Adding valid clues preserves the unique solution. Selectable difficulty uses these clue bands; human solving difficulty can vary. Existing saved puzzles from the earlier daily-difficulty version retain their original grids and scores.

## Run and verify

Serve this directory with a static web server, for example `python3 -m http.server 8777`. Open localhost:8777. ES modules require serving over HTTP/HTTPS rather than opening index.html directly.

With Node.js installed, run `node check.mjs`. It validates all base puzzles, 365 legacy daily puzzles plus 1,460 selectable puzzles, decreasing clue counts across all four levels, date stability, completion scoring, quadratic mistake penalties, score floor, penalty persistence, notes, undo, legacy saves, corrupt-save handling and translation parity. Run `node generate.mjs` only when intentionally replacing the base library; changing the library changes daily puzzles, so saved progress from the previous version may no longer apply.

## Publish

Publish the main branch root with GitHub Pages. All runtime files are static. Google Fonts is optional; built-in system fonts provide fallbacks. No analytics, advertising, or external game API is used.
