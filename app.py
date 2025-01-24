from flask import Flask, render_template, request, jsonify, url_for, redirect
from langdetect import detect, DetectorFactory
from gtts import gTTS
import os
import threading
import time

DetectorFactory.seed = 0

app = Flask(__name__)

# Ensure the audio folder exists inside static
if not os.path.exists('static/audio'):
    os.makedirs('static/audio')

# Global variable to track progress
progress = {"status": 0, "message": "Initializing..."}

def generate_audio(text, language, audio_path):
    """
    Background task to generate audio while updating progress.
    """
    global progress
    try:
        progress["status"] = 25
        progress["message"] = "Detecting language..."
        time.sleep(0.5)

        # Generate audio using gTTS
        progress["status"] = 50
        progress["message"] = "Generating audio..."
        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(audio_path)

        # Finalize progress
        progress["status"] = 100
        progress["message"] = "Completed!"
    except Exception as e:
        progress["status"] = -1
        progress["message"] = f"Error: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    global progress
    text = request.form.get('text', '').strip()
    audio_path = os.path.join('static', 'audio', 'output.mp3')  # Save audio inside static/audio

    # Validate text input
    if not text:
        return jsonify({"error": "Text input is empty. Please provide valid text."}), 400

    try:
        # Detect language
        language = detect(text)

        # Reset progress
        progress = {"status": 0, "message": "Initializing..."}

        # Start background task for audio generation
        threading.Thread(target=generate_audio, args=(text, language, audio_path)).start()

        # Provide URL for playback
        audio_url = url_for('static', filename='audio/output.mp3')
        return jsonify({"success": True, "audio_url": audio_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/progress', methods=['GET'])
def get_progress():
    """
    Endpoint to fetch the current progress.
    """
    global progress
    return jsonify(progress)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Extract form data
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')

        if not name or not email or not message:
            return render_template('contact.html', error="All fields are required!")

        # For now, log the message (you can extend this to save to a database or send an email)
        print(f"Message from {name} ({email}): {message}")

        # Redirect to the thank-you page
        return redirect(url_for('thank_you', name=name))
    return render_template('contact.html')

@app.route('/thank_you')
def thank_you():
    # Get the user's name from the query parameters
    name = request.args.get('name', 'Guest')
    return render_template('thank_you.html', name=name)

if __name__ == '__main__':
    app.run(debug=True)
