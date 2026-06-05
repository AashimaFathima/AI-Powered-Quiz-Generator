# AI-Powered Quiz Generator ⚡🧠

Generate interactive quizzes from plain text or PDF documents using Large Language Models. Built with Flask, Groq's ultra-fast inference engine, and deployed using Docker on AWS EC2.

Perfect for students, educators, and anyone looking to quickly turn study material into self-assessment quizzes.

---

## ✨ Features

### 📄 Multiple Input Modes

* Paste raw text directly into the application.
* Upload PDF documents for automatic text extraction.
* Supports academic notes, research papers, blog posts, and technical documentation.

### 🧠 AI-Powered Question Generation

Generate a custom mix of:

* Multiple Choice Questions (MCQs)
* Fill in the Blanks (FIBs)
* True / False Questions

Users can freely choose the number of each type (up to 30 questions total).

### 🎯 Interactive Quiz Experience

* Real-time quiz interface
* Immediate score calculation
* Side-by-side answer comparison
* Downloadable quiz results

### 🛡️ Robust Backend

* Input validation
* Token limit management
* Error handling and logging
* Secure API key management using environment variables

---

## ⚙️ How It Works

1. Enter text or upload a PDF.
2. The application extracts and preprocesses the content.
3. The Groq API generates AI-powered questions.
4. Questions are converted into an interactive quiz.
5. Users submit answers and receive instant feedback.

---

## 🛠️ Tech Stack

| Category               | Technologies             |
| ---------------------- | ------------------------ |
| Backend                | Python, Flask            |
| AI Model               | Llama 3.3 70B Versatile  |
| AI Inference           | Groq API                 |
| PDF Processing         | PyPDF2                   |
| Frontend               | HTML, CSS, JavaScript    |
| Deployment             | Docker, AWS EC2 (Ubuntu) |
| Environment Management | python-dotenv            |
| Logging                | Python Logging Module    |

---

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/AashimaFathima/AI-Powered-Quiz-Generator.git

cd AI-Powered-Quiz-Generator

# Create virtual environment
python -m venv env

# Windows
env\Scripts\activate

# Linux / macOS
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Add your API key
echo GROQ_API_KEY=your_api_key_here > .env

# Run application
python main.py
```

Open:

```
http://localhost:5000
```


## 📂 Project Structure

```
AI-Powered-Quiz-Generator/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── templates/
├── static/
├── main.py
├── Dockerfile
├── requirements.txt
├── .dockerignore
└── README.md
```

---

## 🔮 Future Improvements

* HTTPS-enabled deployment
* Authentication system
* Question difficulty customization
* Multi-document quiz generation

---

## 📄 License

This project is licensed under the MIT License.
