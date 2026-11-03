"""Local-only sink for development canvas recordings. No external uploads."""
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]/'marketing-output'
ROOT.mkdir(exist_ok=True)
class Sink(BaseHTTPRequestHandler):
 def do_OPTIONS(self):
  self.send_response(204)
  self.send_header('Access-Control-Allow-Origin','http://127.0.0.1:5175')
  self.send_header('Access-Control-Allow-Methods','POST')
  self.send_header('Access-Control-Allow-Headers','content-type')
  self.end_headers()
 def do_POST(self):
  if self.path not in ['/youtube.webm','/linkedin.webm'] or self.headers.get('Origin')!='http://127.0.0.1:5175':
   self.send_error(403);return
  size=int(self.headers.get('Content-Length','0'))
  if not 0<size<250_000_000:self.send_error(413);return
  data=self.rfile.read(size)
  (ROOT/self.path[1:]).write_bytes(data)
  self.send_response(200);self.send_header('Access-Control-Allow-Origin','http://127.0.0.1:5175');self.end_headers();self.wfile.write(b'saved')
HTTPServer(('127.0.0.1',8788),Sink).serve_forever()
