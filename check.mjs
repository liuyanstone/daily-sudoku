import assert from 'node:assert/strict';
import {PUZZLES} from './puzzles.mjs';
import {TIERS,search,rate,solved,conflicts,dailyPuzzle,PEERS} from './engine.mjs';
import {localDay,freshEntry,restoreEntry,enter,undo,finish} from './state.mjs';
import {en,zh} from './i18n.mjs';
assert.equal(PUZZLES.length,48);assert.equal(new Set(PUZZLES.map(p=>p.grid.join(''))).size,48);
for(const base of PUZZLES){const found=search(base.grid,2);assert.equal(found.count,1);assert(solved(found.solution,base.grid));assert.equal(rate(base.grid).grade,base.grade);}
const fingerprints=new Set(),grades=new Set();let dayTests=0;
for(let i=0;i<365;i++){const day=localDay(new Date(2026,0,1+i)),p=dailyPuzzle(day,PUZZLES),found=search(p.givens,2);assert.equal(found.count,1);assert(solved(found.solution,p.givens));assert.equal(p.points,TIERS[p.grade].points);assert.deepEqual(dailyPuzzle(day,PUZZLES),p);fingerprints.add(p.givens.join(''));grades.add(p.grade);dayTests++;}
assert.equal(fingerprints.size,365);assert.equal(grades.size,4);assert(TIERS.every((t,i)=>i===0||t.points>TIERS[i-1].points));
const p=dailyPuzzle('2026-10-25',PUZZLES),answer=search(p.givens,1).solution,blank=p.givens.findIndex(d=>!d),given=p.givens.findIndex(Boolean);let e=freshEntry(p);const original=JSON.stringify(e);assert.equal(enter(e,p,given,5),e);assert.equal(enter(e,p,-1,5),e);assert.equal(enter(e,p,blank,10),e);
const note=enter(e,p,blank,3,true);assert.equal(note.notes[blank],4);assert.equal(note.values[blank],0);assert.equal(JSON.stringify(e),original);assert.equal(enter(note,p,blank,3,true).notes[blank],0);assert.deepEqual(undo(note).values,e.values);assert.deepEqual(undo(note).notes,e.notes);
e=enter(note,p,blank,answer[blank]);assert.equal(e.values[blank],answer[blank]);assert.equal(e.notes[blank],0);assert.equal(enter(e,p,blank,2,true),e);const reloaded=restoreEntry(JSON.parse(JSON.stringify(e)),p);assert.deepEqual(reloaded,e);assert.equal(undo(reloaded).notes[blank],4);
const peer=PEERS[blank].find(k=>!p.givens[k]),digit=answer[blank];let withPeerNotes=enter(freshEntry(p),p,peer,digit,true);withPeerNotes=enter(withPeerNotes,p,blank,digit);assert.equal(withPeerNotes.notes[peer]&(1<<(digit-1)),0,'Confirmed digit clears peer pencil notes');
let full=freshEntry(p);for(let k=0;k<81;k++)if(!p.givens[k])full=enter(full,p,k,answer[k]);assert(!full.done);full=finish(full,p);assert(full.done);assert.equal(full.points,p.points);assert.equal(full.history.length,0);assert.equal(finish(full,p),full,'No duplicate award');assert.equal(enter(full,p,blank,0),full);assert.equal(undo(full),full);assert.deepEqual(restoreEntry(JSON.parse(JSON.stringify(full)),p),full);
const bad=[...answer];bad[0]=bad[1];assert(conflicts(bad).has(0));assert(!solved(bad,p.givens));assert.equal(search(bad,2).count,0);assert.equal(search(Array(81).fill(0),2).count,2);assert.equal(restoreEntry({values:Array(81).fill(9),done:true,points:999999},p).points,0);assert.equal(restoreEntry({values:[1,2]},p).done,false);assert.equal(localDay(new Date(2026,9,25,23,59)),'2026-10-25');assert.equal(localDay(new Date(2026,9,26,0,0)),'2026-10-26');assert.notDeepEqual(dailyPuzzle('2026-10-25',PUZZLES).givens,dailyPuzzle('2026-10-26',PUZZLES).givens);
assert.deepEqual(Object.keys(en).sort(),Object.keys(zh).sort());for(const k of Object.keys(en))assert.deepEqual([...en[k].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),[...zh[k].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort());
console.log(`PASS: 48 unique single-solution base puzzles; ${dayTests} unique and uniquely solvable daily puzzles; all 4 score tiers; fixed clues; pencil notes; peer cleanup; undo; reload; once-only score; conflict detection; new local day; bilingual text.`);
console.log('Today:',TIERS[p.grade].key,p.points,'points',p.clues,'clues');

// New selectable puzzles preserve uniqueness and strictly decrease clue counts.
let selectableChecked=0;
for(let i=0;i<365;i++){
 const day=localDay(new Date(2026,0,1+i));let previous=82;
 for(let grade=0;grade<4;grade++){
  const p=dailyPuzzle(day,PUZZLES,grade);assert.equal(p.version,2);assert.equal(p.grade,grade);assert.equal(p.points,TIERS[grade].points);assert(p.clues<previous);previous=p.clues;
  assert.equal(search(p.givens,2).count,1);assert(solved(p.solution,p.givens));assert.deepEqual(dailyPuzzle(day,PUZZLES,grade),p);assert.deepEqual(restoreEntry(freshEntry(p),p),freshEntry(p));selectableChecked++;
 }
}
const {scoreDetails}=await import('./state.mjs');
const chosen=dailyPuzzle('2026-10-25',PUZZLES,0),empty=chosen.givens.findIndex(d=>!d),correctDigit=chosen.solution[empty],wrongDigit=correctDigit===9?1:correctDigit+1;
let guided=freshEntry(chosen,true);guided=enter(guided,chosen,empty,wrongDigit);assert.equal(guided.mistakes,1);assert.equal(scoreDetails(guided,chosen).percent,2);assert.equal(scoreDetails(guided,chosen).available,294);
assert.equal(enter(guided,chosen,empty,wrongDigit),guided,'Repeating the same number cannot add another penalty');
guided=undo(guided);assert.equal(guided.values[empty],0);assert.equal(guided.mistakes,1,'Undo preserves wrong entry count');
guided=enter(guided,chosen,empty,wrongDigit,true);assert.equal(guided.mistakes,1,'Pencil notes are not penalized');
guided=enter(guided,chosen,empty,wrongDigit);assert.equal(guided.mistakes,2);assert.equal(scoreDetails(guided,chosen).percent,8);guided=enter(guided,chosen,empty,0);assert.equal(guided.mistakes,2);guided=enter(guided,chosen,empty,wrongDigit);assert.equal(guided.mistakes,3);assert.equal(scoreDetails(guided,chosen).percent,18);
const guidedReload=restoreEntry(JSON.parse(JSON.stringify(guided)),chosen);assert.deepEqual(guidedReload,guided);assert.equal(guidedReload.stepMode,true);
for(let k=0;k<81;k++)if(!chosen.givens[k])guided=enter(guided,chosen,k,chosen.solution[k]);guided=finish(guided,chosen);assert.equal(guided.points,246);assert.equal(guided.mistakes,3);assert.deepEqual(restoreEntry(guided,chosen),guided);assert.equal(finish(guided,chosen),guided);
assert.equal(scoreDetails({...guided,mistakes:8},chosen).available,0);assert.equal(scoreDetails({...guided,mistakes:999},chosen).available,0);
let normal=enter(freshEntry(chosen),chosen,empty,wrongDigit);assert.equal(normal.mistakes,0);assert.equal(scoreDetails(normal,chosen).available,300);
const legacy=dailyPuzzle('2026-10-25',PUZZLES),oldRaw={values:legacy.solution,done:true,points:1500,elapsed:1234};const oldEntry=restoreEntry(oldRaw,legacy);assert(oldEntry.done);assert.equal(oldEntry.points,1500);assert.equal(oldEntry.puzzleVersion,1);
console.log(`PASS: ${selectableChecked} selectable daily puzzles unique; four levels with decreasing clues; correct/wrong entry scoring; quadratic penalties; notes/repeat protection; undo/reload preserve penalties; score floor; normal mode; old completion migration.`);

const {restoreDailyBest}=await import('./state.mjs');
const resolve=(raw)=>dailyPuzzle('2026-10-25',PUZZLES,raw.puzzleVersion===2?raw.difficulty:null,raw.round||0);
function completedAttempt(grade,round=0,mistakes=0){const p=dailyPuzzle('2026-10-25',PUZZLES,grade,round);let entry=freshEntry(p,true);entry={...entry,values:[...p.solution],mistakes,started:true};return finish(entry,p);}
const mediumBest=completedAttempt(1,0,2);assert.equal(mediumBest.points,552);
assert.deepEqual(restoreDailyBest(mediumBest,resolve),mediumBest,'Existing completed flat saves become daily best');
const low=completedAttempt(0,1);assert.equal(low.points,300);let dailyRow={...low,best:mediumBest};assert.equal(restoreDailyBest(dailyRow,resolve).points,552,'Lower completed replay must not replace best');
const higher=completedAttempt(2,2);dailyRow={...higher,best:mediumBest};assert.equal(restoreDailyBest(dailyRow,resolve).points,1000,'Higher result replaces best; scores are not summed');
const highBest=restoreDailyBest(dailyRow,resolve),newPuzzle=dailyPuzzle('2026-10-25',PUZZLES,3,3);dailyRow={...freshEntry(newPuzzle,true),best:highBest};assert.equal(restoreDailyBest(dailyRow,resolve).points,1000,'Unfinished new replay preserves best');assert.equal(restoreDailyBest(JSON.parse(JSON.stringify(dailyRow)),resolve).points,1000,'Best survives reload during replay');
const lowerAgain=completedAttempt(0,3);assert.equal(restoreDailyBest({...lowerAgain,best:highBest},resolve).points,1000);
const zero=completedAttempt(0,1,8);assert.equal(restoreDailyBest(zero,resolve).points,0,'A completed zero-score attempt is still a valid daily record');
assert.equal(restoreDailyBest({...freshEntry(newPuzzle),best:{...higher,values:Array(81).fill(9),done:true,points:99999}},resolve),null,'Invalid best grid cannot become a score');
assert.equal(restoreDailyBest({...low,best:{...mediumBest,points:999999}},resolve).points,552,'Recalculate saved score rather than trusting stored points');
assert.equal(restoreDailyBest(null,resolve),null);assert.equal(restoreDailyBest(oldRaw,resolve).points,1500,'Original pre-selection Sudoku completion migrates');
let replayChecked=0;for(let d=0;d<20;d++){const date=localDay(new Date(2026,9,1+d));for(let grade=0;grade<4;grade++){const seen=new Set();for(let round=0;round<3;round++){const p=dailyPuzzle(date,PUZZLES,grade,round);assert.equal(p.round,round);assert.equal(search(p.givens,2).count,1);assert(!seen.has(p.givens.join('')),'Replay should offer a fresh grid');seen.add(p.givens.join(''));assert.deepEqual(dailyPuzzle(date,PUZZLES,grade,round),p);replayChecked++;}}}
console.log(`PASS: highest completed daily score only; old save migration; lower/unfinished replays retain best; higher result replaces best; zero and invalid score handling; ${replayChecked} deterministic unique-solution replay puzzles.`);
