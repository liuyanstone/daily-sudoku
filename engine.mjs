export const ALL=0x1ff;
export const TIERS=[{key:'easy',points:300},{key:'medium',points:600},{key:'hard',points:1000},{key:'expert',points:1500}];
export const UNITS=[];
for(let r=0;r<9;r++)UNITS.push(Array.from({length:9},(_,c)=>r*9+c));
for(let c=0;c<9;c++)UNITS.push(Array.from({length:9},(_,r)=>r*9+c));
for(let b=0;b<9;b++)UNITS.push(Array.from({length:9},(_,i)=>(Math.floor(b/3)*3+Math.floor(i/3))*9+(b%3)*3+i%3));
export const PEERS=Array.from({length:81},(_,k)=>[...new Set(UNITS.filter(u=>u.includes(k)).flat())].filter(p=>p!==k));
export function seeded(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function hash(text){let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function bitCount(mask){let n=0;while(mask){mask&=mask-1;n++;}return n;}
export function candidates(grid,k){if(grid[k])return 0;let mask=ALL;for(const p of PEERS[k])if(grid[p])mask&=~(1<<(grid[p]-1));return mask;}
export function conflicts(grid){const bad=new Set();for(const unit of UNITS){const digits=new Map();for(const k of unit){const d=grid[k];if(!d)continue;if(digits.has(d)){bad.add(k);bad.add(digits.get(d));}else digits.set(d,k);}}return bad;}
export function validGrid(grid){return Array.isArray(grid)&&grid.length===81&&grid.every(d=>Number.isInteger(d)&&d>=0&&d<=9)&&conflicts(grid).size===0;}
export function search(grid,limit=2,rng=null){if(!validGrid(grid))return{count:0,solution:null,nodes:0};const board=[...grid],row=Array(9).fill(0),col=Array(9).fill(0),box=Array(9).fill(0);const bidx=k=>Math.floor(k/27)*3+Math.floor(k%9/3);for(let k=0;k<81;k++)if(board[k]){const bit=1<<(board[k]-1);row[Math.floor(k/9)]|=bit;col[k%9]|=bit;box[bidx(k)]|=bit;}let count=0,solution=null,nodes=0;
 function visit(){if(count>=limit)return;nodes++;let cell=-1,mask=0,best=10;for(let k=0;k<81;k++)if(!board[k]){const m=ALL&~(row[Math.floor(k/9)]|col[k%9]|box[bidx(k)]),n=bitCount(m);if(!n)return;if(n<best){best=n;cell=k;mask=m;if(n===1)break;}}if(cell<0){count++;if(!solution)solution=[...board];return;}const options=[];for(let d=1;d<=9;d++)if(mask&(1<<(d-1)))options.push(d);if(rng)for(let i=options.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[options[i],options[j]]=[options[j],options[i]];}const r=Math.floor(cell/9),c=cell%9,b=bidx(cell);for(const d of options){const bit=1<<(d-1);board[cell]=d;row[r]|=bit;col[c]|=bit;box[b]|=bit;visit();board[cell]=0;row[r]&=~bit;col[c]&=~bit;box[b]&=~bit;if(count>=limit)break;}}
 visit();return{count,solution,nodes};
}
export function rate(grid){if(!validGrid(grid))throw Error('Invalid Sudoku');const board=[...grid],masks=board.map((d,k)=>d?0:candidates(board,k));let grade=0,singles=0,hidden=0,advanced=0;
 function fill(k,d){board[k]=d;masks[k]=0;for(const p of PEERS[k])if(!board[p])masks[p]&=~(1<<(d-1));}
 function remove(cells,bit){let changed=false;for(const k of cells)if(!board[k]&&(masks[k]&bit)){masks[k]&=~bit;changed=true;}return changed;}
 for(let guard=0;guard<3000;guard++){
  const empty=board.map((d,k)=>d?-1:k).filter(k=>k>=0);if(!empty.length)return{grade,singles,hidden,advanced,remaining:0};for(const k of empty)if(!masks[k])throw Error('Invalid candidates');
  const single=empty.find(k=>bitCount(masks[k])===1);if(single!==undefined){fill(single,Math.log2(masks[single])+1);singles++;continue;}
  let found=false;outer:for(const unit of UNITS)for(let d=1;d<=9;d++){const bit=1<<(d-1),cells=unit.filter(k=>!board[k]&&(masks[k]&bit));if(cells.length===1){fill(cells[0],d);hidden++;grade=Math.max(grade,1);found=true;break outer;}}if(found)continue;
  outer:for(let b=0;b<9;b++){const unit=UNITS[18+b];for(let d=1;d<=9;d++){const bit=1<<(d-1),cells=unit.filter(k=>!board[k]&&(masks[k]&bit));if(cells.length<2)continue;const r=Math.floor(cells[0]/9),c=cells[0]%9;if(cells.every(k=>Math.floor(k/9)===r)&&remove(UNITS[r].filter(k=>!unit.includes(k)),bit)){found=true;break outer;}if(cells.every(k=>k%9===c)&&remove(UNITS[9+c].filter(k=>!unit.includes(k)),bit)){found=true;break outer;}}}if(found){grade=2;advanced++;continue;}
  outer:for(const unit of UNITS){const pairs=new Map();for(const k of unit)if(!board[k]&&bitCount(masks[k])===2){const list=pairs.get(masks[k])||[];list.push(k);pairs.set(masks[k],list);}for(const [mask,cells]of pairs)if(cells.length===2&&remove(unit.filter(k=>!cells.includes(k)),mask)){found=true;break outer;}}if(found){grade=2;advanced++;continue;}
  return{grade:3,singles,hidden,advanced,remaining:empty.length};
 }
 throw Error('Rating did not converge');
}
export function transform(grid,rng){const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};const rows=shuffle([0,1,2]).flatMap(b=>shuffle([0,1,2]).map(r=>b*3+r)),cols=shuffle([0,1,2]).flatMap(b=>shuffle([0,1,2]).map(c=>b*3+c)),digits=shuffle([1,2,3,4,5,6,7,8,9]),transpose=rng()<.5;return Array.from({length:81},(_,k)=>{const r=rows[Math.floor(k/9)],c=cols[k%9],v=grid[transpose?c*9+r:r*9+c];return v?digits[v-1]:0;});}
export function dailyPuzzle(day,library,selectedGrade=null,round=0){
 if(Number.isInteger(selectedGrade)&&selectedGrade>=0&&selectedGrade<4){const rng=seeded(hash(day+":choice:"+selectedGrade+(round>0?":round:"+round:""))),pool=library.filter(p=>p.grade===selectedGrade),base=pool[Math.floor(rng()*pool.length)];if(!base)throw Error("Missing puzzle tier");const givens=transform(base.grid,rng),solution=search(givens,1).solution,target=[46,38,32,0][selectedGrade],empty=givens.map((d,k)=>d?-1:k).filter(k=>k>=0);for(let i=empty.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[empty[i],empty[j]]=[empty[j],empty[i]];}while(givens.filter(Boolean).length<target){const k=empty.pop();givens[k]=solution[k];}return{day,version:2,round,givens,solution,grade:selectedGrade,points:TIERS[selectedGrade].points,clues:givens.filter(Boolean).length,rating:rate(givens)};}
const rng=seeded(hash(day)),target=hash('tier:'+day)%4,pool=library.filter(p=>p.grade===target),base=pool[Math.floor(rng()*pool.length)];if(!base)throw Error('Missing puzzle tier');const givens=transform(base.grid,rng),rating=rate(givens);return{day,version:1,givens,solution:search(givens,1).solution,grade:rating.grade,points:TIERS[rating.grade].points,clues:givens.filter(Boolean).length,rating};}
export function solved(values,givens){return values.length===81&&values.every(d=>d>=1&&d<=9)&&validGrid(values)&&givens.every((d,i)=>!d||values[i]===d);}
