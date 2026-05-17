from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import requests
from urllib.parse import urlparse, parse_qs

BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw"
CHAT_ID = "-1003915557006"

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        youtube_url = query.get('url', [None])[0]
        
        if not youtube_url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing url parameter'}).encode())
            return
            
        try:
            ydl_opts = {'format': 'm4a/bestaudio/best', 'quiet': True}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                stream_url = info['url']
                title = info.get('title', 'Audio')
                
            audio_data = requests.get(stream_url).content
            
            files = {'audio': (f"{title}.m4a", audio_data, 'audio/mp4')}
            data = {'chat_id': CHAT_ID, 'title': title}
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendAudio"
            resp = requests.post(url, data=data, files=files).json()
            
            if resp.get('ok'):
                file_id = resp['result']['audio']['file_id']
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'file_id': file_id, 'title': title}).encode())
            else:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Telegram upload failed', 'details': resp}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
        return
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type')
        self.end_headers()
