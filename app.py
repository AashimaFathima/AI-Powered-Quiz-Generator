import os
from dotenv import load_dotenv
load_dotenv()


from flask import Flask, render_template, request, jsonify
import PyPDF2
from groq import Groq
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_questions(paragraph, num_mcqs, num_fibs, num_tfs):
    try:
        # Token management
        input_tokens = len(paragraph.split())
        max_input_tokens = 4000
        max_output_tokens = 3000
        max_tokens_limit = 7000

        if input_tokens > max_input_tokens:
            paragraph = " ".join(paragraph.split()[:max_input_tokens])
            input_tokens = len(paragraph.split())

        tokens_per_question = 100
        total_requested_tokens = tokens_per_question * (num_mcqs + num_fibs + num_tfs)
        if total_requested_tokens > max_output_tokens or input_tokens + total_requested_tokens > max_tokens_limit:
            return None

        # Prompt (as in your Colab)
        prompt = f"""
You are an expert AI question generator.
Generate exactly {num_mcqs} multiple-choice questions, {num_fibs} fill-in-the-blank questions, and {num_tfs} True/False questions from the following text:
{paragraph}

Rules:
1. No two questions under the same category should share the same idea, theme, or fact.
2. For fill-in-the-blank questions, remove key terms and replace with "" while keeping grammatical correctness.
3. For True/False questions, ensure each statement is a fact that can be evaluated as True or False.
4. Only generate the exact number of questions requested.

Format the response as follows:

MCQs:
Q1: [Question text]
a) [Option 1]
b) [Option 2]
c) [Option 3]
d) [Option 4]
Answer: [Correct Option]

F-I-Bs:
Q1: [Sentence with a blank like __________]
Answer: [Correct Answer]

T or F:
Q1: [Statement]
Answer: [True/False]
"""
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
            max_tokens=total_requested_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        print("Generation error:", e)
        return None

def extract_text_from_pdf(pdf_file):
    try:
        reader = PyPDF2.PdfReader(pdf_file)
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        return text
    except Exception as e:
        print("PDF extraction error:", e)
        return ""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def handle_generation():
    text = request.form.get('text', '').strip()
    file = request.files.get('pdf')
    paragraph = extract_text_from_pdf(file) if file else text

    if not paragraph:
        return jsonify({'error': 'No text provided'}), 400

    try:
        mcqs = int(request.form.get('mcqs', 0))
        fibs = int(request.form.get('fibs', 0))
        tfs  = int(request.form.get('tfs', 0))
    except ValueError:
        return jsonify({'error': 'Invalid question numbers'}), 400

    questions = generate_questions(paragraph, mcqs, fibs, tfs)
    if not questions:
        return jsonify({'error': 'Failed to generate questions. Try reducing the numbers.'}), 500

    return jsonify({'questions': questions})

if __name__ == '__main__':
    app.run(debug=True)
