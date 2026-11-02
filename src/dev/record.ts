import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import scenes from './film.json';

// Development-only export tool. Excluded from production by import.meta.env.DEV.
export function installRecorder(renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera, controls: OrbitControls, light: (mode: 'day'|'evening'|'night')=>void) {
 const button=document.createElement('button'); button.textContent='Record portfolio film';
 Object.assign(button.style,{position:'fixed',top:'12px',left:'42%',zIndex:'1000',padding:'12px',background:'#a99aff',borderRadius:'12px'}); document.body.append(button);
 const total=scenes.reduce((a,s)=>a+s.duration,0);
 let start=0, running=false, last=-1;
 const outputs=[{name:'youtube',w:1920,h:1080},{name:'linkedin',w:1080,h:1350}].map(o=>{
  const canvas=document.createElement('canvas');canvas.width=o.w;canvas.height=o.h;
  return {...o,canvas,ctx:canvas.getContext('2d')!,recorder:null as MediaRecorder|null,chunks:[] as Blob[]};
 });
 const text=(c:CanvasRenderingContext2D,str:string,x:number,y:number,width:number,size:number,color='#edf3fc',weight=500)=>{
  c.font=`${weight} ${size}px Arial`;c.fillStyle=color;
  let yy=y; for(const paragraph of str.split('\n')) {let line=''; for(const word of paragraph.split(' ')){const test=line?line+' '+word:word;if(c.measureText(test).width>width&&line){c.fillText(line,x,yy);yy+=size*1.2;line=word;}else line=test;}c.fillText(line,x,yy);yy+=size*1.2;} return yy;
 };
 button.onclick=()=>{
  if(running)return; running=true;start=performance.now();controls.enabled=false;last=-1;
  for(const o of outputs){o.chunks=[];const stream=o.canvas.captureStream(30);o.recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:10000000});
   o.recorder.ondataavailable=e=>{if(e.data.size)o.chunks.push(e.data);};
   o.recorder.onstop=async()=>{try{const res=await fetch(`http://127.0.0.1:8788/${o.name}.webm`,{method:'POST',body:new Blob(o.chunks,{type:'video/webm'})});if(!res.ok)throw Error('save failed');button.textContent='Film saved locally';}catch{button.textContent='Capture save failed';}finally{stream.getTracks().forEach(t=>t.stop());}};o.recorder.start(1000);
  }
 };
 return {
  before(){if(!running)return; const t=(performance.now()-start)/1000;let offset=0,index=0;for(let i=0;i<scenes.length;i++){if(t>=offset+scenes[i].duration){offset+=scenes[i].duration;index=i+1;}else break;}index=Math.min(index,scenes.length-1);
   const s=scenes[index],p=THREE.MathUtils.clamp((t-offset)/s.duration,0,1);
   if(index!==last){light(index===4?'evening':index===5?'night':'day');last=index;}
   if(index===4&&p>.5)light('night');
   const target=new THREE.Vector3(s.target[0],0,s.target[1]);controls.target.lerp(target,.035);
   const angle=.68+p*.2;camera.position.copy(controls.target).add(new THREE.Vector3(Math.sin(angle)*48,36,Math.cos(angle)*48));
   camera.zoom=THREE.MathUtils.lerp(camera.zoom,s.target[2],.035);camera.lookAt(controls.target);camera.updateProjectionMatrix();
  },
  after(){if(!running)return;const t=(performance.now()-start)/1000;let offset=0,index=0;for(let i=0;i<scenes.length;i++){if(t>=offset+scenes[i].duration){offset+=scenes[i].duration;index=i+1;}else break;}index=Math.min(index,scenes.length-1);const s=scenes[index];
   for(const o of outputs){const c=o.ctx,W=o.w,H=o.h,portrait=H>W;
    c.fillStyle='#081522';c.fillRect(0,0,W,H);
    const grad=c.createRadialGradient(W*.7,H*.4,0,W*.7,H*.4,W*.7);grad.addColorStop(0,'#142b40');grad.addColorStop(1,'#081522');c.fillStyle=grad;c.fillRect(0,0,W,H);
    const pad=portrait?64:80;
    text(c,'BOT OFFICE',pad,78,W,30,'#c1b8ff',700);text(c,'MRSHAKILS / ENGINEERING PORTFOLIO',portrait?pad:1180,portrait?118:78,W,portrait?20:23,'#9db1c9');
    const vx=portrait?40:650,vy=portrait?430:160,vw=portrait?1000:1210,vh=portrait?620:720;
    c.save();c.beginPath();c.roundRect(vx,vy,vw,vh,24);c.clip();c.fillStyle='#081522';c.fillRect(vx,vy,vw,vh);
    const source=renderer.domElement,scale=Math.min(vw/source.width,vh/source.height);const dw=source.width*scale,dh=source.height*scale;c.drawImage(source,vx+(vw-dw)/2,vy+(vh-dh)/2,dw,dh);c.restore();
    const intro=Math.min(1,(t-offset)/.6);c.save();c.globalAlpha=intro;const titleY=portrait?235:285;
    text(c,`${String(index+1).padStart(2,'0')} / ${s.kicker}`,pad,portrait?180:180,portrait?940:520,22,'#76e4cb',700);
    const end=text(c,s.title,pad,titleY,portrait?950:555,portrait?64:72,'#f4f7fc',700);
    text(c,s.subtitle,pad,end+26,portrait?940:500,portrait?27:29,'#adbed2',400);
    if(!portrait){c.fillStyle='#8e83ee';c.fillRect(pad,650,80,4);text(c,index===6?'github.com/MRSHAKILS/\nbot-office':'12 demo personas\nOne shared workspace',pad,710,520,28,'#c1b8ff');}
    c.restore();
    const narrationY=portrait?1110:940;
    // Captions advance phrase by phrase; the narration file begins 0.55s into each chapter.
    const sentences=s.narration.match(/[^.!?]+[.!?]+/g)??[s.narration];const elapsed=Math.max(0,t-offset-.55);const chars=sentences.reduce((a,v)=>a+v.length,0);let acc=0,caption=sentences[sentences.length-1];for(const part of sentences){acc+=part.length/chars*s.voiceDuration;if(elapsed<acc){caption=part;break;}}
    text(c,caption.trim(),pad,narrationY,W-pad*2,portrait?30:32,'#edf3fc');
    text(c,'SIMULATED FOOTAGE / ILLUSTRATIVE AI PERSONAS / NOT CONNECTED SERVICES',pad,H-48,W-pad*2,portrait?17:20,'#8fa6bc');
    c.fillStyle='#26394d';c.fillRect(pad,H-24,W-pad*2,3);c.fillStyle='#a99aff';c.fillRect(pad,H-24,(W-pad*2)*Math.min(t/total,1),3);
   }
   button.textContent=`Recording ${Math.min(Math.floor(t),total)} / ${total}s`;
   if(t>=total){running=false;controls.enabled=true;outputs.forEach(o=>o.recorder?.stop());}
  }
 };
}
