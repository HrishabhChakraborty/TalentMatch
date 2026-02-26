import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, List, FileText, Pencil, Download, Eye } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const emptyProfile = {
  visibility: 'PRIVATE',
  title: '',
  professionalEmail: '',
  contactNumber: '',
  githubUrl: '',
  linkedinUrl: '',
  summary: '',
  location: '',
  desiredRole: '',
  experienceYears: '',
  experienceJson: '[]',
  educationJson: '[]',
  skillsJson: '[]',
  projectsJson: '[]',
  certificationsJson: '[]',
  profileCompletedAt: null,
};

const CandidateProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setError('');

        const [userRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/me/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) throw new Error('Failed to load user profile');
        if (!profileRes.ok) throw new Error('Failed to load candidate profile');

        const userData = await userRes.json();
        const profileData = await profileRes.json();

        setUser(userData);
        setProfile({
          ...emptyProfile,
          ...profileData,
        });
        // If profile not completed, redirect to onboarding (resume builder)
        const completedAt = profileData?.profileCompletedAt ?? null;
        if (!completedAt) {
          navigate('/candidate/onboarding', { replace: true });
          return;
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto text-gray-400">Loading profile...</div>
      </div>
    );
  }

  // Parse JSON fields for display
  let experience = [];
  let education = [];
  let skills = [];
  let projects = [];
  let certifications = [];
  try {
    experience = JSON.parse(profile.experienceJson || '[]');
  } catch {}
  try {
    education = JSON.parse(profile.educationJson || '[]');
  } catch {}
  try {
    skills = JSON.parse(profile.skillsJson || '[]');
  } catch {}
  try {
    projects = JSON.parse(profile.projectsJson || '[]');
  } catch {}
  try {
    certifications = JSON.parse(profile.certificationsJson || '[]');
  } catch {}

  const buildAtsPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const ensureSpace = (needed = 24) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const writeWrapped = (text, fontSize = 11, indent = 0, lineGap = 5) => {
      const safe = String(text ?? '').trim();
      if (!safe) return;
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(safe, contentWidth - indent);
      for (const line of lines) {
        ensureSpace(fontSize + lineGap);
        doc.text(line, margin + indent, y);
        y += fontSize + lineGap;
      }
    };

    const writeSectionHeader = (title) => {
      ensureSpace(34);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(String(title).toUpperCase(), margin, y);
      y += 8;
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
    };

    const writeLeftRightLine = (left, right, leftFontSize = 11, rightFontSize = 10) => {
      const leftSafe = String(left ?? '').trim();
      const rightSafe = String(right ?? '').trim();
      if (!leftSafe && !rightSafe) return;
      ensureSpace(18);
      if (leftSafe) {
        doc.setFontSize(leftFontSize);
        doc.text(leftSafe, margin, y);
      }
      if (rightSafe) {
        doc.setFontSize(rightFontSize);
        doc.text(rightSafe, pageWidth - margin, y, { align: 'right' });
      }
      y += Math.max(leftFontSize, rightFontSize) + 5;
    };

    const fullName = String(user?.name || 'Candidate').trim();
    const headerName = fullName.toUpperCase();
    const contactParts = [
      profile.professionalEmail ? String(profile.professionalEmail).trim() : (user?.email ? String(user.email).trim() : ''),
      profile.contactNumber ? String(profile.contactNumber).trim() : '',
      profile.githubUrl ? String(profile.githubUrl).trim() : '',
      profile.linkedinUrl ? String(profile.linkedinUrl).trim() : '',
    ].filter(Boolean);
    const contactLine = contactParts.join(' | ');

    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    writeWrapped(headerName, 26, 0, 6);
    doc.setFont('times', 'normal');
    writeWrapped(contactLine, 11, 0, 4);
    y += 6;

    writeSectionHeader('Summary');
    writeWrapped(profile.summary || 'No summary provided.');

    if (Array.isArray(experience) && experience.length > 0) {
      writeSectionHeader('Work Experience');
      for (const job of experience) {
        const roleLine = [job?.title, job?.company].filter(Boolean).join(' - ');
        const dateLine = [job?.startDate, job?.endDate].filter(Boolean).join(' - ');
        doc.setFont('helvetica', 'bold');
        writeLeftRightLine(roleLine, dateLine, 11, 10);
        doc.setFont('helvetica', 'normal');
        if (Array.isArray(job?.bullets)) {
          for (const bullet of job.bullets) {
            if (!String(bullet || '').trim()) continue;
            writeWrapped(`- ${bullet}`, 10.5, 8);
          }
        }
        y += 10;
      }
    }

    if (Array.isArray(education) && education.length > 0) {
      writeSectionHeader('Education');
      for (const edu of education) {
        const schoolLine = [edu?.school, edu?.degree].filter(Boolean).join(' - ');
        const dateLine = [edu?.startDate, edu?.endDate].filter(Boolean).join(' - ');
        doc.setFont('helvetica', 'bold');
        writeLeftRightLine(schoolLine, dateLine, 11, 10);
        doc.setFont('helvetica', 'normal');
        y += 8;
      }
    }

    if (Array.isArray(skills) && skills.length > 0) {
      writeSectionHeader('Skills');
      for (const skill of skills) {
        writeWrapped(`- ${skill}`, 10.5, 8);
      }
    }

    if (Array.isArray(projects) && projects.length > 0) {
      writeSectionHeader('Projects');
      for (const project of projects) {
        writeWrapped(`- ${project}`, 10.5, 8);
      }
    }

    if (Array.isArray(certifications) && certifications.length > 0) {
      writeSectionHeader('Certifications');
      for (const cert of certifications) {
        writeWrapped(`- ${cert}`, 10.5, 8);
      }
    }

    const fileSafeName = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return { doc, fileSafeName };
  };

  const handleDownloadAtsPdf = async () => {
    setExporting(true);
    try {
      const { doc, fileSafeName } = await buildAtsPdf();
      doc.save(`${fileSafeName || 'resume'}_ats_resume.pdf`);
    } catch (e) {
      setError((e && e.message) ? e.message : 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleViewAtsPdf = async () => {
    setViewingPdf(true);
    try {
      const { doc } = await buildAtsPdf();
      const pdfBlobUrl = doc.output('bloburl');
      window.open(pdfBlobUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError((e && e.message) ? e.message : 'Failed to preview PDF');
    } finally {
      setViewingPdf(false);
    }
  };

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownloadAtsPdf}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2 mr-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Download ATS PDF'}
          </button>
          <button
            onClick={handleViewAtsPdf}
            disabled={viewingPdf || exporting}
            className="inline-flex items-center gap-2 px-5 py-2 mr-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            {viewingPdf ? 'Opening PDF...' : 'View PDF'}
          </button>
          <button
            onClick={() => navigate('/candidate/onboarding?edit=1')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
          >
            <Pencil className="w-4 h-4" />
            Edit resume
          </button>
        </div>

        {/* Read-only resume view */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user?.name || 'Your Name'}
                </h2>
                <p className="text-gray-300 mb-2">
                  {profile.title || '—'}
                </p>
                <p className="text-gray-500 text-sm">
                  {profile.location || '—'} · {profile.experienceYears || '—'} · {profile.desiredRole || '—'}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  {[profile.professionalEmail || user?.email, profile.contactNumber, profile.githubUrl, profile.linkedinUrl]
                    .filter(Boolean)
                    .join(' · ') || 'Add contact links in Edit resume'}
                </p>
              </div>
            </div>
          </div>

          {profile.summary && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Professional Summary
              </p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{profile.summary}</p>
            </div>
          )}

          {Array.isArray(experience) && experience.length > 0 && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Experience
              </p>
              <ul className="space-y-4">
                {experience.map((job, i) => (
                  <li key={i} className="border-l-2 border-emerald-500/30 pl-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-white font-medium">{job.title || 'Role'}{job.company ? ` at ${job.company}` : ''}</p>
                      {(job.startDate || job.endDate) && (
                        <p className="text-gray-500 text-xs whitespace-nowrap text-right">{[job.startDate, job.endDate].filter(Boolean).join(' – ')}</p>
                      )}
                    </div>
                    {(job.startDate || job.endDate) && (
                      <span className="sr-only">{[job.startDate, job.endDate].filter(Boolean).join(' – ')}</span>
                    )}
                    {Array.isArray(job.bullets) && job.bullets.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-gray-400 text-sm space-y-1">
                        {job.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(education) && education.length > 0 && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education
              </p>
              <ul className="space-y-2">
                {education.map((edu, i) => (
                  <li key={i} className="text-gray-300 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-medium text-white">
                        {edu.school || 'School'}
                        {edu.degree && ` · ${edu.degree}`}
                      </span>
                      {(edu.startDate || edu.endDate) && (
                        <span className="text-gray-500 whitespace-nowrap text-right">{[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(skills) && skills.length > 0 && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <List className="w-4 h-4" /> Skills
              </p>
              <p className="text-gray-400 text-sm">{skills.join(', ')}</p>
            </div>
          )}

          {Array.isArray(projects) && projects.length > 0 && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2">Projects</p>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                {projects.map((project, i) => (
                  <li key={i}>{project}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(certifications) && certifications.length > 0 && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2">Certifications</p>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                {certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;