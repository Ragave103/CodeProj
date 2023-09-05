from flask import Flask, jsonify,request
from flask_cors import CORS 
import openai
app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route("/api/members")
def members():
    return jsonify({"members": "member123"})

@app.route("/api/code",methods=['POST'])
def code():
  openai.api_key = "apikey"
  data = request.get_json()
  choice = data.get('choice','')
  program = data.get('program','')
  if not choice or not program:
        return jsonify({"error": "Invalid data sent from the frontend"}), 400

  
  prompt = f"Act as a senior programmer who gives comments does not give any descriptions .Generate only code for{choice} program to {program}. There should no description strictly"

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



if __name__ == "__main__":
    app.run(debug=True)
