// Seed dummy users, candidate_profiles, and recruiter_profiles (current schema).
// Run from repo root: node scripts/userscript.js
// Requires: npm install pg bcrypt (or run from backend/talentmatch-backend and use its deps).
// Ensure DB has migrations applied: users, candidate_profiles, recruiter_profiles (no candidates table).
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'talentmatch',
  password: 'postgres',
  port: 5432,
  ssl: false,
});

const RECRUITER_PASSWORD = 'recruiter123';
const CANDIDATE_PASSWORD = 'candidate123';

// Recruiters: need companyName and jobTitle for recruiter_profiles
const dummyRecruiters = [
  { name: 'Recruiter Demo', email: 'recruiter@test.com', companyName: 'TalentMatch Inc', jobTitle: 'Technical Recruiter' },
  { name: 'Jane Smith', email: 'jane@test.com', companyName: 'TechCorp', jobTitle: 'Senior Recruiter' },
  { name: 'Mike Johnson', email: 'mike.r@test.com', companyName: 'StartupXYZ', jobTitle: 'Recruiter' },
  { name: 'Lisa Park', email: 'lisa@test.com', companyName: 'GlobalTech', jobTitle: 'HR Recruiter' },
  { name: 'David Brown', email: 'david.r@test.com', companyName: 'Enterprise Co', jobTitle: 'Technical Recruiter' },
];

// Candidate data: name, email for users; rest for candidate_profiles. Password for all: candidate123
const dummyCandidates = [
  {"name":"Sarah Chen","email":"sarah.chen@test.com","title":"Senior Frontend Developer","experience":"7 years","location":"Remote","resumeText":"Senior Frontend Developer with 7 years of experience. Expert in React, TypeScript, System Design, and Node.js. Led team of 5 engineers. Delivered 3 successful product launches. Performance optimization expert. Strong system design background and leadership experience. Cutting-edge tech stack.","skills":["React","TypeScript","System Design","Node.js"],"highlights":["Led team of 5","3 successful product launches","Performance optimization expert"]},
  {"name":"James Rodriguez","email":"james.rodriguez@test.com","title":"Frontend Engineer","experience":"6 years","location":"San Francisco, CA","resumeText":"Frontend Engineer with 6 years experience. San Francisco based. Proficient in React, Vue.js, JavaScript, GraphQL. Built 2 design systems. Mentored junior developers. Open source contributor.","skills":["React","Vue.js","JavaScript","GraphQL"],"highlights":["Built 2 design systems","Mentored juniors","Open source contributor"]},
  {"name":"Emily Watson","email":"emily.watson@test.com","title":"Full Stack Developer","experience":"5 years","location":"New York, NY","resumeText":"Full Stack Developer, 5 years experience. React, TypeScript, Python, AWS. Built products from 0 to 1. Scaled to 1M users. DevOps proficient.","skills":["React","TypeScript","Python","AWS"],"highlights":["0-1 product builder","Scaled to 1M users","DevOps proficient"]},
  {"name":"Alex Kim","email":"alex.kim@test.com","title":"Backend Engineer","experience":"4 years","location":"Remote","resumeText":"Backend engineer with Node.js, Python, PostgreSQL. Built APIs and microservices. Experience with Docker and Kubernetes.","skills":["Node.js","Python","PostgreSQL","Docker"],"highlights":["Microservices","REST APIs","CI/CD"]},
  {"name":"Morgan Lee","email":"morgan.lee@test.com","title":"Senior React Developer","experience":"8 years","location":"Austin, TX","resumeText":"Senior React developer. Deep expertise in React, Redux, TypeScript. Led frontend architecture. Performance and accessibility focus.","skills":["React","Redux","TypeScript","Jest"],"highlights":["Frontend architecture","Design systems","Testing"]},
  {"name":"Priya Sharma","email":"priya.sharma@test.com","title":"Software Engineer","experience":"3 years","location":"Bangalore, India","resumeText":"Software engineer with 3 years in Java and Spring Boot. Worked on payment systems and high-throughput APIs. Experience with Kafka and Redis.","skills":["Java","Spring Boot","Kafka","Redis"],"highlights":["Payment systems","High-throughput APIs","Event-driven design"]},
  {"name":"Marcus Johnson","email":"marcus.johnson@test.com","title":"DevOps Engineer","experience":"5 years","location":"Seattle, WA","resumeText":"DevOps engineer with AWS, Terraform, and Kubernetes. Built CI/CD pipelines and managed production infrastructure.","skills":["AWS","Terraform","Kubernetes","Linux"],"highlights":["CI/CD","Infrastructure as Code","On-call experience"]},
  {"name":"Omar Hassan","email":"omar.hassan@test.com","title":"Full Stack Engineer","experience":"6 years","location":"London, UK","resumeText":"Full stack engineer with Node.js, React, and PostgreSQL. Built B2B SaaS products and led small teams. Experience with real-time features and WebSockets.","skills":["Node.js","React","PostgreSQL","WebSockets"],"highlights":["B2B SaaS","Real-time features","Team lead"]},
  {"name":"Nina Petrov","email":"nina.petrov@test.com","title":"Data Engineer","experience":"5 years","location":"Berlin, Germany","resumeText":"Data engineer with Python, Spark, and Snowflake. Built data pipelines and analytics platforms. SQL and ETL expertise.","skills":["Python","Spark","Snowflake","SQL"],"highlights":["ETL","Data modeling","Airflow"]},
  {"name":"Chris Williams","email":"chris.williams@test.com","title":"Senior Backend Developer","experience":"9 years","location":"Remote","resumeText":"Senior backend developer with Go and Python. Distributed systems, databases, and API design. Previously at large-scale consumer companies.","skills":["Go","Python","PostgreSQL","gRPC"],"highlights":["Distributed systems","API design","Mentorship"]},
];

function buildExperienceJson(c) {
  const bullets = Array.isArray(c.highlights) ? c.highlights : [];
  return JSON.stringify([
    {
      title: c.title || 'Software Engineer',
      company: 'Previous Company',
      startDate: '',
      endDate: '',
      bullets,
    },
  ]);
}

function buildEducationJson() {
  return JSON.stringify([
    { school: 'University', degree: 'B.S. Computer Science', startDate: '', endDate: '' },
  ]);
}

async function seed() {
  const client = await pool.connect();
  try {
    const hashedRecruiter = await bcrypt.hash(RECRUITER_PASSWORD, 10);
    const hashedCandidate = await bcrypt.hash(CANDIDATE_PASSWORD, 10);

    // Insert recruiters into users
    for (const u of dummyRecruiters) {
      if (!u.email) continue;
      await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'RECRUITER')
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, hashedRecruiter]
      );
    }
    console.log('Recruiter users inserted (or skipped if email exists).');

    // Insert recruiter_profiles (one per recruiter user)
    for (const u of dummyRecruiters) {
      if (!u.email || !u.companyName || !u.jobTitle) continue;
      const r = await client.query(
        'SELECT id FROM users WHERE email = $1 AND role = $2',
        [u.email, 'RECRUITER']
      );
      if (r.rows.length === 0) continue;
      const userId = r.rows[0].id;
      await client.query(
        `INSERT INTO recruiter_profiles (user_id, company_name, job_title)
         SELECT $1, $2, $3
         WHERE NOT EXISTS (
           SELECT 1 FROM recruiter_profiles WHERE user_id = $1
         )`,
        [userId, u.companyName, u.jobTitle]
      );
    }
    console.log('Recruiter profiles inserted.');

    // Insert candidates into users
    for (const c of dummyCandidates) {
      if (!c.email) continue;
      await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'CANDIDATE')
         ON CONFLICT (email) DO NOTHING`,
        [c.name, c.email, hashedCandidate]
      );
    }
    console.log('Candidate users inserted (or skipped if email exists).');

    // Insert candidate_profiles (one per candidate user)
    for (const c of dummyCandidates) {
      if (!c.email) continue;
      const r = await client.query(
        'SELECT id FROM users WHERE email = $1 AND role = $2',
        [c.email, 'CANDIDATE']
      );
      if (r.rows.length === 0) continue;
      const userId = r.rows[0].id;
      const summary = (c.resumeText || '').slice(0, 500);
      const experienceJson = buildExperienceJson(c);
      const educationJson = buildEducationJson();
      const skillsJson = JSON.stringify(Array.isArray(c.skills) ? c.skills : []);
      await client.query(
        `INSERT INTO candidate_profiles (
          user_id, visibility, title, summary, location, desired_role, experience_years,
          experience_json, education_json, skills_json, profile_completed_at, resume_text
        )
        SELECT $1, 'PUBLIC', $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10
        WHERE NOT EXISTS (
          SELECT 1 FROM candidate_profiles WHERE user_id = $1
        )`,
        [
          userId,
          c.title || '',
          summary,
          c.location || '',
          c.title || 'Software Engineer',
          c.experience || '',
          experienceJson,
          educationJson,
          skillsJson,
          c.resumeText || '',
        ]
      );
    }
    console.log('Candidate profiles inserted into candidate_profiles.');

    console.log('Done. Passwords: recruiters =', RECRUITER_PASSWORD, ', candidates =', CANDIDATE_PASSWORD);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
