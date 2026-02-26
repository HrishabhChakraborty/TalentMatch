import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Briefcase, GraduationCap, List, FileText, ArrowLeft, Eye, Download } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const emptyProfile = {
  id: null,
  name: '',
  email: '',
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
};

const RecruiterCandidateProfile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingPdf, setViewingPdf] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !id) {
        setLoading(false);
        return;
      }
      try {
        setError('');
        const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Candidate profile not found or not public.' : 'Failed to load candidate profile');
        }
        const data = await response.json();
        setProfile({ ...emptyProfile, ...data });
      } catch (err) {
        setError(err.message || 'Failed to load candidate profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, token]);

  const experience = useMemo(() => {
    try {
      return JSON.parse(profile.experienceJson || '[]');
    } catch {
      return [];
    }
  }, [profile.experienceJson]);

  const education = useMemo(() => {
    try {
      return JSON.parse(profile.educationJson || '[]');
    } catch {
      return [];
    }
  }, [profile.educationJson]);

  const skills = useMemo(() => {
    try {
      return JSON.parse(profile.skillsJson || '[]');
    } catch {
      return [];
    }
  }, [profile.skillsJson]);

  const projects = useMemo(() => {
    try {
      return JSON.parse(profile.projectsJson || '[]');
    } catch {
      return [];
    }
  }, [profile.projectsJson]);

  const certifications = useMemo(() => {
    try {
      return JSON.parse(profile.certificationsJson || '[]');
    } catch {
      return [];
    }
  }, [profile.certificationsJson]);

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

    const fullName = String(profile.name || 'Candidate').trim();
    const contactParts = [
      profile.professionalEmail || profile.email,
      profile.contactNumber,
      profile.githubUrl,
      profile.linkedinUrl,
      profile.location,
    ].filter(Boolean);

    doc.setFont('times', 'bold');
    writeWrapped(fullName.toUpperCase(), 26, 0, 6);
    doc.setFont('times', 'normal');
    writeWrapped(contactParts.join(' | '), 11, 0, 4);
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
      for (const skill of skills) writeWrapped(`- ${skill}`, 10.5, 8);
    }
    if (Array.isArray(projects) && projects.length > 0) {
      writeSectionHeader('Projects');
      for (const project of projects) writeWrapped(`- ${project}`, 10.5, 8);
    }
    if (Array.isArray(certifications) && certifications.length > 0) {
      writeSectionHeader('Certifications');
      for (const cert of certifications) writeWrapped(`- ${cert}`, 10.5, 8);
    }

    const fileSafeName = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return { doc, fileSafeName };
  };

  const handleViewPdf = async () => {
    setViewingPdf(true);
    try {
      const { doc } = await buildAtsPdf();
      window.open(doc.output('bloburl'), '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError((e && e.message) ? e.message : 'Failed to preview PDF');
    } finally {
      setViewingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const { doc, fileSafeName } = await buildAtsPdf();
      doc.save(`${fileSafeName || 'candidate'}_resume.pdf`);
    } catch (e) {
      setError((e && e.message) ? e.message : 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto text-gray-400">Loading candidate profile...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => navigate('/recruiter/search')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </button>
          <button
            onClick={handleViewPdf}
            disabled={viewingPdf || exporting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            {viewingPdf ? 'Opening PDF...' : 'View PDF'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={exporting || viewingPdf}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Download PDF'}
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{profile.name || 'Candidate'}</h2>
              <p className="text-gray-300 mb-2">{profile.title || '—'}</p>
              <p className="text-gray-500 text-sm">
                {profile.location || '—'} · {profile.experienceYears || '—'} · {profile.desiredRole || '—'}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                {[profile.professionalEmail || profile.email, profile.contactNumber, profile.githubUrl, profile.linkedinUrl]
                  .filter(Boolean)
                  .join(' · ') || 'No contact details available'}
              </p>
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
                    {Array.isArray(job.bullets) && job.bullets.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-gray-400 text-sm space-y-1">
                        {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
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
                {projects.map((project, i) => <li key={i}>{project}</li>)}
              </ul>
            </div>
          )}

          {Array.isArray(certifications) && certifications.length > 0 && (
            <div className="mb-6">
              <p className="text-emerald-400 font-semibold text-sm mb-2">Certifications</p>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                {certifications.map((cert, i) => <li key={i}>{cert}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterCandidateProfile;
