# AI-Powered Quiz Generator ⚡🧠

Transform text/PDFs into interactive quizzes instantly using cutting-edge AI! Perfect for students, educators, and content creators.

## Key Features 🚀

✅ **Smart Question Generation**  
- Generate **20-30 questions** per session (MCQs + Fill-in-Blanks + True/False combo)
- Dynamic capacity: Choose your mix (e.g., 10 MCQs + 15 FIBs + 5 T/F = 30 total)
- Context-aware MCQs that test core concepts effectively

⚡ **Fast Performance**  
- Average generation time: **2-4 seconds** 
- Zero latency answer checking
- Instant results display

📊 **Comprehensive Results System**  
- Immediate score display with percentage
- Side-by-side answer comparison
- Fuzzy matching for flexible answer validation

📚 **Content Adaptability**  
- Handles academic papers, blog posts, technical docs
- Maintains context across generated questions
- Auto-optimizes question difficulty based on content

## How It Works 🔧

1. **Input** → Paste text or upload PDF
2. **AI Analysis** → Finds key concepts/dates/names
3. **Question Creation** → Generates varied formats
4. **Quality Check** → Removes duplicates
5. **Quiz Delivery** → Interactive interface

## Tech Stack 💻

 LLaMA 3 70B – Utilized for advanced question generation logic, offering high performance in logical reasoning tasks.
 Groq API – Employed for ultra-fast AI inference, to deliver low-latency responses.
 Python Flask - Server & API handling facilitating seamless communication between the frontend and backend      
 PyPDF2 - Text extraction from PDFs   

## Installation 📦

```bash
# 1. Clone repo
git clone https://github.com/yourusername/quiz-generator.git
cd quiz-generator

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Add API key
echo "GROQ_API_KEY=your_key_here" > .env

#5. Run the application 
python app.py
```

Visit http://localhost:5000 and:

1. Choose text or PDF input
2. Select question counts (max 30 total)
3. Generate → Take quiz → See results!

📁 Project Structure

    ├── app.py                 # Flask backend
    ├── templates/
    │   └── index.html         # Frontend HTML
    ├── static/
    │   ├── style.css          # Styling
    │   └── script.js          # Frontend logic
    ├── requirements.txt       # Python dependencies
    └── .env                   # Environment variables


## 📸 Screenshots

![Screenshot 445](screenshot/Screenshot%20(445).png)
![Screenshot 446](screenshot/Screenshot%20(446).png)
![Screenshot 452](screenshot/Screenshot%20(452).png)
![Screenshot 456](screenshot/Screenshot%20(456).png)
![Screenshot 460](screenshot/Screenshot%20(460).png)
![Screenshot 463](screenshot/Screenshot%20(463).png)

## License 📜
 This project is licensed under the MIT License. See the LICENSE file for more details