import yt_dlp
import json

def get_audio_url(youtube_url):
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url']

if __name__ == "__main__":
    url = get_audio_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    print(url)
