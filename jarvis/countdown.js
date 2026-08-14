const pill=document.getElementById('schedulePill');
const value=pill?.querySelector('em');
const label=pill?.querySelector('b');
const CADENCE_MINUTES=15;

function nextBoundary(now=new Date()){
  const n=new Date(now);
  n.setUTCSeconds(0,0);
  const m=n.getUTCMinutes();
  const add=CADENCE_MINUTES-(m%CADENCE_MINUTES||CADENCE_MINUTES);
  if(m%CADENCE_MINUTES===0&&now.getUTCSeconds()===0&&now.getUTCMilliseconds()===0)return n;
  n.setUTCMinutes(m+add);
  return n;
}

let target=nextBoundary();
function render(){
  if(!pill||!value||!label)return;
  const now=new Date();
  if(now>=target)target=nextBoundary(new Date(now.getTime()+1000));
  const ms=Math.max(0,target-now);
  const total=Math.ceil(ms/1000);
  const mm=Math.floor(total/60);
  const ss=total%60;
  value.textContent=`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  const soon=total<=60;
  pill.className=`live-pill ${soon?'running':'good'}`;
  label.textContent=soon?'NEXT RUN':'NEXT RUN';
  pill.title=`Next autonomous Jarvis scheduler check: ${target.toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'})}`;
}
render();
setInterval(render,250);
