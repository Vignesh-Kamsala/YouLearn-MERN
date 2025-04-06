import sys
import json
import traceback
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, VideoUnavailable

video_id = sys.argv[1]

try:
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    text = " ".join([t['text'] for t in transcript])
    prompt = """You are a YouTube summarizer.You will be taking the transcript text and summarizing the entire video.Provide the important summary in bullet points, within 250 words.Focus on key ideas, steps, arguments, or messages.Please provide the summary of the text given here:\n"""
    
    full_input = prompt + text
    print(json.dumps({ "success": True, "transcript": full_input }))
except VideoUnavailable:
    print(json.dumps({"error": "Video unavailable", "trace": f"Video ID: {video_id}"}))
except TranscriptsDisabled:
    print(json.dumps({"error": "Transcripts disabled", "trace": f"Video ID: {video_id}"}))
except Exception as e:
    print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))
