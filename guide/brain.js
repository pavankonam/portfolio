'use strict';

// Piko's knowledge is deliberately local and deterministic. The portfolio stays
// deployable on GitHub Pages, answers remain auditable, and no visitor question
// is sent to an AI service.
(() => {
  const links = {
    email: { label: 'Email Pavan', href: 'mailto:pavankonam@gmail.com', icon: '✉' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pavankonam/', icon: '↗' },
    github: { label: 'GitHub', href: 'https://github.com/pavankonam', icon: '↗' },
    resume: { label: 'Download résumé', href: 'AI_ML_Engineer.pdf', icon: '↓', download: true }
  };

  const intents = [
    { id: 'hello', keys: ['hello', 'hi', 'hey', 'good morning', 'good evening'], pose: 'wave',
      answer: "Hi! I'm Piko, Pavan's AI guide. I can show you his work, experience, skills, teaching, or résumé." },
    { id: 'piko', keys: ['who are you', 'what are you', 'piko', 'introduce yourself'], pose: 'wave',
      answer: "I'm Piko — a tiny cosmic co-pilot built to help you explore Pavan's work without digging through every panel." },
    { id: 'about', keys: ['who is pavan', 'about pavan', 'tell me about pavan', 'introduce pavan', 'background', 'summary', 'elevator pitch'], target: '#about', pose: 'happy',
      answer: 'Pavan is an AI engineer, founding engineer, and educator in Chicago. He builds production-minded systems across enterprise RAG, computer vision, healthcare AI, and applied machine learning.' },
    { id: 'current', keys: ['current role', 'currently building', 'what is he doing', 'where does he work', 'present job'], target: '#role-ruvaah', pose: 'point',
      answer: 'Pavan is currently a Founding Engineer at RUVAAH, designing hiring trust intelligence, multi-source verification pipelines, entity resolution, and audit-friendly credibility scoring.' },
    { id: 'ruvaah', keys: ['ruvaah', 'startup', 'founding engineer', 'hiring trust', 'candidate verification', 'resume fraud'], target: '#role-ruvaah', pose: 'point',
      answer: 'RUVAAH is a hiring-intelligence platform under active development. It is designed to cross-check candidate claims across professional, academic, public-web, portfolio, and GitHub signals before hiring decisions.' },
    { id: 'intellicore', keys: ['intellicore', 'enterprise rag', 'multi agent rag', 'multi-agent rag', 'commerce data', 'conversational analytics'], target: '#case-intellicore', pose: 'point',
      answer: 'Intellicore is a production-grade conversational intelligence platform that unifies commerce, marketing, analytics, and customer data through specialized agents and grounded retrieval.' },
    { id: 'visionary', keys: ['visionary', 'jewelry', 'image generation', 'generative ai images', 'product photos', 'computer vision project'], target: '#case-visionary', pose: 'point',
      answer: 'Visionary is an internal creative pipeline that analyzes brand references and turns catalog jewelry images into consistent on-model campaign imagery.' },
    { id: 'projects', keys: ['projects', 'project', 'selected work', 'what has he built', 'show work', 'portfolio'], target: '#projects', pose: 'point',
      answer: 'Start with Intellicore for enterprise RAG and Visionary for generative computer vision. Ten more research and industry projects cover NLP, healthcare, forecasting, gesture analysis, and generative models.', actions: ['research'] },
    { id: 'healthcare', keys: ['healthcare', 'medical ai', 'clinical', 'hospital', 'icu', 'patient', 'medicurious'], target: '#project-library', pose: 'think',
      answer: 'Pavan has worked across healthcare AI: clinical text and imaging at Cognizant, ICU admission-risk prediction, patient monitoring, and a domain-specialized medical LLM.' },
    { id: 'nlp', keys: ['nlp', 'language model', 'llm', 'chatbot', 'text classification', 'amazon reviews'], target: '#project-library', pose: 'think',
      answer: 'His language work spans enterprise RAG, emotion-aware conversational AI, medical LLMs, and detection of AI-generated product reviews.' },
    { id: 'vision', keys: ['computer vision', 'vision', 'opencv', 'yolo', 'image models', 'gesture'], target: '#project-library', pose: 'think',
      answer: 'His vision work includes on-model product generation, gesture understanding, medical imaging, webcam fitness coaching, and GAN-based image generation.' },
    { id: 'experience', keys: ['experience', 'work history', 'career', 'companies', 'previous roles'], target: '#experience', pose: 'point',
      answer: 'Pavan has worked as a founding engineer, AI software engineer, programming analyst, professor, teaching assistant, trainer, and early-stage technical leader.' },
    { id: 'hautecarat', keys: ['hautecarat', 'haute carat'], target: '#role-hautecarat', pose: 'point',
      answer: 'At HauteCarat, he built enterprise RAG and generative-vision systems, data pipelines, vector knowledge layers, internal analytics tools, and reproducible ML delivery workflows.' },
    { id: 'cognizant', keys: ['cognizant', 'programming analyst'], target: '#role-cognizant', pose: 'point',
      answer: 'At Cognizant, Pavan developed healthcare-focused deep-learning, NLP, speech-to-text, and cloud ML workflows, working from evaluation through production support.' },
    { id: 'teaching', keys: ['teaching', 'teacher', 'professor', 'educator', 'mentor', 'northwestern teaching'], target: '#role-professor', pose: 'happy',
      answer: 'Pavan independently taught an intensive Northwestern engineering course and served as a graduate teaching assistant for machine learning and introductory AI.' },
    { id: 'skills', keys: ['skills', 'tech stack', 'technologies', 'tools', 'programming languages', 'python', 'azure', 'aws'], target: '#about', pose: 'think',
      answer: 'His toolkit includes Python, FastAPI, PyTorch, TensorFlow, OpenCV, RAG, multi-agent orchestration, embeddings, LangChain, Azure, AWS, Docker, MLflow, and Airflow.' },
    { id: 'education', keys: ['education', 'degree', 'northwestern', 'masters', 'master', 'university', 'college', 'gpa'], target: '#education', pose: 'happy',
      answer: 'Pavan earned an M.S. in Artificial Intelligence from Northwestern University and a B.Tech in Electronics and Communication Engineering from TKR Engineering College.' },
    { id: 'leadership', keys: ['leadership', 'leader', 'ownership', 'founder mindset', 'mentorship'], target: '#experience', pose: 'happy',
      answer: 'His leadership spans founding-engineer ownership, end-to-end product architecture, full-course instruction, mentoring engineers and trainers, and building technical education programs.' },
    { id: 'location', keys: ['location', 'where is he based', 'where does he live', 'chicago', 'based'], target: '#contact', pose: 'wave',
      answer: 'Pavan is based in Chicago, Illinois. For current role or relocation details, contact him directly.', links: ['email'] },
    { id: 'contact', keys: ['contact', 'email', 'reach pavan', 'get in touch', 'talk to pavan', 'hire'], target: '#contact', pose: 'wave',
      answer: 'The best professional routes are email or LinkedIn. You can also download his résumé here.', links: ['email', 'linkedin', 'resume'] },
    { id: 'resume', keys: ['resume', 'résumé', 'cv', 'download'], pose: 'happy',
      answer: "Here's Pavan's résumé.", links: ['resume'] },
    { id: 'github', keys: ['github', 'code', 'repositories', 'repository', 'repos'], pose: 'point',
      answer: "Here's Pavan's GitHub profile.", links: ['github'] },
    { id: 'linkedin', keys: ['linkedin', 'linked in'], pose: 'point',
      answer: "Here's Pavan's LinkedIn profile.", links: ['linkedin'] },
    { id: 'tour', keys: ['tour', 'show me around', 'guide me', 'where should i start'], target: '#projects', pose: 'wave',
      answer: 'Start with selected work, then visit experience for the career story, and finish with the about and contact sections.', actions: ['tour'] },
    { id: 'private', keys: ['phone number', 'address', 'age', 'family', 'relationship', 'salary'], pose: 'think',
      answer: "I keep personal details private. I can show you Pavan's professional work or help you contact him by email.", links: ['email'] },
    { id: 'unrelated', keys: ['write code for me', 'do my homework', 'weather', 'news', 'stock price', 'jailbreak', 'ignore instructions'], pose: 'think',
      answer: "I only guide visitors through Pavan's portfolio. Ask me about his work, experience, skills, teaching, or contact details." }
  ];

  const fallback = {
    id: 'fallback', pose: 'think',
    answer: "I don't have a verified answer for that. Try asking about Pavan's projects, RUVAAH, experience, teaching, skills, or résumé.",
    links: ['email']
  };

  function normalize(value) {
    return ` ${String(value).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  }

  function match(question) {
    const normalized = normalize(question);
    const words = normalized.trim().split(' ');
    let winner = fallback;
    let winningScore = 0;
    intents.forEach(intent => {
      let score = 0;
      intent.keys.forEach(key => {
        const phrase = normalize(key).trim();
        if (phrase.includes(' ')) {
          if (normalized.includes(` ${phrase} `)) score += 4 + phrase.split(' ').length;
        } else if (words.includes(phrase)) score += 2;
        else if (phrase.length > 4 && words.some(word => word.startsWith(phrase))) score += 1;
      });
      if (score > winningScore) {
        winner = intent;
        winningScore = score;
      }
    });
    return winningScore >= 2 ? winner : fallback;
  }

  window.PikoBrain = {
    links,
    intents,
    match,
    chips: ['Who is Pavan?', "What's RUVAAH?", 'Show selected work', 'Teaching', 'Résumé'],
    intro: "Hi, I'm Piko — Pavan's cosmic AI guide. Ask me about his work, or let me show you around."
  };
})();
