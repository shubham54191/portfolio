/**
 * Central portfolio data — every fact on the site comes from this file.
 * Update it here and the whole site follows.
 *
 * ⚠️ BEFORE PUBLISHING — fill in the TODOs below:
 *   1. profile.links  → your real LinkedIn / X URLs (GitHub is set)
 *   2. projects       → swap in your real projects, repo links and live-demo links
 *   3. experience     → real dates and numbers (users, latency, accuracy …) for each bullet
 *   4. public/assets/Shubham_Mohapatra_Resume.pdf → replace with your real resume
 */

export type Palette = { from: string; via: string; to: string; accent: string };

export const profile = {
  fullName: 'Shubham Mohapatra',
  displayName: 'Shubham Mohapatra',
  firstName: 'SHUBHAM',
  seriesTag: 'THE SERIES',
  /** Fictional studio card shown at the very start of the opening sequence. */
  originalLabel: 'A MOHAPATRA ORIGINAL',
  role: 'AI-Native Software Engineer',
  /** Hero headline + sub-headline */
  headline: 'AI-Native Software Engineer & Full-Stack Builder',
  subheadline:
    'I build autonomous agentic workflows, production-grade web systems and full-stack applications — from the first idea to shipped software.',
  tagline: ['AI-Native Engineer', 'Agentic AI', 'Full-Stack'],
  intro:
    'A Computer Science engineer (B.Tech) who builds AI systems that act — autonomous agents with function calling — and the full-stack products around them, with Python, TypeScript, React, Node.js, FastAPI and PostgreSQL + pgvector.',
  about: [
    'I come from a Computer Science background — my B.Tech is where I fell for two things at once: AI systems and full-stack development.',
    'Today I work as an AI-Native Engineer, designing agentic workflows where models plan, call tools and get real work done, and wrapping them in production-grade web apps.',
    'I like short loops: sketch the idea, ship the first version fast, then harden it for production.',
  ],
  highlights: [
    { title: 'Hackathon winner', detail: 'Won a DRDO co-partnered hackathon and reached the India Innovates 2026 national finals at Bharat Mandapam.' },
    { title: 'Fast shipper', detail: 'Takes ideas from a blank repo to a production deployment.' },
    { title: 'AI-native by default', detail: 'Agents, function calling and vector search are part of the everyday toolkit.' },
  ],
  availability: 'Open to exciting engineering roles, research collaborations, and freelance projects.',
  location: 'India',
  email: 'mohaptrashubham48@gmail.com',
  links: {
    // TODO: replace LinkedIn and X with real profile URLs
    linkedin: 'https://www.linkedin.com/in/your-handle/',
    github: 'https://github.com/shubham54191',
    x: 'https://x.com/your-handle',
  },
  githubLabel: 'github.com/shubham54191',
  resumePdf: '/assets/Shubham_Mohapatra_Resume.pdf',
  resumeFileName: 'Shubham_Mohapatra_Resume.pdf',
  portrait: {
    src: '/assets/portrait-720.webp',
    srcSet: '/assets/portrait-420.webp 420w, /assets/portrait-720.webp 720w, /assets/portrait-960.webp 960w, /assets/portrait-1200.webp 1200w',
    alt: 'Portrait of Shubham Mohapatra',
  },
  interests: ['Autonomous Agents', 'Function Calling', 'Vector Search', 'Production Systems'],
};

export const education = [
  {
    school: 'B.Tech — Computer Science',
    place: 'India',
    degree: 'Bachelor of Technology — Computer Science & Engineering',
    period: 'Undergraduate',
    score: 'CS fundamentals • AI systems • Full-stack',
  },
];

export type Experience = {
  company: string;
  role: string;
  place: string;
  period: string;
  stack: string[];
  points: string[];
  palette: Palette;
};

const crimson: Palette = { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' };
const amber: Palette = { from: '#1c1003', via: '#6b3c06', to: '#0a0806', accent: '#ffb547' };
const ocean: Palette = { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' };
const violet: Palette = { from: '#120822', via: '#3d1a6e', to: '#07060c', accent: '#b98bff' };
const jade: Palette = { from: '#03150f', via: '#0d5a40', to: '#050a08', accent: '#46e3a8' };

export const experience: Experience[] = [
  {
    company: 'SentrovaSolutions',
    role: 'AI-Native Engineer',
    place: 'India',
    period: 'Present', // TODO: e.g. "Jan 2026 – Present"
    stack: ['Python', 'TypeScript', 'React', 'Next.js', 'Node.js', 'FastAPI', 'PostgreSQL', 'pgvector'],
    points: [
      'Design and build agentic AI workflows — tool-using agents that plan, call functions and complete multi-step tasks end to end.',
      'Full-stack development across React / Next.js frontends and Node.js / FastAPI services backed by PostgreSQL and pgvector.',
      'Ship production-grade solutions: from prototype to deployed, monitored releases.',
    ],
    palette: crimson,
  },
  {
    company: 'Hansa AI / Hamaraneta',
    role: 'Software Development Intern',
    place: 'India',
    period: 'Internship', // TODO: e.g. "May 2025 – Aug 2025"
    stack: ['Python', 'Node.js', 'REST APIs', 'Chatbots', 'Data Pipelines'],
    points: [
      'Engineering research to evaluate approaches and tools before they went into the product.',
      'Integrated a chatbot into the platform, connecting conversational flows to backend APIs.',
      'Built data collection pipelines that gathered and structured data for downstream use.',
    ],
    palette: ocean,
  },
];

export type Metric = { value: string; label: string };

export type Project = {
  id: string;
  title: string;
  year: string;
  genre: string;
  /** One-line pitch: the problem it solves. */
  logline: string;
  stack: string[];
  /** Key architecture / impact bullets. */
  build: string[];
  features: string[];
  /** Optional numeric results — the impact strip is hidden when empty. */
  metrics: Metric[];
  /** Omit when the repository isn't public — the button is hidden instead of linking to a 404. */
  github?: string;
  /** Omit when there is no live deployment. */
  live?: string;
  palette: Palette;
  motif: 'shield' | 'flow' | 'tenants' | 'agent' | 'scan' | 'vector';
};

/** TODO: these three Originals are drafted from the brief — replace titles, details and links with your real projects. */
export const projects: Project[] = [
  {
    id: 'agentic-workflow-engine',
    title: 'Agentic Workflow Engine',
    year: '2026',
    genre: 'Agentic AI • Function Calling',
    logline: 'Turns a plain-language goal into a finished multi-step task — an autonomous agent that plans, calls tools and reports back.',
    stack: ['Python', 'FastAPI', 'Function Calling', 'PostgreSQL', 'Redis', 'React'],
    build: [
      'Built an agent loop using function calling: plan → call tool → observe result → decide the next step, until the goal is met.',
      'Typed tool registry with JSON-schema arguments, so every tool call is validated before it runs.',
      'Run state and step history persisted in PostgreSQL, with Redis for queueing — runs are resumable and auditable.',
    ],
    features: ['Autonomous multi-step execution', 'Schema-validated tool calls', 'Resumable, logged runs', 'Live run timeline in the UI'],
    metrics: [],
    github: 'https://github.com/your-username/agentic-workflow-engine',
    palette: crimson,
    motif: 'agent',
  },
  {
    id: 'ocr-json-pipeline',
    title: 'OCR → JSON Pipeline',
    year: '2026',
    genre: 'Data Pipeline • OCR • AI',
    logline: 'Kills manual data entry: scanned documents go in, clean structured JSON comes out.',
    stack: ['Python', 'FastAPI', 'OCR', 'LLM Extraction', 'PostgreSQL', 'Docker'],
    build: [
      'Integrated an OCR data pipeline that converts scanned pages and images into structured JSON.',
      'LLM-assisted field extraction with schema validation before anything is stored.',
      'Containerised FastAPI service so the pipeline runs the same locally and in production.',
    ],
    features: ['Image & PDF ingestion', 'Schema-validated JSON output', 'REST API for upload & results', 'Dockerised deployment'],
    metrics: [],
    github: 'https://github.com/your-username/ocr-json-pipeline',
    palette: amber,
    motif: 'scan',
  },
  {
    id: 'semantic-search-pgvector',
    title: 'Vector Search Assistant',
    year: '2026',
    genre: 'RAG • Full-Stack',
    logline: 'Ask your documents a question and get a grounded answer — semantic search on PostgreSQL + pgvector.',
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'pgvector', 'Tailwind CSS'],
    build: [
      'Embedding pipeline that chunks documents and stores vectors in PostgreSQL with pgvector — no separate vector DB to run.',
      'Retrieval-augmented answers that cite the chunks they came from.',
      'Full-stack Next.js app with streaming responses and a clean chat UI.',
    ],
    features: ['Semantic search over your docs', 'Answers with sources', 'Streaming chat UI', 'Single-database architecture'],
    metrics: [],
    github: 'https://github.com/your-username/vector-search-assistant',
    palette: ocean,
    motif: 'vector',
  },
];

export type Achievement = {
  id: string;
  title: string;
  org: string;
  detail: string;
  laurel: string;
  link?: string;
};

export const achievements: Achievement[] = [
  {
    id: 'drdo-hackathon',
    title: 'Hackathon Winner',
    org: 'DRDO co-partnered hackathon',
    detail: 'Won a hackathon co-partnered with DRDO, building under real time pressure.',
    laurel: 'Winner',
  },
  {
    id: 'india-innovates',
    title: 'National Finalist',
    org: 'India Innovates 2026',
    detail: 'Top 5,000 teams out of 1 crore+ participants; pitched at Bharat Mandapam, New Delhi (March 2026).',
    laurel: 'Top 5,000',
  },
  {
    id: 'chakravyuh',
    title: '36-Hour Build',
    org: 'Chakravyuh National Hackathon',
    detail: 'Built, debugged and deployed a working end-to-end prototype in one non-stop 36-hour sprint (January 2026).',
    laurel: 'National Hackathon',
  },
];

/**
 * "On the National Stage" — event photos with captions; a multi-day event opens as a day-by-day album.
 * Photos: put originals in photos/stage/<file>.jpg and run `npm run stage-photos`
 * (writes public/assets/stage/<file>-{800,1600}.{avif,webp}), then list them below by `file`.
 */
export type StagePhoto = { file: string; alt: string; /** CSS object-position, keeps faces in frame */ focus?: string };
export type StageDay = { label: string; date: string; title: string; caption: string; photos?: StagePhoto[] };
export type StageMoment = {
  id: string;
  event: string;
  venue: string;
  date: string;
  tag: string;
  caption: string;
  featured?: boolean;
  /** photo on the card (defaults to the first photo of the event) */
  cover?: StagePhoto;
  photos?: StagePhoto[];
  days?: StageDay[];
};

const GROUP_PHOTO: StagePhoto = {
  file: 'delhi-next-group',
  alt: 'Group photo of the Delhi Next student innovators at the Delhi Secretariat, in front of the Delhi Next screen',
  focus: '50% 60%',
};

export const stageMoments: StageMoment[] = [
  {
    id: 'delhi-next-2026',
    event: 'Delhi Next — Civic-Tech Challenge',
    venue: 'Delhi 2.0 Summer Camp, New Delhi',
    date: '1–4 July 2026',
    tag: 'Chief Minister meeting',
    caption:
      'Three days in the capital with fellow student innovators: idea presentations and project demos, a direct interaction with Delhi Chief Minister Rekha Gupta at the Delhi Secretariat, and the inaugural DelhiTech Trails tour.',
    featured: true,
    cover: GROUP_PHOTO,
    days: [
      {
        label: 'Day 1',
        date: 'Wed, 1 July',
        title: 'Ideas & demos',
        caption:
          'Opening session at Dr. Ambedkar International Centre, Janpath — a keynote on civic tech (how UPI, Jan Dhan and Aadhaar changed millions of lives), introductions, idea presentations and project demos, then the briefing for the Chief Minister meeting.',
      },
      {
        label: 'Day 2',
        date: 'Thu, 2 July',
        title: 'Chief Minister meeting',
        caption:
          'At the Delhi Secretariat: a direct interaction between the innovators and Delhi Chief Minister Rekha Gupta, with government secretaries and senior officers in the room.',
        photos: [GROUP_PHOTO],
      },
      {
        label: 'Day 3',
        date: 'Fri, 3 July',
        title: 'DelhiTech Trails',
        caption:
          "The inaugural DelhiTech Trails double-decker tour, hosted by Delhi's Tourism Minister, with 60 student innovators on board — Delhi Haat, Rashtrapati Bhavan, the National Museum, Pradhanmantri Sangrahalaya, the War Memorial and India Gate.",
      },
    ],
  },
  {
    id: 'india-innovates-2026',
    event: 'India Innovates 2026 — National Finals',
    venue: 'Bharat Mandapam, New Delhi',
    date: 'March 2026',
    tag: 'National Finalist',
    caption:
      'Shortlisted among the top 5,000 teams nationwide from over 1 crore participants, and pitched our tech solution in front of national leadership and ministers.',
  },
  {
    id: 'chakravyuh-2026',
    event: 'Chakravyuh National Hackathon',
    venue: 'GITA Autonomous College',
    date: 'January 2026',
    tag: '36-hour build',
    caption: 'Built, debugged and deployed a working end-to-end prototype through an intense 36-hour non-stop sprint.',
  },
];

export type Certification = { issuer: string; name: string; link: string };

/** Add certifications here — the rail is hidden while the list is empty. */
export const certifications: Certification[] = [];

export type Skill = { name: string; mono: string; note?: string };
export type SkillCategory = { id: string; title: string; subtitle: string; skills: Skill[] };

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages',
    subtitle: 'What I write in',
    skills: [
      { name: 'Python', mono: 'Py', note: 'Primary' },
      { name: 'JavaScript', mono: 'Js' },
      { name: 'TypeScript', mono: 'Ts' },
      { name: 'Java', mono: 'Jv' },
      { name: 'C/C++', mono: 'C+' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Interfaces & the web platform',
    skills: [
      { name: 'React', mono: 'Re' },
      { name: 'Next.js', mono: 'Nx' },
      { name: 'Tailwind CSS', mono: 'Tw' },
      { name: 'HTML5/CSS3', mono: 'Ht' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & Systems',
    subtitle: 'Services & APIs',
    skills: [
      { name: 'Node.js', mono: 'No' },
      { name: 'Express', mono: 'Ex' },
      { name: 'FastAPI', mono: 'Fa' },
      { name: 'REST APIs', mono: 'Ap' },
    ],
  },
  {
    id: 'databases',
    title: 'Databases & Vector Stores',
    subtitle: 'Relational, cache & vectors',
    skills: [
      { name: 'PostgreSQL', mono: 'Pg' },
      { name: 'pgvector', mono: 'Pv' },
      { name: 'Redis', mono: 'Rd' },
      { name: 'ClickHouse', mono: 'Ch' },
    ],
  },
  {
    id: 'ai',
    title: 'AI & Tooling',
    subtitle: 'Agents & shipping',
    skills: [
      { name: 'Autonomous Agents', mono: 'Ag', note: 'Focus' },
      { name: 'Function Calling', mono: 'Fn' },
      { name: 'Git/GitHub', mono: 'Gt' },
      { name: 'Docker', mono: 'Dk' },
      { name: 'Linux/Bash', mono: 'Sh' },
    ],
  },
];

/** Where each skill shows up — shown when a skill card is hovered/tapped. */
export const skillEvidence: Record<string, string[]> = {
  Python: ['Agentic Workflow Engine', 'OCR → JSON Pipeline', 'SentrovaSolutions'],
  TypeScript: ['Vector Search Assistant'],
  JavaScript: ['Hansa AI / Hamaraneta'],
  React: ['Agentic Workflow Engine', 'SentrovaSolutions'],
  'Next.js': ['Vector Search Assistant', 'SentrovaSolutions'],
  'Tailwind CSS': ['Vector Search Assistant'],
  'Node.js': ['Vector Search Assistant', 'Hansa AI / Hamaraneta'],
  FastAPI: ['Agentic Workflow Engine', 'OCR → JSON Pipeline'],
  'REST APIs': ['OCR → JSON Pipeline', 'Chatbot integration at Hansa AI'],
  PostgreSQL: ['Agentic Workflow Engine', 'Vector Search Assistant'],
  pgvector: ['Vector Search Assistant'],
  Redis: ['Agentic Workflow Engine'],
  'Autonomous Agents': ['Agentic Workflow Engine', 'SentrovaSolutions'],
  'Function Calling': ['Agentic Workflow Engine'],
  Docker: ['OCR → JSON Pipeline'],
};

export type Episode = {
  code: string;
  title: string;
  description: string;
  tags: string[];
  runtime: string;
  palette: Palette;
};

export type Season = {
  number: number;
  title: string;
  period: string;
  synopsis: string;
  episodes: Episode[];
};

export const seasons: Season[] = [
  {
    number: 1,
    title: 'The Foundation',
    period: 'B.Tech',
    synopsis: 'A Computer Science degree — and the first real taste of AI systems and full-stack development.',
    episodes: [
      {
        code: 'S01 E01',
        title: 'The Engineer',
        description: 'B.Tech in Computer Science — data structures, systems and the first full-stack apps.',
        tags: ['B.Tech', 'Computer Science'],
        runtime: 'Undergraduate',
        palette: violet,
      },
      {
        code: 'S01 E02',
        title: 'The Builder',
        description: 'Started shipping side projects end to end — frontend, backend, database, deploy.',
        tags: ['React', 'Node.js', 'Python'],
        runtime: 'Side projects',
        palette: jade,
      },
    ],
  },
  {
    number: 2,
    title: 'The National Stage',
    period: '2026',
    synopsis: 'Hackathons, national finals and a seat at the table in Delhi.',
    episodes: [
      {
        code: 'S02 E01',
        title: 'The Win',
        description: 'Won a DRDO co-partnered hackathon.',
        tags: ['DRDO', 'Hackathon', 'Winner'],
        runtime: 'Hackathon',
        palette: amber,
      },
      {
        code: 'S02 E02',
        title: 'The 36-Hour Sprint',
        description: 'Chakravyuh National Hackathon at GITA Autonomous College — a working end-to-end prototype, built, debugged and deployed in 36 hours.',
        tags: ['Chakravyuh', '36 hours', 'Prototype'],
        runtime: 'January 2026',
        palette: crimson,
      },
      {
        code: 'S02 E03',
        title: 'Bharat Mandapam',
        description: 'India Innovates 2026 national finals in New Delhi — top 5,000 of 1 crore+ participants, pitching to national leadership and ministers.',
        tags: ['India Innovates', 'National Finals', 'New Delhi'],
        runtime: 'March 2026',
        palette: violet,
      },
      {
        code: 'S02 E04',
        title: 'Delhi Next',
        description: "Delhi Next's Delhi 2.0 Summer Camp — three days in the capital with fellow student innovators, including a direct interaction with Delhi's Chief Minister at the Delhi Secretariat.",
        tags: ['Delhi Next', 'Civic Tech', 'Chief Minister'],
        runtime: 'July 2026',
        palette: ocean,
      },
    ],
  },
  {
    number: 3,
    title: 'The Intern',
    period: 'Hansa AI / Hamaraneta',
    synopsis: 'Software Development Intern — research, chatbots and data pipelines.',
    episodes: [
      {
        code: 'S03 E01',
        title: 'The Researcher',
        description: 'Engineering research to pick the right approaches and tools.',
        tags: ['Research'],
        runtime: 'Internship',
        palette: ocean,
      },
      {
        code: 'S03 E02',
        title: 'The Integrator',
        description: 'Chatbot integration and data collection pipelines.',
        tags: ['Chatbot', 'Data Pipelines', 'APIs'],
        runtime: 'Internship',
        palette: violet,
      },
    ],
  },
  {
    number: 4,
    title: 'AI-Native',
    period: 'SentrovaSolutions',
    synopsis: 'AI-Native Engineer — agentic workflows and production-grade full-stack systems.',
    episodes: [
      {
        code: 'S04 E01',
        title: 'The Agent Builder',
        description: 'Agentic AI workflows: models that plan, call tools and finish the job.',
        tags: ['Agents', 'Function Calling'],
        runtime: 'Now',
        palette: crimson,
      },
      {
        code: 'S04 E02',
        title: 'The Shipper',
        description: 'Full-stack development and production-grade releases.',
        tags: ['Next.js', 'FastAPI', 'PostgreSQL'],
        runtime: 'Now',
        palette: jade,
      },
    ],
  },
  {
    number: 5,
    title: "What's Next",
    period: 'Now streaming',
    synopsis: 'Open to engineering roles, research collaborations and freelance projects.',
    episodes: [
      {
        code: 'S05 E01',
        title: 'The Next Chapter',
        description: 'Bigger agent systems, more production traffic, and new collaborators.',
        tags: ['Open to roles', 'Research', 'Freelance'],
        runtime: 'In production',
        palette: amber,
      },
    ],
  },
];

export type TopPick = { label: string; title: string; detail: string; palette: Palette };

export const topPicks: TopPick[] = [
  { label: 'Core focus', title: 'Agentic AI', detail: 'Autonomous agents with function calling', palette: crimson },
  { label: 'Biggest win', title: 'DRDO Hackathon', detail: 'Winner — DRDO co-partnered hackathon', palette: amber },
  { label: 'Current role', title: 'Sentrova', detail: 'AI-Native Engineer', palette: ocean },
  { label: 'Primary language', title: 'Python', detail: 'with TypeScript for the web', palette: violet },
  { label: 'Vector stack', title: 'pgvector', detail: 'Semantic search inside PostgreSQL', palette: jade },
  { label: 'Backend pick', title: 'FastAPI', detail: 'plus Node.js & Express', palette: amber },
  { label: 'Frontend pick', title: 'Next.js', detail: 'React • Tailwind CSS', palette: crimson },
  { label: 'The intern arc', title: 'Hansa AI', detail: 'Chatbots & data pipelines', palette: ocean },
  { label: 'Biggest stage', title: 'Bharat Mandapam', detail: 'India Innovates 2026 national finals', palette: violet },
  { label: 'Now open to', title: 'New Roles', detail: 'Engineering • Research • Freelance', palette: jade },
];

/** Slides for the "▶ Play Intro" cinematic sequence. */
export type IntroSlide = { kicker: string; title: string; lines: string[]; chips?: string[] };

export const introSlides: IntroSlide[] = [
  {
    kicker: 'Who',
    title: 'AI-Native Engineer',
    lines: ['Full-stack builder with a Computer Science (B.Tech) background', 'Agents • Web systems • Full-stack apps'],
  },
  {
    kicker: 'Now',
    title: 'SentrovaSolutions',
    lines: ['AI-Native Engineer', 'Agentic AI workflows · full-stack · production-grade shipping'],
  },
  {
    kicker: 'Before',
    title: 'Hansa AI / Hamaraneta',
    lines: ['Software Development Intern', 'Engineering research · chatbot integration · data pipelines'],
  },
  {
    kicker: 'Originals',
    title: 'Agents that act.',
    lines: projects.map((p) => `${p.title} — ${p.genre}`),
  },
  {
    kicker: 'Stack',
    title: 'Python first.',
    lines: ['TypeScript · React · Next.js · Node.js · FastAPI', 'PostgreSQL · pgvector · Redis · ClickHouse · Docker'],
    chips: ['Python', 'TypeScript', 'Next.js', 'FastAPI', 'pgvector', 'Docker'],
  },
  {
    kicker: 'Moments',
    title: 'On the national stage',
    lines: ['Winner — DRDO co-partnered hackathon', 'National Finalist — India Innovates 2026, Bharat Mandapam', '36-hour build — Chakravyuh National Hackathon', 'Delhi Next — meeting with Delhi’s Chief Minister'],
  },
  {
    kicker: 'Next episode',
    title: "Let's build",
    lines: ['Open to engineering roles, research collaborations and freelance projects'],
  },
];

export type ProfileId = 'shubham' | 'recruiter' | 'developer' | 'creative';
export type SectionId = 'about' | 'experience' | 'journey' | 'originals' | 'picks' | 'skills' | 'moments' | 'stage' | 'story';

export const viewerProfiles: {
  id: ProfileId;
  name: string;
  blurb: string;
  color: string;
  order: SectionId[];
}[] = [
  {
    id: 'shubham',
    name: 'Shubham',
    blurb: 'The full series, in order',
    color: '#e5132b',
    order: ['about', 'originals', 'experience', 'skills', 'moments', 'stage', 'journey', 'picks', 'story'],
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    blurb: 'Experience, resume & skills first',
    color: '#4cc9ff',
    order: ['experience', 'story', 'skills', 'originals', 'moments', 'stage', 'about', 'journey', 'picks'],
  },
  {
    id: 'developer',
    name: 'Developer',
    blurb: 'Projects, stack & GitHub first',
    color: '#46e3a8',
    order: ['originals', 'skills', 'experience', 'about', 'moments', 'stage', 'journey', 'picks', 'story'],
  },
  {
    id: 'creative',
    name: 'Creative',
    blurb: 'The story arc & highlights first',
    color: '#ffb547',
    order: ['journey', 'stage', 'picks', 'originals', 'moments', 'about', 'experience', 'skills', 'story'],
  },
];

export const sectionMeta: Record<SectionId, { nav: string; card: string; meta: string; palette: Palette }> = {
  about: { nav: 'About', card: 'About Me', meta: 'The Pilot • Who I am', palette: violet },
  experience: { nav: 'Experience', card: 'Experience', meta: `${experience.length} Roles • Timeline`, palette: ocean },
  journey: { nav: 'Journey', card: 'My Journey', meta: `${seasons.length} Seasons • ${seasons.reduce((n, s) => n + s.episodes.length, 0)} Episodes`, palette: amber },
  originals: { nav: 'Projects', card: 'Featured Projects', meta: `${projects.length} Originals`, palette: crimson },
  picks: { nav: 'Top Picks', card: 'Top Picks', meta: 'Top 10', palette: jade },
  skills: { nav: 'Skills', card: 'My Skills', meta: `${skillCategories.length} Categories`, palette: ocean },
  moments: { nav: 'Moments', card: 'Achievements', meta: `${achievements.length} Moments`, palette: crimson },
  stage: { nav: 'Stage', card: 'National Stage', meta: `${stageMoments.length} Stills • 2026`, palette: amber },
  story: { nav: 'Resume', card: 'The Full Story', meta: 'Resume • View & download', palette: violet },
};
