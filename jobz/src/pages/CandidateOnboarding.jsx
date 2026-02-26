import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Briefcase, GraduationCap, List, FileText, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const STEPS = [
  { id: 1, title: 'Basics', icon: User },
  { id: 2, title: 'Experience', icon: Briefcase },
  { id: 3, title: 'Education', icon: GraduationCap },
  { id: 4, title: 'Skills', icon: List },
  { id: 5, title: 'Projects', icon: FileText },
  { id: 6, title: 'Certifications', icon: FileText },
  { id: 7, title: 'Summary', icon: FileText },
  { id: 8, title: 'Complete', icon: CheckCircle },
];

const emptyProfile = {
  title: '',
  professionalEmail: '',
  contactNumber: '',
  githubUrl: '',
  linkedinUrl: '',
  location: '',
  desiredRole: '',
  experienceYears: '',
  experienceJson: '[]',
  educationJson: '[]',
  skillsJson: '[]',
  projectsJson: '[]',
  certificationsJson: '[]',
  summary: '',
  visibility: 'PRIVATE',
};

function parseExperienceJson(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function parseEducationJson(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function ensureExperienceEntry(entry) {
  return {
    title: entry?.title ?? '',
    company: entry?.company ?? '',
    startDate: entry?.startDate ?? '',
    endDate: entry?.endDate ?? '',
    bullets: Array.isArray(entry?.bullets) ? [...entry.bullets] : [],
  };
}

function ensureEducationEntry(entry) {
  return {
    school: entry?.school ?? '',
    degree: entry?.degree ?? '',
    startDate: entry?.startDate ?? '',
    endDate: entry?.endDate ?? '',
  };
}

function parseProjectsJson(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function parseCertificationsJson(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const CandidateOnboarding = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(emptyProfile);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/me/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!userRes.ok || !profileRes.ok) throw new Error('Failed to load');
        const userData = await userRes.json();
        const profileData = await profileRes.json();
        setUser(userData);
        setProfile({ ...emptyProfile, ...profileData });
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const patchProfile = async (payload, complete = false) => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const body = { ...payload };
      if (complete) body.profileCompletedAt = true;
      const response = await fetch(`${API_BASE_URL}/me/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to save');
      const updated = await response.json();
      setProfile((prev) => ({ ...prev, ...updated }));
      if (complete) navigate('/candidate/profile');
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      patchProfile({
        title: profile.title,
        professionalEmail: profile.professionalEmail,
        contactNumber: profile.contactNumber,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        location: profile.location,
        desiredRole: profile.desiredRole,
        experienceYears: profile.experienceYears,
      }).then(() => setStep(2));
    } else if (step === 2) {
      patchProfile({ experienceJson: profile.experienceJson }).then(() => setStep(3));
    } else if (step === 3) {
      patchProfile({ educationJson: profile.educationJson }).then(() => setStep(4));
    } else if (step === 4) {
      const skillsRaw = (() => {
        try {
          const arr = JSON.parse(profile.skillsJson || '[]');
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })();
      const skillsFiltered = skillsRaw.map((s) => String(s).trim()).filter(Boolean);
      patchProfile({ skillsJson: JSON.stringify(skillsFiltered) }).then(() => setStep(5));
    } else if (step === 5) {
      patchProfile({ projectsJson: profile.projectsJson }).then(() => setStep(6));
    } else if (step === 6) {
      patchProfile({ certificationsJson: profile.certificationsJson }).then(() => setStep(7));
    } else if (step === 7) {
      patchProfile({ summary: profile.summary }).then(() => setStep(8));
    } else if (step === 8 && !isEdit) {
      patchProfile({ visibility: profile.visibility }, true);
    } else if (step === 8 && isEdit) {
      patchProfile({ visibility: profile.visibility }).then(() => navigate('/candidate/profile'));
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  if (loading) {
    return (
      <div className="pt-24 px-6 pb-12 text-gray-400 text-center">Loading...</div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit resume' : 'Build your resume'}
          </h1>
          <div className="flex gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= s.id ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {s.id}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Basics</h2>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Professional headline / title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Professional email</label>
                <input
                  type="email"
                  value={profile.professionalEmail || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, professionalEmail: e.target.value }))}
                  placeholder="e.g. jane.work@email.com"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Contact number</label>
                <input
                  type="text"
                  value={profile.contactNumber || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, contactNumber: e.target.value }))}
                  placeholder="e.g. +1 555 123 4567"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">GitHub link</label>
                <input
                  type="url"
                  value={profile.githubUrl || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, githubUrl: e.target.value }))}
                  placeholder="e.g. https://github.com/janedoe"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">LinkedIn link</label>
                <input
                  type="url"
                  value={profile.linkedinUrl || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))}
                  placeholder="e.g. https://linkedin.com/in/janedoe"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Desired role</label>
                <input
                  type="text"
                  value={profile.desiredRole}
                  onChange={(e) => setProfile((p) => ({ ...p, desiredRole: e.target.value }))}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Years of experience</label>
                <input
                  type="text"
                  value={profile.experienceYears}
                  onChange={(e) => setProfile((p) => ({ ...p, experienceYears: e.target.value }))}
                  placeholder="e.g. 5+ years"
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          )}

          {step === 2 && (() => {
            const list = parseExperienceJson(profile.experienceJson).map(ensureExperienceEntry);
            const isFresher = list.length === 0;
            const displayList = list.length ? list : [ensureExperienceEntry(null)];
            const setExperiences = (next) => setProfile((p) => ({ ...p, experienceJson: JSON.stringify(next.length ? next : []) }));
            const setFresher = (checked) => {
              if (checked) setProfile((p) => ({ ...p, experienceJson: '[]' }));
              else setProfile((p) => ({ ...p, experienceJson: JSON.stringify([ensureExperienceEntry(null)]) }));
            };
            return (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Work experience or internships</h2>
                <p className="text-gray-400 text-sm mb-4">Add each job, internship, or role. You can add bullet points for key achievements.</p>
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={isFresher}
                    onChange={(e) => setFresher(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-500/50 bg-black/40 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  <span className="text-gray-300 text-sm">I don&apos;t have work experience yet (fresher)</span>
                </label>
                {!isFresher && (
                  <>
                {displayList.map((jobEntry, jobIndex) => {
                  const updateJob = (field, value) => {
                    const next = [...displayList];
                    next[jobIndex] = { ...ensureExperienceEntry(next[jobIndex]), [field]: value };
                    setExperiences(next);
                  };
                  const updateBullet = (bulletIndex, value) => {
                    const bullets = [...(jobEntry.bullets || [])];
                    bullets[bulletIndex] = value;
                    updateJob('bullets', bullets);
                  };
                  const addBullet = () => updateJob('bullets', [...(jobEntry.bullets || []), '']);
                  const removeBullet = (i) => updateJob('bullets', (jobEntry.bullets || []).filter((_, idx) => idx !== i));
                  const removeJob = () => setExperiences(displayList.filter((_, i) => i !== jobIndex));
                  return (
                    <div key={jobIndex} className="rounded-xl border border-emerald-500/30 bg-black/40 p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 font-medium text-sm">Job {jobIndex + 1}</span>
                        {displayList.length > 1 && (
                          <button type="button" onClick={removeJob} className="text-red-400 hover:text-red-300 text-sm">
                            Remove job
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Job title</label>
                          <input
                            type="text"
                            value={jobEntry.title}
                            onChange={(e) => updateJob('title', e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Company</label>
                          <input
                            type="text"
                            value={jobEntry.company}
                            onChange={(e) => updateJob('company', e.target.value)}
                            placeholder="e.g. Tech Co"
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Start date</label>
                            <input
                              type="text"
                              value={jobEntry.startDate}
                              onChange={(e) => updateJob('startDate', e.target.value)}
                              placeholder="e.g. 2020"
                              className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">End date</label>
                            <input
                              type="text"
                              value={jobEntry.endDate}
                              onChange={(e) => updateJob('endDate', e.target.value)}
                              placeholder="e.g. 2023 or Present"
                              className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Key achievements (one per line)</label>
                          {(jobEntry.bullets || []).map((bullet, bi) => (
                            <div key={bi} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBullet(bi, e.target.value)}
                                placeholder="e.g. Led migration to React"
                                className="flex-1 bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                              />
                              <button type="button" onClick={() => removeBullet(bi)} className="text-red-400 hover:text-red-300 text-sm px-2">
                                Remove
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={addBullet} className="text-emerald-400 hover:text-emerald-300 text-sm">
                            + Add bullet point
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setExperiences([...displayList, ensureExperienceEntry(null)])}
                  className="w-full py-2 border border-dashed border-emerald-500/40 rounded-xl text-emerald-400 text-sm hover:bg-emerald-500/10"
                >
                  + Add another job
                </button>
                  </>
                )}
              </div>
            );
          })()}

          {step === 3 && (() => {
            const list = parseEducationJson(profile.educationJson).map(ensureEducationEntry);
            const displayList = list.length ? list : [ensureEducationEntry(null)];
            const setEducations = (next) => setProfile((p) => ({ ...p, educationJson: JSON.stringify(next.length ? next : [ensureEducationEntry(null)]) }));
            return (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Education</h2>
                <p className="text-gray-400 text-sm mb-4">Add your degrees and schools.</p>
                {displayList.map((eduEntry, eduIndex) => {
                  const updateEdu = (field, value) => {
                    const next = [...displayList];
                    next[eduIndex] = { ...ensureEducationEntry(next[eduIndex]), [field]: value };
                    setEducations(next);
                  };
                  const removeEdu = () => setEducations(displayList.filter((_, i) => i !== eduIndex));
                  return (
                    <div key={eduIndex} className="rounded-xl border border-emerald-500/30 bg-black/40 p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 font-medium text-sm">Education {eduIndex + 1}</span>
                        {displayList.length > 1 && (
                          <button type="button" onClick={removeEdu} className="text-red-400 hover:text-red-300 text-sm">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">School / University</label>
                          <input
                            type="text"
                            value={eduEntry.school}
                            onChange={(e) => updateEdu('school', e.target.value)}
                            placeholder="e.g. State University"
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Degree</label>
                          <input
                            type="text"
                            value={eduEntry.degree}
                            onChange={(e) => updateEdu('degree', e.target.value)}
                            placeholder="e.g. B.S. Computer Science"
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Start date</label>
                            <input
                              type="text"
                              value={eduEntry.startDate}
                              onChange={(e) => updateEdu('startDate', e.target.value)}
                              placeholder="e.g. 2016"
                              className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">End date</label>
                            <input
                              type="text"
                              value={eduEntry.endDate}
                              onChange={(e) => updateEdu('endDate', e.target.value)}
                              placeholder="e.g. 2020"
                              className="w-full bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setEducations([...displayList, ensureEducationEntry(null)])}
                  className="w-full py-2 border border-dashed border-emerald-500/40 rounded-xl text-emerald-400 text-sm hover:bg-emerald-500/10"
                >
                  + Add another education
                </button>
              </div>
            );
          })()}

          {step === 4 && (() => {
            function parseSkillsJson(json) {
              try {
                const arr = JSON.parse(json || '[]');
                return Array.isArray(arr) ? arr : [];
              } catch {
                return [];
              }
            }
            const list = parseSkillsJson(profile.skillsJson);
            const displayList = list.length ? list : [''];
            const setSkills = (next) => {
              const filtered = next.filter((s) => s != null && String(s).trim() !== '');
              setProfile((p) => ({ ...p, skillsJson: JSON.stringify(filtered.length ? filtered : []) }));
            };
            const updateSkill = (index, value) => {
              const next = [...displayList];
              next[index] = value;
              setProfile((p) => ({ ...p, skillsJson: JSON.stringify(next) }));
            };
            const removeSkill = (index) => setSkills(displayList.filter((_, i) => i !== index));
            return (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                <p className="text-gray-400 text-sm mb-4">Add your skills one by one.</p>
                {displayList.map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(idx, e.target.value)}
                      placeholder="e.g. React"
                      className="flex-1 bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="text-red-400 hover:text-red-300 text-sm px-3"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, skillsJson: JSON.stringify([...displayList, '']) }))}
                  className="w-full py-2 border border-dashed border-emerald-500/40 rounded-xl text-emerald-400 text-sm hover:bg-emerald-500/10"
                >
                  + Add skill
                </button>
              </div>
            );
          })()}

          {step === 5 && (() => {
            const list = parseProjectsJson(profile.projectsJson);
            const displayList = list.length ? list : [''];
            const setProjects = (next) => {
              const cleaned = next.map((s) => String(s ?? '').trim()).filter(Boolean);
              setProfile((p) => ({ ...p, projectsJson: JSON.stringify(cleaned) }));
            };
            const updateProject = (index, value) => {
              const next = [...displayList];
              next[index] = value;
              setProfile((p) => ({ ...p, projectsJson: JSON.stringify(next) }));
            };
            return (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Projects</h2>
                <p className="text-gray-400 text-sm mb-4">Add key projects one by one.</p>
                {displayList.map((project, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => updateProject(idx, e.target.value)}
                      placeholder="e.g. Built ATS dashboard used by 50 recruiters"
                      className="flex-1 bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => setProjects(displayList.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 text-sm px-3"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, projectsJson: JSON.stringify([...displayList, '']) }))}
                  className="w-full py-2 border border-dashed border-emerald-500/40 rounded-xl text-emerald-400 text-sm hover:bg-emerald-500/10"
                >
                  + Add project
                </button>
              </div>
            );
          })()}

          {step === 6 && (() => {
            const list = parseCertificationsJson(profile.certificationsJson);
            const displayList = list.length ? list : [''];
            const setCerts = (next) => {
              const cleaned = next.map((s) => String(s ?? '').trim()).filter(Boolean);
              setProfile((p) => ({ ...p, certificationsJson: JSON.stringify(cleaned) }));
            };
            const updateCert = (index, value) => {
              const next = [...displayList];
              next[index] = value;
              setProfile((p) => ({ ...p, certificationsJson: JSON.stringify(next) }));
            };
            return (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Certifications</h2>
                <p className="text-gray-400 text-sm mb-4">Add certifications if any.</p>
                {displayList.map((cert, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => updateCert(idx, e.target.value)}
                      placeholder="e.g. AWS Certified Developer Associate"
                      className="flex-1 bg-black/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => setCerts(displayList.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 text-sm px-3"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, certificationsJson: JSON.stringify([...displayList, '']) }))}
                  className="w-full py-2 border border-dashed border-emerald-500/40 rounded-xl text-emerald-400 text-sm hover:bg-emerald-500/10"
                >
                  + Add certification
                </button>
              </div>
            );
          })()}

          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Professional summary</h2>
              <textarea
                value={profile.summary}
                onChange={(e) => setProfile((p) => ({ ...p, summary: e.target.value }))}
                placeholder="A few sentences about your experience, strengths, and what you're looking for..."
                className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white min-h-[160px] outline-none focus:border-emerald-500/60"
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Visibility & finish</h2>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Who can see your profile?</label>
                <select
                  value={profile.visibility}
                  onChange={(e) => setProfile((p) => ({ ...p, visibility: e.target.value }))}
                  className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/60"
                >
                  <option value="PRIVATE">Private (only you)</option>
                  <option value="PUBLIC">Public (recruiters can find you)</option>
                </select>
              </div>
              <p className="text-gray-400 text-sm">
                {isEdit ? 'Save and go back to your profile.' : 'Click Complete to finish. Your resume will be visible as your main profile.'}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/candidate/profile')}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium"
              >
                View resume
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : step === 8 ? (isEdit ? 'Save & finish' : 'Complete profile') : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboarding;
