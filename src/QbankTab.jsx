import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ─── SAMPLE QUESTION DATA (GROUPED BY SYSTEM) ──────────────────────────────
const QUESTIONS_DB = [
  { id: 1, system: 'respiratory', text: 'A 65-year-old male with a 40-pack-year smoking history presents with chronic cough and dyspnea. Spirometry shows FEV1/FVC < 0.7. Which of the following is the most likely diagnosis?', options: ['Asthma', 'Bronchiectasis', 'COPD', 'Pulmonary fibrosis', 'Heart failure', 'Lung cancer'], correctAnswer: 'COPD', explanation: 'COPD is characterized by airflow obstruction (FEV1/FVC < 0.7) in a smoker.', educationalObjective: 'Recognize spirometry findings in COPD.', difficulty: 'Medium', tags: ['COPD', 'spirometry'], imageUrl: null, hint: 'Think of smoking-related obstructive disease.' },
  { id: 2, system: 'respiratory', text: 'A patient with sudden onset of pleuritic chest pain and shortness of breath after a long flight. Which diagnostic test is most appropriate initially?', options: ['Chest X-ray', 'CT angiography', 'D-dimer', 'V/Q scan', 'Echocardiogram', 'ABG'], correctAnswer: 'D-dimer', explanation: 'D-dimer is a sensitive screening test for pulmonary embolism.', educationalObjective: 'Initial evaluation of suspected PE.', difficulty: 'Easy', tags: ['PE', 'D-dimer'], imageUrl: null, hint: 'High sensitivity, low specificity.' },
  { id: 3, system: 'cardiovascular', text: 'A 55-year-old man presents with chest pain radiating to the left arm, relieved by nitroglycerin. ECG shows ST-segment depression. What is the most likely diagnosis?', options: ['Unstable angina', 'NSTEMI', 'STEMI', 'Aortic dissection', 'Pericarditis', 'GERD'], correctAnswer: 'NSTEMI', explanation: 'ST depression with chest pain suggests NSTEMI.', educationalObjective: 'Differentiate NSTEMI from other causes.', difficulty: 'Medium', tags: ['ACS', 'NSTEMI'], imageUrl: null, hint: 'No ST elevation.' },
  { id: 4, system: 'cardiovascular', text: 'A patient with chronic hypertension presents with dyspnea on exertion and bilateral leg edema. Jugular venous pressure is elevated. Which physical exam finding is most specific for heart failure?', options: ['S3 gallop', 'S4 gallop', 'Crackles', 'Hepatomegaly', 'Ascites', 'Pulsus alternans'], correctAnswer: 'S3 gallop', explanation: 'S3 is a marker of increased filling pressures in heart failure.', educationalObjective: 'Identify signs of heart failure.', difficulty: 'Hard', tags: ['heart failure', 'S3'], imageUrl: null, hint: 'Extra heart sound after S2.' },
  { id: 5, system: 'renal', text: 'A 45-year-old diabetic presents with frothy urine, periorbital edema, and serum albumin 2.5 g/dL. Urinalysis shows 3+ protein. What is the most likely diagnosis?', options: ['Nephrotic syndrome', 'Nephritic syndrome', 'Acute kidney injury', 'Pyelonephritis', 'Renal cell carcinoma', 'Interstitial nephritis'], correctAnswer: 'Nephrotic syndrome', explanation: 'Massive proteinuria, hypoalbuminemia, and edema define nephrotic syndrome.', educationalObjective: 'Differentiate nephrotic vs nephritic.', difficulty: 'Medium', tags: ['nephrotic', 'proteinuria'], imageUrl: null, hint: 'Look for proteinuria >3.5g/day.' },
  { id: 6, system: 'renal', text: 'A patient develops oliguria and hypertension after a streptococcal throat infection. Urinalysis shows hematuria and red cell casts. What is the most likely diagnosis?', options: ['IgA nephropathy', 'Post-streptococcal glomerulonephritis', 'Membranous nephropathy', 'Minimal change disease', 'Alport syndrome', 'Goodpasture syndrome'], correctAnswer: 'Post-streptococcal glomerulonephritis', explanation: 'Post-streptococcal GN presents with hematuria, hypertension, and red cell casts.', educationalObjective: 'Recognize post-infectious glomerulonephritis.', difficulty: 'Medium', tags: ['glomerulonephritis', 'post-strep'], imageUrl: null, hint: 'Recent infection.' },
  { id: 7, system: 'git', text: 'A 30-year-old female presents with episodic abdominal pain, bloating, and diarrhea alternating with constipation. Physical exam and labs are normal. Which of the following is most likely?', options: ['Ulcerative colitis', 'Crohn disease', 'Irritable bowel syndrome', 'Celiac disease', 'Lactose intolerance', 'Giardiasis'], correctAnswer: 'Irritable bowel syndrome', explanation: 'IBS is a functional disorder with abdominal pain and altered bowel habits without organic findings.', educationalObjective: 'Diagnostic criteria for IBS.', difficulty: 'Easy', tags: ['IBS', 'functional'], imageUrl: null, hint: 'Rome IV criteria.' },
  { id: 8, system: 'git', text: 'A 60-year-old male with history of alcohol use presents with jaundice, ascites, and asterixis. Which laboratory finding is most consistent with his condition?', options: ['Elevated AST/ALT >2:1', 'Elevated ALP', 'Elevated bilirubin only', 'Normal LFTs', 'Elevated amylase', 'Positive ANA'], correctAnswer: 'Elevated AST/ALT >2:1', explanation: 'Alcoholic liver disease often shows AST>ALT with ratio >2.', educationalObjective: 'Liver enzyme pattern in alcoholic hepatitis.', difficulty: 'Medium', tags: ['alcoholic liver', 'AST/ALT'], imageUrl: null, hint: 'AST higher than ALT.' },
  { id: 9, system: 'endocrine', text: 'A 35-year-old woman presents with palpitations, weight loss, heat intolerance, and tremor. TSH is low, free T4 is high. What is the most likely diagnosis?', options: ['Graves disease', 'Hashimoto thyroiditis', 'Subacute thyroiditis', 'Toxic nodular goiter', 'Thyroid cancer', 'Pituitary adenoma'], correctAnswer: 'Graves disease', explanation: 'Hyperthyroidism with low TSH and high T4 is most commonly Graves disease.', educationalObjective: 'Diagnose hyperthyroidism.', difficulty: 'Easy', tags: ['hyperthyroidism', 'Graves'], imageUrl: null, hint: 'Autoimmune cause.' },
  { id: 10, system: 'endocrine', text: 'A patient with type 2 diabetes presents with polyuria, polydipsia, and blood glucose 350 mg/dL. Which medication should be started as first-line therapy?', options: ['Metformin', 'Insulin', 'Sulfonylurea', 'DPP-4 inhibitor', 'SGLT2 inhibitor', 'GLP-1 agonist'], correctAnswer: 'Metformin', explanation: 'Metformin is first-line for type 2 diabetes unless contraindicated.', educationalObjective: 'Initial pharmacotherapy for diabetes.', difficulty: 'Easy', tags: ['diabetes', 'metformin'], imageUrl: null, hint: 'Biguanide class.' },
  { id: 11, system: 'cns', text: 'A 72-year-old man suddenly develops right-sided weakness and aphasia. CT head is normal. What is the next best step?', options: ['CT angiography', 'MRI brain', 'Carotid ultrasound', 'Lumbar puncture', 'EEG', 'Aspirin only'], correctAnswer: 'MRI brain', explanation: 'MRI is more sensitive for acute ischemic stroke within first few hours.', educationalObjective: 'Imaging in acute stroke.', difficulty: 'Medium', tags: ['stroke', 'MRI'], imageUrl: null, hint: 'CT often normal early.' },
  { id: 12, system: 'cns', text: 'A patient presents with severe headache, photophobia, and nuchal rigidity. Lumbar puncture shows elevated protein, low glucose, and many neutrophils. Which organism is most likely?', options: ['Streptococcus pneumoniae', 'Neisseria meningitidis', 'Listeria monocytogenes', 'Haemophilus influenzae', 'Escherichia coli', 'Cryptococcus neoformans'], correctAnswer: 'Streptococcus pneumoniae', explanation: 'Community-acquired bacterial meningitis in adults is often due to S. pneumoniae.', educationalObjective: 'Common pathogens in meningitis.', difficulty: 'Hard', tags: ['meningitis', 'bacterial'], imageUrl: null, hint: 'Most common cause in adults.' },
  { id: 13, system: 'msk', text: 'A 55-year-old woman with morning stiffness in hands and wrists lasting >1 hour, and symmetric joint swelling. Rheumatoid factor is positive. Which finding is most characteristic?', options: ['Swan-neck deformity', 'Heberden nodes', 'Bouchard nodes', 'Gouty tophi', 'Sausage digit', 'Butterfly rash'], correctAnswer: 'Swan-neck deformity', explanation: 'Swan-neck deformity is a classic feature of rheumatoid arthritis.', educationalObjective: 'Recognize RA joint deformities.', difficulty: 'Medium', tags: ['RA', 'deformity'], imageUrl: null, hint: 'Hyperextension of PIP, flexion of DIP.' },
  { id: 14, system: 'msk', text: 'A young athlete twists his knee and hears a pop. Immediate swelling. Exam shows positive anterior drawer test. What structure is most likely injured?', options: ['ACL', 'PCL', 'MCL', 'LCL', 'Meniscus', 'Patellar tendon'], correctAnswer: 'ACL', explanation: 'Anterior drawer test assesses ACL integrity.', educationalObjective: 'Knee ligament injury assessment.', difficulty: 'Easy', tags: ['ACL', 'knee'], imageUrl: null, hint: 'Pivot shift injury.' },
  { id: 15, system: 'hematology', text: 'A 20-year-old man with fatigue, petechiae, and gum bleeding. CBC shows pancytopenia. Bone marrow biopsy shows hypocellularity. What is the most likely diagnosis?', options: ['Aplastic anemia', 'Leukemia', 'Myelodysplasia', 'Vitamin B12 deficiency', 'ITP', 'TTP'], correctAnswer: 'Aplastic anemia', explanation: 'Pancytopenia with hypocellular marrow defines aplastic anemia.', educationalObjective: 'Diagnose aplastic anemia.', difficulty: 'Medium', tags: ['aplastic anemia', 'pancytopenia'], imageUrl: null, hint: 'Failure of all cell lines.' },
];

const getSystems = () => {
  const systemsSet = new Set(QUESTIONS_DB.map(q => q.system));
  return Array.from(systemsSet).sort();
};

const getQuestionsBySystem = (system) => {
  return QUESTIONS_DB.filter(q => q.system === system);
};

const STORAGE_KEY = 'qbank_session';

export default function QbankSession() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('respiratory');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState({});
  const [notes, setNotes] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionMode, setSessionMode] = useState('study');
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    document.title = 'Qbank Session | Medical CGPA';
  }, []);

  useEffect(() => {
    localStorage.setItem('qbank_darkMode', JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const systemQuestions = getQuestionsBySystem(selectedSystem);
    setQuestions(systemQuestions);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setSubmitted(false);
    setSelectedOption('');
    loadSessionFromStorage(selectedSystem);
  }, [selectedSystem]);

  useEffect(() => {
    if (!sessionStarted && questions.length === 0) return;
    saveSessionToStorage(selectedSystem);
  }, [selectedSystem, userAnswers, markedQuestions, notes, currentQuestionIndex, sessionMode, timeRemaining, timerActive, sessionStarted]);

  function loadSessionFromStorage(system) {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${system}`);
    if (stored) {
      const data = JSON.parse(stored);
      setUserAnswers(data.userAnswers || {});
      setMarkedQuestions(data.markedQuestions || {});
      setNotes(data.notes || {});
      setCurrentQuestionIndex(data.currentQuestionIndex || 0);
      setSessionMode(data.sessionMode || 'study');
      setTimeRemaining(data.timeRemaining !== undefined ? data.timeRemaining : 3600);
      setTimerActive(data.timerActive || false);
      setSessionStarted(data.sessionStarted || false);
    } else {
      setUserAnswers({});
      setMarkedQuestions({});
      setNotes({});
      setCurrentQuestionIndex(0);
      setSessionMode('study');
      setTimeRemaining(3600);
      setTimerActive(false);
      setSessionStarted(false);
    }
    setShowExplanation(false);
    setSubmitted(false);
    setSelectedOption('');
  }

  function saveSessionToStorage(system) {
    const data = { userAnswers, markedQuestions, notes, currentQuestionIndex, sessionMode, timeRemaining, timerActive, sessionStarted };
    localStorage.setItem(`${STORAGE_KEY}_${system}`, JSON.stringify(data));
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const attemptedCount = Object.keys(userAnswers).filter(qid => userAnswers[qid] !== undefined).length;

  useEffect(() => {
    let interval;
    if (timerActive && sessionMode === 'timed' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      alert('Time is up! Session ended.');
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, sessionMode, timeRemaining]);

  const startTimedMode = () => {
    setSessionMode('timed');
    setTimeRemaining(3600);
    setTimerActive(true);
    setSessionStarted(true);
  };

  const resetSession = () => {
    if (confirm('Reset all progress for this system?')) {
      setUserAnswers({});
      setMarkedQuestions({});
      setNotes({});
      setCurrentQuestionIndex(0);
      setShowExplanation(false);
      setSubmitted(false);
      setSelectedOption('');
      setSessionMode('study');
      setTimeRemaining(3600);
      setTimerActive(false);
      setSessionStarted(false);
      localStorage.removeItem(`${STORAGE_KEY}_${selectedSystem}`);
    }
  };

  const handleAnswerSelect = (option) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      alert('Please select an answer.');
      return;
    }
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: { answer: selectedOption, isCorrect } }));
    setSubmitted(true);
    setShowExplanation(true);
    if (!sessionStarted) setSessionStarted(true);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetForNewQuestion();
    } else {
      alert('You have completed all questions in this system!');
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex - 1 >= 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetForNewQuestion();
    }
  };

  const resetForNewQuestion = () => {
    const q = questions[currentQuestionIndex];
    const existingAnswer = userAnswers[q?.id];
    setSelectedOption(existingAnswer?.answer || '');
    setSubmitted(!!existingAnswer);
    setShowExplanation(!!existingAnswer);
  };

  const toggleMark = () => {
    setMarkedQuestions(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  };

  const updateNote = (note) => {
    setNotes(prev => ({ ...prev, [currentQuestion.id]: note }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const highlightStem = (text) => {
    const keywords = ['most likely', 'diagnosis', 'risk factor', 'treatment', 'presentation'];
    let highlighted = text;
    keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      highlighted = highlighted.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>`);
    });
    return highlighted;
  };

  const systemDisplay = {
    respiratory: 'Respiratory',
    cardiovascular: 'Cardiovascular',
    renal: 'Renal',
    git: 'Gastrointestinal',
    endocrine: 'Endocrine',
    cns: 'Neurology',
    msk: 'Musculoskeletal',
    hematology: 'Hematology',
    reproductive: 'Reproductive',
    infectious: 'Infectious Diseases',
  };

  const allSystems = getSystems();

  return (
    <>
      <Head><title>Qbank Session | Medical CGPA</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div className="min-h-screen" style={{ backgroundColor: darkMode ? '#07090F' : '#EFF2F7', color: darkMode ? '#E2E8F0' : '#111827' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" passHref>
                <button className="px-4 py-2 rounded-xl border transition" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}>← Back to CGPA</button>
              </Link>
              <h1 className="text-3xl font-bebas tracking-wider" style={{ color: darkMode ? '#00D4AA' : '#3B82F6' }}>Medical Qbank Session</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 rounded-xl border transition" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}>{darkMode ? '☀ Light' : '☾ Dark'}</button>
              {sessionMode !== 'timed' && !sessionStarted && <button onClick={startTimedMode} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold">Start Timed Mode (60 min)</button>}
              <button onClick={resetSession} className="px-4 py-2 bg-red-600/20 text-red-600 rounded-xl font-semibold">Reset Session</button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
              <div className="rounded-2xl p-4 shadow-lg" style={{ backgroundColor: darkMode ? '#0E1525' : '#FFFFFF', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}` }}>
                <div className="flex justify-between items-center mb-4"><h2 className="font-bebas text-xl">Systems</h2><button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">✕</button></div>
                <div className="flex flex-wrap gap-2 mb-6">{allSystems.map(sys => (<button key={sys} onClick={() => setSelectedSystem(sys)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedSystem === sys ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white' : (darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>{systemDisplay[sys] || sys}</button>))}</div>
                <div className="border-t pt-4" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex justify-between mb-3"><span className="text-sm font-semibold">Questions ({totalQuestions})</span><span className="text-xs">{attemptedCount}/{totalQuestions} answered</span></div>
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">{questions.map((q, idx) => { const answerState = userAnswers[q.id]; const isMarked = markedQuestions[q.id]; let statusClass = ''; if (answerState) statusClass = answerState.isCorrect ? 'border-l-4 border-green-500 bg-green-500/10' : 'border-l-4 border-red-500 bg-red-500/10'; else if (isMarked) statusClass = 'border-l-4 border-yellow-500 bg-yellow-500/10'; return (<div key={q.id} onClick={() => { setCurrentQuestionIndex(idx); resetForNewQuestion(); }} className={`p-2 rounded-lg cursor-pointer transition ${currentQuestionIndex === idx ? 'ring-2 ring-teal-400' : ''} ${statusClass}`} style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}><div className="flex justify-between items-center"><span className="font-mono text-sm">Q{idx+1}</span>{isMarked && <span className="text-yellow-500 text-xs">★</span>}</div><p className="text-xs truncate mt-1">{q.text.substring(0, 60)}…</p></div>); })}</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="mb-4 lg:hidden px-4 py-2 rounded-xl bg-teal-600 text-white">Show Systems</button>}
              {currentQuestion ? (<div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: darkMode ? '#0E1525' : '#FFFFFF', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}` }}>
                <div className="flex flex-wrap justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex gap-4"><span className="font-mono text-sm">Question {currentQuestionIndex+1} of {totalQuestions}</span>{sessionMode === 'timed' && (<span className={`font-mono text-sm ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : ''}`}>⏱️ {formatTime(timeRemaining)}</span>)}{sessionMode === 'study' && timerActive && <span className="font-mono text-sm">Study timer: {formatTime(timeRemaining)}</span>}</div>
                  <div className="flex gap-3"><button onClick={toggleMark} className="text-yellow-500 text-sm">📌 {markedQuestions[currentQuestion.id] ? 'Unmark' : 'Mark'}</button><button onClick={() => { if (sessionMode === 'study') setTimerActive(!timerActive); else alert('Timer fixed in timed mode'); }} className="text-sm">{timerActive ? '⏸️ Pause' : '▶️ Start timer'}</button></div>
                </div>
                <div className="mb-6"><div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: highlightStem(currentQuestion.text) }} />{currentQuestion.imageUrl && (<div className="mt-4"><img src={currentQuestion.imageUrl} alt="Question media" className="rounded-xl max-h-64 object-contain" /></div>)}{currentQuestion.hint && !submitted && <div className="mt-2 text-sm italic text-gray-500">💡 Hint: {currentQuestion.hint}</div>}</div>
                <div className="space-y-3 mb-6">{currentQuestion.options.map((opt, idx) => { const letter = String.fromCharCode(65+idx); const isSelected = selectedOption === opt; const isCorrectAnswer = opt === currentQuestion.correctAnswer; let optionClass = "p-3 rounded-xl border cursor-pointer transition"; if (submitted && isCorrectAnswer) optionClass += " bg-green-500/20 border-green-500"; else if (submitted && isSelected && !isCorrectAnswer) optionClass += " bg-red-500/20 border-red-500"; else if (isSelected) optionClass += " bg-blue-500/20 border-blue-500"; else optionClass += ` ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`; return (<div key={opt} onClick={() => handleAnswerSelect(opt)} className={optionClass}><span className="font-mono font-bold mr-2">{letter}.</span> {opt}</div>); })}</div>
                <div className="flex flex-wrap gap-3 justify-between items-center mt-4"><div className="flex gap-2"><button onClick={goToPrevQuestion} disabled={currentQuestionIndex === 0} className="px-4 py-2 rounded-xl bg-gray-600/20 disabled:opacity-30">← Previous</button>{!submitted && <button onClick={handleSubmit} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl font-semibold">Submit Answer</button>}{submitted && <button onClick={goToNextQuestion} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl font-semibold">Next →</button>}{submitted && currentQuestionIndex !== totalQuestions-1 && <button onClick={goToNextQuestion} className="px-4 py-2 bg-gray-600/20 rounded-xl">Next & Continue</button>}</div><div className="text-sm text-gray-500">Difficulty: {currentQuestion.difficulty}</div></div>
                {showExplanation && (<div className="mt-6 p-4 rounded-xl border-t-2 border-teal-500" style={{ backgroundColor: darkMode ? '#1B263B' : '#F1F5F9' }}><h3 className="font-bold text-teal-500 mb-2">Explanation</h3><p>{currentQuestion.explanation}</p><div className="mt-2 text-sm italic">🎯 Educational Objective: {currentQuestion.educationalObjective}</div><div className="mt-3"><label className="block text-sm font-semibold mb-1">Your Notes:</label><textarea value={notes[currentQuestion.id] || ''} onChange={(e) => updateNote(e.target.value)} className="w-full p-2 rounded-lg border" rows="2" placeholder="Add personal notes..."></textarea></div></div>)}
              </div>) : (<div className="rounded-2xl p-12 text-center" style={{ backgroundColor: darkMode ? '#0E1525' : '#FFFFFF' }}>No questions available for this system.</div>)}
            </div>
          </div>
          <div className="mt-8 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3" style={{ backgroundColor: darkMode ? '#0E1525' : '#FFFFFF', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}` }}>
            <div className="text-sm">📊 Answered: {attemptedCount} / {totalQuestions}</div>
            <div className="text-sm">⭐ Marked: {Object.values(markedQuestions).filter(v=>v===true).length}</div>
            <div className="text-sm">✅ Correct: {Object.values(userAnswers).filter(a=>a?.isCorrect===true).length}</div>
            <div className="text-sm">📝 Notes: {Object.keys(notes).length}</div>
          </div>
        </div>
      </div>
    </>
  );
}