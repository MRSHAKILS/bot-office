import assert from 'node:assert/strict';
import { Bot } from '../src/bots/bot';
import { DEMO_TEAM, LIVE_TEAM } from '../src/bots/team';
import { LOUNGE_SEATS, deskSeat, LEAD_SEAT, FLOOR_BOUNDS } from '../src/office/layout';
import { stationFor } from '../src/office/stations';
import { poseFor } from '../src/bots/motion';
assert.equal(DEMO_TEAM.length,12); assert.equal(LIVE_TEAM.length,11);
assert.equal(new Set(DEMO_TEAM.map(m=>m.id)).size,12);
assert.ok(DEMO_TEAM.every(m=>!LIVE_TEAM.some(l=>l.id===m.id)));
assert.ok(!DEMO_TEAM.some(m=>m.dept.startsWith('School')));
assert.ok(LIVE_TEAM.some(m=>m.short==='NSU'));
assert.deepEqual(poseFor('idle',true,0,0,false),poseFor('idle',true,10,2,false));
let samples=0;
for (const team of [DEMO_TEAM,LIVE_TEAM]) for (const [i,m] of team.entries()) {
 const bot=new Bot(m,LOUNGE_SEATS[i]); let time=0;
 const walk=(seconds:number)=>{for(let n=0;n<seconds*20;n++){
  const before=bot.group.position.clone(); time+=50; bot.update(.05,time);
  const p=bot.group.position; assert.ok(p.distanceTo(before)<.35,`${m.short}: teleport`);
  assert.ok(p.x>=FLOOR_BOUNDS.x0 && p.x<=FLOOR_BOUNDS.x1 && p.z>=FLOOR_BOUNDS.z0 && p.z<=FLOOR_BOUNDS.z1,`${m.short}: outside floor`);
  for(const other of team){ if(other.id===m.id || other.lead)continue;
    const q=deskSeat(other); const w=stationFor(other).desk.width??2;
    assert.ok(!(Math.abs(p.x-q.x)<w/2+.12 && p.z>q.z-1.55 && p.z<q.z-.45),`${m.short} crosses ${other.short} desk`);
  }
  samples++;
 }};
 bot.setState('working','Checking',0,true); walk(100);
 assert.ok(bot.group.position.distanceTo(m.lead?LEAD_SEAT:deskSeat(m))<.05,`${m.short}: missed desk`);
 assert.ok(bot.seated,`${m.short}: not seated`);
 bot.setState('done','Done',time,true); walk(100);
 assert.ok(bot.group.position.distanceTo(LOUNGE_SEATS[i])<.05,`${m.short}: missed lounge`);
 bot.setState('idle','',time,true); walk(2);
 const p=bot.group.position.clone(); walk(2); assert.ok(bot.group.position.equals(p));
}
console.log(`PASS: ${samples} motion samples across 12 demo + 11 live bots; bounded steps, desk clearance, arrivals, handoffs, idle stability.`);

// Repeated status polls must not restart the route; a coarse renderer still arrives.
for(const name of ['Fitness','SWE','Gemini']) {
 const i=DEMO_TEAM.findIndex(m=>m.short===name), m=DEMO_TEAM[i];
 const b=new Bot(m,LOUNGE_SEATS[i]); b.setState('working','Checking',0,true);
 for(let frame=0;frame<600;frame++){
  const dt=frame%7===0?.8:.1, previous=b.group.position.clone();
  if(frame%20===0)b.setState('working','Checking',frame*100,true);
  const n=Math.ceil(dt/.05);for(let step=0;step<n;step++)b.update(dt/n,frame*100);
  assert.ok(b.group.position.distanceTo(previous)<dt*8,`${name}: slow-frame warp`);
 }
 assert.ok(b.group.position.distanceTo(deskSeat(m))<.05,`${name}: repeated status restarted route`);
}
console.log('PASS: Fitness, SWE and Gemini arrive under repeated status updates and mixed 100/800ms frame gaps.');
