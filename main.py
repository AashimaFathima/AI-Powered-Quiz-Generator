import os
import logging
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import PyPDF2
from groq import Groq

# -----------------------------
# Environment
# -----------------------------
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(
    filename="quiz.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# -----------------------------
# Flask
# -----------------------------
app = Flask(__name__)
CORS(app)

client = Groq(api_key=GROQ_API_KEY)

# -----------------------------
# Constants
# -----------------------------
MAX_INPUT_TOKENS = 4000
MAX_OUTPUT_TOKENS = 3000
MAX_TOTAL_TOKENS = 7000
TOKENS_PER_QUESTION = 100
MAX_QUESTIONS = 30


# -----------------------------
# Helper Functions
# -----------------------------
def error_response(message, status_code=400):
    logging.warning(message)
    return jsonify({"error": message}), status_code


def extract_text_from_pdf(pdf_file):
    try:
        reader = PyPDF2.PdfReader(pdf_file)

        text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        ).strip()

        return text

    except Exception as e:
        logging.error(f"PDF Extraction Error : {e}")
        return ""


# -----------------------------
# Question Generator
# -----------------------------
def generate_questions(
    paragraph,
    num_mcqs,
    num_fibs,
    num_tfs
):
    try:

        input_tokens = len(paragraph.split())

        if input_tokens > MAX_INPUT_TOKENS:
            paragraph = " ".join(
                paragraph.split()[:MAX_INPUT_TOKENS]
            )
            input_tokens = len(paragraph.split())

        total_questions = (
            num_mcqs +
            num_fibs +
            num_tfs
        )

        total_requested_tokens = (
            TOKENS_PER_QUESTION *
            total_questions
        )

        if (
            total_requested_tokens > MAX_OUTPUT_TOKENS
            or
            input_tokens +
            total_requested_tokens >
            MAX_TOTAL_TOKENS
        ):
            logging.warning(
                "Token limit exceeded."
            )
            return None

        prompt = f"""
You are an expert AI question generator.

Generate exactly
{num_mcqs} multiple-choice questions,
{num_fibs} fill-in-the-blank questions,
and
{num_tfs} True/False questions
from the following text:

{paragraph}

Rules:

1. No two questions under the same category should share the same idea, theme, or fact.

2. For fill-in-the-blank questions, remove key terms and replace with "" while keeping grammatical correctness.

3. For True/False questions, ensure each statement is a fact that can be evaluated as True or False.

4. Only generate the exact number of questions requested.

Format:

MCQs:
Q1:
a)
b)
c)
d)
Answer:

F-I-Bs:
Q1:
Answer:

T or F:
Q1:
Answer:
"""

        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=total_requested_tokens
        )

        return response.choices[0].message.content

    except Exception as e:
        import traceback

        traceback.print_exc()

        logging.exception(
            "Question Generation Error"
        )

        return str(e)


# -----------------------------
# Routes
# -----------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def handle_generation():

    text = request.form.get(
        "text",
        ""
    ).strip()

    pdf_file = request.files.get("pdf")

    paragraph = (
        extract_text_from_pdf(pdf_file)
        if pdf_file
        else text
    )

    if not paragraph:
        return error_response(
            "Please provide text or upload a PDF."
        )

    try:
        mcqs = int(
            request.form.get("mcqs", 0)
        )

        fibs = int(
            request.form.get("fibs", 0)
        )

        tfs = int(
            request.form.get("tfs", 0)
        )

    except ValueError:
        return error_response(
            "Invalid question numbers."
        )

    if (
        mcqs < 0
        or
        fibs < 0
        or
        tfs < 0
    ):
        return error_response(
            "Question count cannot be negative."
        )

    total_questions = (
        mcqs +
        fibs +
        tfs
    )

    if total_questions == 0:
        return error_response(
            "Select at least one question."
        )

    if total_questions > MAX_QUESTIONS:
        return error_response(
            f"Maximum {MAX_QUESTIONS} questions allowed."
        )

    logging.info(
        f"Quiz Request | "
        f"MCQs={mcqs}, "
        f"FIBs={fibs}, "
        f"TFs={tfs}"
    )

    questions = generate_questions(
        paragraph,
        mcqs,
        fibs,
        tfs
    )

    if questions is None:
        return error_response(
            "Question generation failed.",
            500
        )

    # If generate_questions returned the exception text
    if questions.startswith("Error") or questions.startswith("401") or questions.startswith("429"):
        return error_response(
            questions,
            500
        )

    logging.info(
        f"Quiz Generated Successfully | Total={total_questions}"
    )

    return jsonify({
        "questions": questions
    })


# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)