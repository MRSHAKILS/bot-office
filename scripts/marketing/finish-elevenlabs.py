import json,subprocess,re,textwrap
from pathlib import Path
root=Path('.'); out=root/'marketing-output'; scenes=json.loads((root/'src/dev/film.json').read_text())
bounds=[0,8.1867,17.4119,28.2777,37.5340,46.4342,56.5030,66.24]
filters=[];offset=0;events=[]
for i,s in enumerate(scenes):
 a,b=bounds[i:i+2]; delay=int((offset+.4)*1000)
 filters.append(f'[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,adelay={delay}:all=1[v{i}]')
 parts=re.split(r'(?<=[.!?])\s+',s['narration'].replace('let us','let\'s')); weights=sum(len(p) for p in parts); at=offset+.4
 for part in parts:
  end=at+len(part)/weights*(b-a);events.append((at,end,part));at=end
 offset+=s['duration']
filters.append('[1:a]volume=0.5[bed]')
filters.append(''.join(f'[v{i}]' for i in range(7))+'[bed]amix=inputs=8:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,apad,atrim=0:80[final]')
import numpy as np, wave
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(out/'elevenlabs-jamie.mp3'),'-f','f32le','-ar','48000','-ac','1','pipe:1'])
voice=np.frombuffer(raw,dtype='<f4');mix=np.zeros(80*48000,dtype=np.float32)
with wave.open(str(out/'original-score.wav'),'rb') as f: bed=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float32)/32768
mix[:len(bed)]+=bed*.35
offset=0
for i,s in enumerate(scenes):
 a,b=bounds[i:i+2];part=voice[int(a*48000):int(b*48000)];at=int((offset+.4)*48000);mix[at:at+len(part)]+=part;offset+=s['duration']
mix*=.84/max(.84,float(np.max(np.abs(mix))))
with wave.open(str(out/'elevenlabs-master.wav'),'wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000);f.writeframes((mix*32767).astype('<i2').tobytes())

def stamp(t,ass=False):
 return f'{int(t//3600)}:{int(t%3600//60):02}:{int(t%60):02}.{int(t%1*100):02}' if ass else f'{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int(t%1*1000):03}'
(out/'bot-office-captions.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n'+ '\n'.join(textwrap.wrap(p,62)) for i,(a,b,p) in enumerate(events)),encoding='utf-8')
for name,W,H,y in [('youtube',1920,1080,920),('linkedin',1080,1350,1100)]:
 ass=f'''[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,32,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,64,64,30,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
 for a,b,p in events:
  txt='\\N'.join(textwrap.wrap(p,100 if name=='youtube' else 54));ass+=f'Dialogue: 0,{stamp(a,True)},{stamp(b,True)},Default,,0,0,0,,{{\\pos(64,{y})}}{txt}\n'
 if name=='linkedin':ass+='Dialogue: 0,0:01:08.00,0:01:20.00,Default,,0,0,0,,{\\pos(64,1220)\\fs27}github.com/MRSHAKILS/bot-office\n'
 (out/f'{name}-final.ass').write_text(ass,encoding='utf-8')
 box='890:h=120' if name=='youtube' else '1070:h=190'
 vf=f'minterpolate=fps=30:mi_mode=blend,drawbox=x=0:y={box}:w=iw:color=0x081522:t=fill,subtitles=marketing-output/{name}-final.ass'
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(out/f'{name}.webm'),'-i',str(out/'elevenlabs-master.wav'),'-vf',vf,'-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t','80','-movflags','+faststart',str(out/f'bot-office-{name}-elevenlabs.mp4')],check=True)
 print('DONE',name,flush=True)
