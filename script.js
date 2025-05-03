
const generateBtn        = document.querySelector('.generate-btn');
const quizSection        = document.getElementById('quiz-section');
const questionsContainer = document.getElementById('questions-container');
const scoreElement       = document.getElementById('score');
const errorElement       = document.getElementById('error');
const showResultsBtn     = document.getElementById('show-results-btn');
const resultsContainer   = document.getElementById('results-container');


let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
  generateBtn.addEventListener('click', handleGenerate);
  showResultsBtn.addEventListener('click', displayResults);
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

async function handleGenerate() {
  try {
    resetState();
    const formData = prepareFormData();
    validateInputs(formData);

    showLoadingState(true);
    const response = await fetch('/generate', { method: 'POST', body: formData });
    handleResponseErrors(response);

    const data = await response.json();
    currentQuestions = parseQuestions(data.questions || '');
    if (!currentQuestions.length) throw new Error('No questions were generated.');

    startQuiz();
  } catch (err) {
    errorElement.textContent = err.message;
    errorElement.classList.remove('hidden');
  } finally {
    showLoadingState(false);
  }
}

function resetState() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  questionsContainer.innerHTML = '';
  resultsContainer.innerHTML = '';
  quizSection.classList.add('hidden');
  scoreElement.classList.add('hidden');
  errorElement.classList.add('hidden');
  showResultsBtn.classList.add('hidden');
}

function prepareFormData() {
  const formData = new FormData();
  formData.append('text', document.getElementById('text-input').value.trim());
  const pdfFile = document.getElementById('pdf-input').files[0];
  if (pdfFile) formData.append('pdf', pdfFile);
  ['mcqs','fibs','tfs'].forEach(id =>
    formData.append(id, document.getElementById(id).value)
  );
  return formData;
}

function validateInputs(formData) {
  if (!formData.get('text') && !formData.get('pdf')) {
    throw new Error('Please provide text or upload a PDF file');
  }
}

function showLoadingState(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.innerHTML = isLoading
    ? '<div class="loader"></div> Generating...'
    : 'Generate Questions';
}

function handleResponseErrors(response) {
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
}

function parseQuestions(text) {
  const questions = [];
  let category = '';
  text.split('\n').filter(l => l.trim()).forEach(line => {
    if (/^(MCQs|F-I-Bs|T or F):/.test(line)) {
      category = line.split(':')[0].trim();
    } else if (/^Q\d+:/.test(line)) {
      let qText = line.split(': ')[1];
      if (category === 'T or F') {
        qText = qText.replace(/\s*Answer:\s*(True|False)\s*$/i, '').trim();
      }
      questions.push({
        type: category,
        text: qText,
        options: [],
        answer: ''
      });
    } else if (/^[a-d]\)/.test(line) && questions.length) {
      questions[questions.length - 1].options.push(line.slice(3));
    } else if (/^Answer:/.test(line) && questions.length) {
      questions[questions.length - 1].answer = line.split(': ')[1].trim();
    }
  });
  return questions;
}

function startQuiz() {
  quizSection.classList.remove('hidden');
  showCurrentQuestion();
}

function showCurrentQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  questionsContainer.innerHTML =
    q.type === 'MCQs' ? renderMCQ(q) :
    q.type === 'F-I-Bs' ? renderFIB(q) :
    q.type === 'T or F' ? renderTF(q) : '';
}

function renderMCQ(q) {
    return `
      <div class="question">
        <h3>${q.text}</h3>
        <div class="options">
          ${q.options.map((opt, i) =>
            `<div class="option" data-answer="${String.fromCharCode(97+i)}"
                  onclick="recordAnswer('${String.fromCharCode(97+i)}')">
               ${String.fromCharCode(97+i)}) ${opt}
             </div>`
          ).join('')}
        </div>
      </div>
    `;
  }
  

function renderFIB(q) {
  return `
    <div class="question">
      <h3>${q.text}</h3>
      <div class="fib-input">
        <input id="fib-answer" placeholder="Type your answer..." />
        <button onclick="recordAnswer(document.getElementById('fib-answer').value.trim())">
          Submit
        </button>
      </div>
    </div>
  `;
}

function renderTF(q) {
  return `
    <div class="question">
      <h3>${q.text}</h3>
      <div class="options">
        <div class="option" data-answer="true" onclick="recordAnswer('True')">True</div>
        <div class="option" data-answer="false" onclick="recordAnswer('False')">False</div>
      </div>
    </div>
  `;
}

// Normalization function to clean the text (remove non-alphanumeric characters, lower case)
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Fuzzy matching: This function checks if the normalized text of selected option and the correct answer are similar
function fuzzyMatch(selectedText, correctAnswer) {
  const normalizedSelected = normalize(selectedText);
  const normalizedCorrect = normalize(correctAnswer);

  // Check if the normalized versions are equal or if one is a substring of the other
  return normalizedSelected === normalizedCorrect || normalizedCorrect.includes(normalizedSelected) || normalizedSelected.includes(normalizedCorrect);
}

// Function to record the user's answer and check if it's correct
function recordAnswer(ans) {
  const q = currentQuestions[currentQuestionIndex];
  let isCorrect = false;
  let userAns = ans;

  if (q.type === 'MCQs') {
    // Get the text of the selected option
    const selectedOptionText = q.options[ans.charCodeAt(0) - 97];
    
    // Compare the selected option text with the correct answer using fuzzy matching
    isCorrect = fuzzyMatch(selectedOptionText, q.answer);
    
    userAns = `${ans}) ${selectedOptionText}`;
  } else {
    // For FIB or T/F, we just compare directly with the correct answer
    isCorrect = fuzzyMatch(ans, q.answer);
  }

  if (isCorrect) score++;
  userAnswers.push({
    question: q.text,
    userAnswer: userAns,
    correctAnswer: q.answer,
    isCorrect
  });

  showFeedback(q, isCorrect);
  setTimeout(nextStep, 800);
}

function showFeedback(q, correct) {
  document.querySelectorAll('.option').forEach(opt => {
    const val = opt.textContent.trim();
    const normalizedVal = val.slice(3).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedCorrect = q.answer.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedVal === normalizedCorrect) {
      opt.classList.add('correct');
    } else {
      opt.classList.add('incorrect');
    }
  });
}

function nextStep() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuestions.length) {
    showCurrentQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  quizSection.classList.add('hidden');
  scoreElement.innerHTML = `
    <h3>Quiz Complete! 🎉</h3>
    <p>Your Score: ${score}/${currentQuestions.length}</p>`;
  scoreElement.classList.remove('hidden');
  showResultsBtn.classList.remove('hidden');
}

function displayResults() {
  resultsContainer.innerHTML = '<h3>Quiz Results:</h3>' +
    userAnswers.map((ua, idx) => `
      <div class="result-item">
        <strong>Q${idx+1}:</strong> ${ua.question}<br>
        Your Answer: <span class="${ua.isCorrect ? 'correct' : 'incorrect'}">
          ${ua.userAnswer}</span><br>
        ${!ua.isCorrect
          ? `Correct Answer: <span class="correct">${ua.correctAnswer}</span>`
          : ''}
      </div>
    `).join('');
}
