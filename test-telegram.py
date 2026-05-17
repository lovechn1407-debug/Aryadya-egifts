import yt_dlp
import requests
import sys

BOT_TOKEN = "8832668653:AAER53dyUKzFn6lXK3ex2dtEEgErTTNSjlw"
CHAT_ID = "-1003915557006"

def upload_to_telegram(youtube_url):
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'quiet': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        stream_url = info['url']
        title = info.get('title', 'Audio')
        
    print(f"Got stream URL for {title}")
    
    # Download into memory
    print("Downloading audio...")
    audio_data = requests.get(stream_url).content
    
    print("Uploading to Telegram...")
    # Upload to Telegram
    files = {
        'audio': (f"{title}.m4a", audio_data, 'audio/mp4')
    }
    data = {
        'chat_id': CHAT_ID,
        'title': title
    }
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendAudio"
    resp = requests.post(url, data=data, files=files).json()
    
    if resp.get('ok'):
        file_id = resp['result']['audio']['file_id']
        print(f"Success! file_id: {file_id}")
    else:
        print("Telegram upload failed:", resp)

if __name__ == "__main__":
    upload_to_telegram("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
