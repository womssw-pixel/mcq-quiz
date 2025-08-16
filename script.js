import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyA9cJ_wC_6h5PWRMw96rUDrMBE_uCIClF8",
  authDomain: "esag-mcq-project.firebaseapp.com",
  projectId: "esag-mcq-project",
  storageBucket: "esag-mcq-project.appspot.com",
  messagingSenderId: "53701860084",
  appId: "1:53701860084:web:eca61389e9860ccbed1ca1",
  measurementId: "G-PNFL3KQ68K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Quizzes by day
const quizzes = {
  "Day 1": [
    { questionImage: "https://placehold.co/600x400/007bff/ffffff?text=Day+1+Q1", options: ["1","2","3","4","5"], correctAnswer: "2" },
    { questionImage: "https://placehold.co/600x400/28a745/ffffff?text=Day+1+Q2", options: ["1","2","3","4","5"], correctAnswer: "1" }
  ],
  "Day 2": [
    { questionImage: "https://placehold.co/600x400/dc3545/ffffff?text=Day+2+Q1", options: ["1","2","3","4","5"], correctAnswer: "3" },
    { questionImage: "https://placehold.co/600x400/ffc107/ffffff?text=Day+2+Q2", options: ["1","2","3","4","5"], correctAnswer: "4" }
  ]
};

// Elements
const timerDisplay = document.getElementById('timer');
const timerBox = document.getElementById('timer-box');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const submitBtn = document.getElementById('submit-btn');
const scoreDisplay = document.getElementById('score-display');
const answersReview = document.getElementById('answers-review');
const nameModal = document.getElementById('name-modal');
const startQuizBtn = document.getElementById('start-quiz-btn');
const studentNameInput = document.getElementById('student-name-input');
const quizWrapper = document.getElementById('quiz-wrapper');
const daySelection = document.getElementById('day-selection');

let studentName = '';
let userAnswers = {};
let timeLeft = 25 * 60;
let timerInterval;
let currentQuiz = null;

// Start button
startQuizBtn.addEventListener('click', () => {
  studentName = studentNameInput.value.trim();
  if (!studentName) return alert("Please enter your name");
  nameModal.classList.add('hidden');
  daySelection.classList.remove('hidden');
});

// Enter key
studentNameInput.addEventListener('keydown', (e) => { if(e.key==='Enter') startQuizBtn.click(); });

// Day buttons
document.querySelectorAll('.day-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const day = btn.dataset.day;
    currentQuiz = quizzes[day];
    daySelection.classList.add('hidden');
    quizWrapper.classList.remove('hidden');
    renderAllQuestions(currentQuiz);
    startTimer();
  });
});

// Render questions
function renderAllQuestions(quiz) {
  quizContainer.innerHTML = '';
  quiz.forEach((q,i)=>{
    const card = document.createElement('div');
    card.className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-100 shadow-md fade-in";
    let optionsHtml='';
    q.options.forEach((opt,oi)=>{
      optionsHtml+=`<button class="w-full text-left bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg border-2 border-gray-300 option-btn" data-question-index="${i}" data-option="${oi+1}">${opt}</button>`;
    });
    card.innerHTML=`<h2 class="text-xl font-semibold text-gray-700 mb-4">Question ${i+1}</h2>
      <div class="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm mb-4">
        <img class="w-full h-auto object-cover" src="${q.questionImage}" alt="Question ${i+1}">
      </div>
      <div class="options-container grid gap-3">${optionsHtml}</div>`;
    quizContainer.appendChild(card);
  });

  quizContainer.addEventListener('click', (event) => {
    const target = event.target;
    if(target.matches('[data-option]')){
      const qIndex=target.dataset.questionIndex;
      const opt=target.dataset.option;
      handleAnswer(qIndex,opt);
    }
  });
}

// Handle answer
function handleAnswer(qIndex,opt){
  userAnswers[qIndex]=opt;
  const opts=quizContainer.querySelectorAll(`[data-question-index="${qIndex}"]`);
  opts.forEach(b=>b.classList.remove('bg-blue-200','border-blue-500'));
  const selBtn=quizContainer.querySelector(`[data-question-index="${qIndex}"][data-option="${opt}"]`);
  if(selBtn) selBtn.classList.add('bg-blue-200','border-blue-500');
}

// Timer
function startTimer(){
  timerInterval = setInterval(()=>{
    timeLeft--;
    const m=Math.floor(timeLeft/60);
    const s=timeLeft%60;
    timerDisplay.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(timeLeft<=60) timerBox.classList.add("blinking");
    if(timeLeft<=0){ clearInterval(timerInterval); submitQuiz(); }
  },1000);
}

// Submit quiz
submitBtn.addEventListener('click',submitQuiz);

function submitQuiz(){
  clearInterval(timerInterval);
  let score=0;
  quizContainer.classList.add('hidden');
  submitBtn.classList.add('hidden');
  resultsContainer.classList.remove('hidden');
  resultsContainer.classList.add('slide-in');
  answersReview.innerHTML='';

  updateData(score);

  currentQuiz.forEach((q,i)=>{
    const ua=userAnswers[i];
    const correct=ua===q.correctAnswer;
    if(correct) score++;
    const card=document.createElement('div');
    card.className=`p-4 mb-4 rounded-lg border-2 ${correct?'correct-answer':'wrong-answer'}`;
    card.innerHTML=`<h3 class="font-semibold text-lg mb-2">Question ${i+1}</h3>
      <img src="${q.questionImage}" class="w-full rounded-md mb-3 border-2 border-gray-300">
      <p class="font-medium">Your answer: <span class="${correct?'correct-answer-text':'wrong-answer-text'}">${ua?`Option ${ua}`:'No answer'}</span></p>
      <p class="font-medium">Correct answer: <span class="correct-answer-text">Option ${q.correctAnswer}</span></p>`;
    answersReview.appendChild(card);
  });

  scoreDisplay.textContent = studentName?`Well done, ${studentName}! You scored ${score} out of ${currentQuiz.length}`:`You scored ${score} out of ${currentQuiz.length}`;
}

async function updateData(score) {
  const studentID = studentName + '_' + Date.now(); // unique ID
  const quizDay = "day1"; // set dynamically for each day

  try {
    await setDoc(doc(db, "students", studentID), {
      name: studentName,
      [quizDay]: {
        score: score,
        timeSpent: 25*60 - timeLeft // seconds
      }
    });
    console.log("Student data saved successfully!");
  } catch (error) {
    console.error("Error saving student data:", error);
  }
}
