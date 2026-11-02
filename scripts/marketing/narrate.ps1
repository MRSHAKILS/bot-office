# Generates local synthetic narration; no voice cloning or external speech service.
Add-Type -AssemblyName System.Speech
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$destination = Join-Path $projectRoot 'marketing-output'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SelectVoice('Microsoft Zira Desktop')
$voice.Rate = 1
$scenes = Get-Content (Join-Path $projectRoot 'src/dev/film.json') -Raw | ConvertFrom-Json
try {
 for($i=0; $i -lt $scenes.Count; $i++) {
  $voice.SetOutputToWaveFile((Join-Path $destination "voice-$i.wav"))
  $voice.Speak($scenes[$i].narration)
  $voice.SetOutputToNull()
 }
} finally { $voice.Dispose() }
