from flask import Flask, jsonify
from flask_cors import CORS 
import os
import openai

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})  

@app.route("/api/members")
def members():
    return jsonify({"members": "member123"})

@app.route("/api/code")
def code():
  openai.api_key = "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"

  response = openai.ChatCompletion.create(
  model="gpt-3.5-turbo-16k-0613",
  messages=[
    {
      "role": "user",
      "content": "Act as a senior programmer who does not give any descriptions.Generate only code for python program to find odd or even number. There should no description strictly"
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
  return jsonify({"code": list})



if __name__ == "__main__":
    app.run(debug=True)
