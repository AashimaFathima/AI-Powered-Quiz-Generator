const API_BASE = "http://18.61.166.247:5000";

const generateBtn = document.querySelector('.generate-btn');
const quizSection = document.getElementById('quiz-section');
const questionsContainer = document.getElementById('questions-container');
const scoreElement = document.getElementById('score');
const errorElement = document.getElementById('error');
const showResultsBtn = document.getElementById('show-results-btn');
const resultsContainer = document.getElementById('results-container');
const downloadResultsBtn = document.getElementById('download-results-btn');

let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
    generateBtn.addEventListener('click', handleGenerate);
    showResultsBtn.addEventListener('click', displayResults);
    downloadResultsBtn.addEventListener('click', downloadResults);
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content')
        .forEach(tc => tc.classList.remove('active'));

    document.getElementById(`${tabName}-tab`)
        .classList.add('active');

    document.querySelectorAll('.tab-btn')
        .forEach(tb => tb.classList.remove('active'));

    document
        .querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`)
        .classList.add('active');
}

async function handleGenerate() {

    try {

        resetState();

        const formData = prepareFormData();

        validateInputs(formData);

        showLoadingState(true);

        const response = await fetch(
            `${API_BASE}/generate`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Something went wrong."
            );
        }

        currentQuestions = parseQuestions(
            data.questions || ""
        );

        if (!currentQuestions.length) {
            throw new Error(
                "No questions were generated."
            );
        }

        startQuiz();

    } catch (err) {

        errorElement.textContent = err.message;
        errorElement.classList.remove("hidden");

    } finally {

        showLoadingState(false);

    }
}

function resetState() {

    currentQuestionIndex = 0;
    score = 0;

    currentQuestions = [];
    userAnswers = [];

    questionsContainer.innerHTML = "";
    resultsContainer.innerHTML = "";

    quizSection.classList.add("hidden");
    scoreElement.classList.add("hidden");
    errorElement.classList.add("hidden");
    showResultsBtn.classList.add("hidden");
    downloadResultsBtn.classList.add("hidden");
}

function prepareFormData() {

    const formData = new FormData();

    formData.append(
        "text",
        document
            .getElementById("text-input")
            .value
            .trim()
    );

    const pdfFile =
        document
            .getElementById("pdf-input")
            .files[0];

    if (pdfFile)
        formData.append("pdf", pdfFile);

    ["mcqs", "fibs", "tfs"]
        .forEach(id => {

            formData.append(
                id,
                document
                    .getElementById(id)
                    .value
            );

        });

    return formData;
}

function validateInputs(formData) {

    if (
        !formData.get("text") &&
        !formData.get("pdf")
    ) {
        throw new Error(
            "Please provide text or upload a PDF."
        );
    }

    const total =
        Number(formData.get("mcqs")) +
        Number(formData.get("fibs")) +
        Number(formData.get("tfs"));

    if (total === 0) {
        throw new Error(
            "Select at least one question."
        );
    }

    if (total > 30) {
        throw new Error(
            "Maximum 30 questions allowed."
        );
    }
}

function showLoadingState(isLoading) {

    generateBtn.disabled = isLoading;

    generateBtn.innerHTML =
        isLoading
            ? '<div class="loader"></div> Generating...'
            : 'Generate Questions';
}

function parseQuestions(text) {

    const questions = [];

    let category = "";

    text
        .split("\n")
        .filter(line => line.trim())
        .forEach(line => {

            if (/^(MCQs|F-I-Bs|T or F):/.test(line)) {

                category =
                    line
                        .split(":")[0]
                        .trim();

            }

            else if (/^Q\d+:/.test(line)) {

                let qText =
                    line.split(": ")[1];

                if (
                    category === "T or F"
                ) {
                    qText =
                        qText.replace(
                            /\s*Answer:\s*(True|False)\s*$/i,
                            ""
                        ).trim();
                }

                questions.push({
                    type: category,
                    text: qText,
                    options: [],
                    answer: ""
                });

            }

            else if (
                /^[a-d]\)/.test(line)
                &&
                questions.length
            ) {

                questions[
                    questions.length - 1
                ].options.push(
                    line.slice(3)
                );

            }

            else if (
                /^Answer:/.test(line)
                &&
                questions.length
            ) {

                questions[
                    questions.length - 1
                ].answer =
                    line
                        .split(": ")[1]
                        .trim();
            }

        });

    return questions;
}

function startQuiz() {
    quizSection.classList.remove("hidden");
    showCurrentQuestion();
}

function showCurrentQuestion() {

    const q =
        currentQuestions[
            currentQuestionIndex
        ];

    questionsContainer.innerHTML =

        q.type === "MCQs"
            ? renderMCQ(q)

        : q.type === "F-I-Bs"
            ? renderFIB(q)

        : renderTF(q);
}

function renderMCQ(q) {

    return `
        <div class="question">

            <h3>${q.text}</h3>

            <div class="options">

            ${q.options.map(
                (opt, i) =>

                `<div
                    class="option"
                    onclick="recordAnswer('${String.fromCharCode(97+i)}')">

                    ${String.fromCharCode(97+i)}) ${opt}

                </div>`

            ).join("")}

            </div>

        </div>
    `;
}

function renderFIB(q) {

    return `
        <div class="question">

            <h3>${q.text}</h3>

            <div class="fib-input">

                <input
                    id="fib-answer"
                    placeholder="Type your answer..."
                >

                <button
                    onclick="recordAnswer(
                    document
                        .getElementById('fib-answer')
                        .value
                        .trim()
                    )">

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

                <div
                    class="option"
                    onclick="recordAnswer('True')">

                    True

                </div>

                <div
                    class="option"
                    onclick="recordAnswer('False')">

                    False

                </div>

            </div>

        </div>
    `;
}

function normalize(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function fuzzyMatch(a, b) {

    const x = normalize(a);
    const y = normalize(b);

    return (
        x === y ||
        x.includes(y) ||
        y.includes(x)
    );
}

function recordAnswer(ans) {

    const q =
        currentQuestions[
            currentQuestionIndex
        ];

    let isCorrect = false;

    let userAns = ans;

    if (q.type === "MCQs") {

        const selected =
            q.options[
                ans.charCodeAt(0) - 97
            ];

        isCorrect =
            fuzzyMatch(
                selected,
                q.answer
            );

        userAns =
            `${ans}) ${selected}`;

    } else {

        isCorrect =
            fuzzyMatch(
                ans,
                q.answer
            );

    }

    if (isCorrect)
        score++;

    userAnswers.push({
        question: q.text,
        userAnswer: userAns,
        correctAnswer: q.answer,
        isCorrect: isCorrect
    });

    setTimeout(nextStep, 500);
}

function nextStep() {

    currentQuestionIndex++;

    if (
        currentQuestionIndex <
        currentQuestions.length
    ) {

        showCurrentQuestion();

    } else {

        finishQuiz();

    }
}

function finishQuiz() {

    quizSection.classList.add("hidden");

    scoreElement.innerHTML = `
        <h3>Quiz Complete! 🎉</h3>
        <p>
        Your Score :
        ${score}/${currentQuestions.length}
        </p>
    `;

    scoreElement.classList.remove("hidden");

    showResultsBtn.classList.remove("hidden");

    downloadResultsBtn.classList.remove("hidden");
}

function displayResults() {

    resultsContainer.innerHTML =
        "<h3>Quiz Results</h3>" +

        userAnswers.map(
            (u, i) =>

            `
            <div class="result-item">

                <strong>
                Q${i + 1}
                </strong>

                <br><br>

                ${u.question}

                <br><br>

                Your Answer :

                <span class="${
                    u.isCorrect
                    ? "correct"
                    : "incorrect"
                }">

                ${u.userAnswer}

                </span>

                <br><br>

                Correct Answer :

                <span class="correct">

                ${u.correctAnswer}

                </span>

            </div>
            `

        ).join("");
}

function downloadResults() {

    let report =
`AI Powered Quiz Generator

Score :
${score}/${currentQuestions.length}

====================================

`;

    userAnswers.forEach(
        (u, i) => {

        report +=
`Question ${i+1}

${u.question}

Your Answer:
${u.userAnswer}

Correct Answer:
${u.correctAnswer}

------------------------------------

`;

    });

    const blob =
        new Blob(
            [report],
            {
                type:
                "text/plain"
            }
        );

    const a =
        document.createElement(
            "a"
        );

    a.href =
        URL.createObjectURL(
            blob
        );

    a.download =
        "quiz_results.txt";

    a.click();
}