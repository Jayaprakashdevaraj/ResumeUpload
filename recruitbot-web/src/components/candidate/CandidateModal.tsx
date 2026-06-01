import React, { useEffect } from 'react';
import useCandidateModal from '../../hooks/use-candidate-modal';
import ModalHeader from './ModalHeader';
import ContactSection from './ContactSection';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import ProjectsSection from './ProjectsSection';
import CertificationsSection from './CertificationsSection';

export function CandidateModal() {
  const { isOpen, candidate, loading, closeModal } = useCandidateModal();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-bg-surface rounded shadow-lg">
        <ModalHeader name={candidate?.name} title={candidate?.title} onClose={closeModal} />

        {loading && <div className="p-6">Loading profile...</div>}

        {!loading && candidate && (
          <div>
            <ContactSection email={candidate.email} phone={candidate.phoneNumber} location={candidate.location} />
            <SkillsSection skills={candidate.skills} />
            <ExperienceSection experience={candidate.experience} />
            <EducationSection education={candidate.education} />
            <ProjectsSection projects={candidate.projects} />
            <CertificationsSection certifications={candidate.certifications} />
            <div className="p-4 text-xs text-text-muted">Processed at: {candidate.processedAt}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateModal;
