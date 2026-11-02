"""Assemble the two actual-app canvas captures with offline narration and original music."""
import json, wave, subprocess, textwrap
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'marketing-output'
scenes=json.loads((ROOT/'src/dev/film.json').read_text())
rate=48000; total=sum(s['duration'] for s in scenes)
music=np.zeros(total*rate,dtype=np.float32)
# Original restrained ambient score: no samples, stock tracks, or third-party music.
for bar in range(0,total,4):
 t=np.arange(min(4,total-bar)*rate)/rate
 root=[130.813,103.826,155.563,116.541][(bar//4)%4]
 env=np.minimum(t/.5,1)*np.minimum((len(t)/rate-t)/.8,1)
 chord=sum(np.sin(2*np.pi*root*r*t) for r in [1,1.5,2])/3
 music[bar*rate:bar*rate+len(t)]+=(chord*env*.024).astype(np.float32)
 for beat in [0,1,2,3]:
  n=min(int(.18*rate),len(t)-beat*rate)
  if n>0:
   bt=np.arange(n)/rate
   pulse=np.sin(2*np.pi*(65*bt-35*bt*bt))*np.exp(-bt*24)*.045
   music[bar*rate+beat*rate:bar*rate+beat*rate+n]+=pulse.astype(np.float32)
with wave.open(str(OUT/'original-score.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes((music*32767).astype('<i2').tobytes())
inputs=['-i',str(OUT/'original-score.wav')]
filters=[]; labels=['[0:a]']; offset=0; subs=[]; seq=1
stamp=lambda v:f'{int(v//3600):02}:{int(v%3600//60):02}:{int(v%60):02},{int(v%1*1000):03}'
import re
for i,s in enumerate(scenes):
 inputs+=['-i',str(OUT/f'voice-{i}.wav')]
 delay=int((offset+.55)*1000);filters.append(f'[{i+1}:a]aresample=48000,adelay={delay}:all=1[v{i}]');labels.append(f'[v{i}]')
 parts=re.findall(r'[^.!?]+[.!?]+',s['narration']); chars=sum(map(len,parts)); at=offset+.55
 for part in parts:
  end=at+len(part)/chars*s['voiceDuration'];subs.append(f'{seq}\n{stamp(at)} --> {stamp(end)}\n'+ '\n'.join(textwrap.wrap(part.strip(),58))+'\n');seq+=1;at=end
 offset+=s['duration']
filters.append(''.join(labels)+f'amix=inputs={len(labels)}:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,apad,atrim=0:{total}[mix]')
subprocess.run(['ffmpeg','-y','-v','warning',*inputs,'-filter_complex',';'.join(filters),'-map','[mix]','-ar','48000',str(OUT/'master-audio.wav')],check=True)
(OUT/'bot-office-captions.srt').write_text('\n'.join(subs),encoding='utf-8')

from PIL import Image, ImageDraw, ImageFont
cta=Image.new('RGBA',(1080,1350),(0,0,0,0)); draw=ImageDraw.Draw(cta)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',29)
draw.text((64,1220),'github.com/MRSHAKILS/bot-office',font=font,fill='#c1b8ff')
cta.save(OUT/'linkedin-cta.png')
for name in ['youtube','linkedin']:
 wide=name=='youtube'; x,y,w,h=(650,160,1210,720) if wide else (40,430,1000,620)
 # Smooth the rendered viewport only. Keep typography/caption changes untouched.
 vf=f'[0:v]split[b][c];[b]fps=30[base];[c]crop={w}:{h}:{x}:{y},minterpolate=fps=30:mi_mode=mci:mc_mode=obmc:me_mode=bidir:vsbmc=1:scd_threshold=4[smooth];[base][smooth]overlay={x}:{y}:eof_action=pass'
 extra=[]
 if not wide:
  extra=['-i',str(OUT/'linkedin-cta.png')]
  vf+='[v];[v][2:v]overlay=enable=gte(t\\,68):eof_action=repeat'
 vf+='[final]'
 subprocess.run(['ffmpeg','-y','-v','warning','-i',str(OUT/f'{name}.webm'),'-i',str(OUT/'master-audio.wav'),*extra,'-filter_complex',vf,'-map','[final]','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',str(total),'-movflags','+faststart',str(OUT/f'bot-office-{name}.mp4')],check=True)
 print('Rendered',name,flush=True)
