from flask import Flask, jsonify , request
from flask_cors import CORS 
from flask_cors import cross_origin
import openai
from transformers import pipeline
app = Flask(__name__)
speechRecognizer = pipeline("automatic-speech-recognition", model="facebook/wav2vec2-base-960h")

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
    data = request.audioBlob
    print(data)
    
    
    text_transcribe = "Reached backend successfully"
    return jsonify({"transcription": text_transcribe})

  except Exception as e:
    print("Error:", str(e))
    return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)

