"""Re-edit verified continuous portions of actual app footage; reject source gaps."""
import subprocess,json,wave
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
OUT=Path('marketing-output'); FF='C:/ffmpeg/bin/ffmpeg.exe'; FP='C:/ffmpeg/bin/ffprobe.exe'
def run(args): subprocess.run([FF,'-y','-v','error',*args],check=True)
source=OUT/'youtube.webm'
meta=json.loads(subprocess.check_output([FP,'-v','error','-select_streams','v','-show_entries','frame=best_effort_timestamp_time','-of','json',str(source)]))
ts=[float(x['best_effort_timestamp_time']) for x in meta['frames']]
shots=[68.5,72.5,21.5,25.5,63,75.5]
for start in shots:
 selected=[t for t in ts if start-.3<=t<=start+4.3]
 gaps=[b-a for a,b in zip(selected,selected[1:]) if a<start+4 and b>start]
 assert gaps and max(gaps)<.35, (start,max(gaps))
raw=subprocess.check_output([FF,'-v','error','-i',str(OUT/'elevenlabs-jamie.mp3'),'-f','f32le','-ar','48000','-ac','1','pipe:1'])
voice=np.frombuffer(raw,dtype='<f4'); mix=np.zeros(24*48000,dtype=np.float32)
for a,b,at in [(0,17.4119,.15),(61.9,66.24,19.4)]:
 part=voice[int(a*48000):int(b*48000)].copy();n=240;part[:n]*=np.linspace(0,1,n);part[-n:]*=np.linspace(1,0,n);mix[int(at*48000):int(at*48000)+len(part)]+=part
with wave.open(str(OUT/'original-score.wav'),'rb') as f: bed=np.frombuffer(f.readframes(24*48000),dtype='<i2')/32768
mix+=bed*.25;mix*=.85/max(.85,float(abs(mix).max()))
with wave.open(str(OUT/'short-master.wav'),'wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000);f.writeframes((mix*32767).astype('<i2').tobytes())
headlines=['What if your AI team\nhad an office?','See the team.\nUnderstand the work.','Different roles.\nOne shared space.','Research. QA.\nMarketing. Product.','Explore every angle.','Let’s build\nsomething useful.']
for name,W,H in [('youtube',1920,1080),('linkedin',1080,1350)]:
 portrait=H>W
 for i,start in enumerate(shots):
  im=Image.new('RGBA',(W,H),'#06121f');d=ImageDraw.Draw(im)
  def txt(pos,text,size,color='#f1f5fc',bold=False): d.multiline_text(pos,text,font=ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if bold else 'arial.ttf'),size),fill=color,spacing=10)
  txt((64,45),'BOT OFFICE',26,'#afa2ff',True)
  txt((64,115),headlines[i],64 if portrait else 66,bold=True)
  x,y,w,h=(0,390,1080,643) if portrait else (380,310,1160,690)
  d.rectangle((x,y,x+w,y+h),fill=(0,0,0,0))
  txt((64,1090 if portrait else 265),'github.com/MRSHAKILS/bot-office' if i==5 else 'A visual workspace for AI teamwork',28,'#b5c6d9')
  txt((64,H-52),'SIMULATION • ILLUSTRATIVE PERSONAS',20,'#9eb2c5')
  im.save(OUT/f'short-{name}-{i}.png')
  vf=f'[0:v]crop=1210:720:650:160,scale={w}:{h},fps=30,pad={W}:{H}:{x}:{y}:color=0x06121f[v];[v][1:v]overlay=0:0:format=auto,format=yuv420p[out]'
  run(['-ss',str(start),'-i',str(source),'-loop','1','-i',str(OUT/f'short-{name}-{i}.png'),'-filter_complex',vf,'-map','[out]','-an','-t','4','-c:v','libx264','-preset','fast','-crf','18',str(OUT/f'short-{name}-{i}.mp4')])
 (OUT/f'short-{name}.txt').write_text(''.join(f"file 'short-{name}-{i}.mp4'\n" for i in range(6)))
 run(['-f','concat','-safe','0','-i',str(OUT/f'short-{name}.txt'),'-i',str(OUT/'short-master.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-t','24','-movflags','+faststart',str(OUT/f'bot-office-{name}-recut.mp4')])
 print('DONE',name,flush=True)
