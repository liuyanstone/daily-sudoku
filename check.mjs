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
