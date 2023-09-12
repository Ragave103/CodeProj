from flask import Flask, jsonify , request
from flask_cors import CORS 
from flask_cors import cross_origin
import openai
from pydub import AudioSegment
AudioSegment.ffmpeg = "C:\\ffmpeg-6.0-essentials_build\\bin\\ffmpeg.exe"
import speech_recognition as sr

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route("/api/members")
def members():
    return jsonify({"members": "member123"})

@app.route("/api/code",methods=['POST'])
def code():
  openai.api_key = "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"
  data = request.get_json()
  choice = data.get('choice','')
  program = data.get('program','')
  if not choice or not program:
        return jsonify({"error": "Invalid data sent from the frontend"}), 400

  
  prompt = f"Generate only code for{choice} program to {program}. There should no description strictly"

  response = openai.ChatCompletion.create(
  model="gpt-3.5-turbo-16k-0613",
  messages=[
    {
      "role": "user",
      "content": prompt
    }
  ],
  temperature=0.83,
  max_tokens=256,
  top_p=1,
  frequency_penalty=0,
  presence_penalty=0
  )
  resp = response.choices[0].message.content
  list = resp.splitlines()
  for i in range(2):
    index_to_remove = next((i for i, elem in enumerate(list) if "```" in elem), None)

    if index_to_remove is not None:
        if i == 0:
            list = list[index_to_remove + 1 :]
        else:
            list = list[:index_to_remove]
  return jsonify({"code": list})

@app.route("/api/transcribe",methods=['POST'])
def transcribe_audio():
  try:
    print("Received POST request to /api/transcribe")
    print("Request Headers:", request.headers)
    data = request.files.get("audioBlob")
    print(data)
    print("got data")
    
    audio = AudioSegment.from_file(data,format='webm')
    conv_audio=audio.export('temp.wav',format='wav')
    print("audio converted")
    
    recognizer = sr.Recognizer()
    print("Recognizer created")
    with sr.AudioFile(conv_audio) as source:
      audio_data=recognizer.record(source)
    print("audio data created")
    
    text_transcribe = "Reached back end"
    
    text_transcribe=recognizer.recognize_google(audio_data)
    
    print("transcribed using google")
    print(text_transcribe)
    return jsonify({"text": text_transcribe})

  except Exception as e:
    print("Error:", str(e))
    return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
