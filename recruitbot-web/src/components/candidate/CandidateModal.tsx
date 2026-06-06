import React, { useEffect, useState, lazy, Suspense } from 'react';
import useCandidateModal from '../../hooks/use-candidate-modal';
import ModalHeader from './ModalHeader';
import ContactSection from './ContactSection';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
const ProjectsSection = lazy(() => import('./ProjectsSection'));
const CertificationsSection = lazy(() => import('./CertificationsSection'));
import { sanitizeHtml } from '../../lib/sanitize';

export function CandidateModal() {
  const { isOpen, candidate, loading, closeModal } = useCandidateModal();

  const contentRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeModal]);

  // Focus trap: save previous active element, focus first focusable inside modal,
  // and keep Tab navigation contained.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const container = contentRef.current;
    const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = container ? Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled')) : [];
    const first = focusable[0] || container;
    (first as HTMLElement | null)?.focus?.();

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (!container) return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const currentIndex = nodes.indexOf(document.activeElement as HTMLElement);
      let nextIndex = currentIndex;
      if (e.shiftKey) nextIndex = currentIndex <= 0 ? nodes.length - 1 : currentIndex - 1;
      else nextIndex = currentIndex === nodes.length - 1 ? 0 : currentIndex + 1;
      e.preventDefault();
      nodes[nextIndex].focus();
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [isOpen]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Screen-reader announcement when modal opens
  const [announce, setAnnounce] = useState('');
  useEffect(() => {
    if (isOpen) setAnnounce(`Opened profile for ${candidate?.name || 'candidate'}`);
    else setAnnounce('');
  }, [isOpen, candidate?.name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={candidate?._id ? `candidate-modal-title-${candidate._id}` : 'candidate-modal-title'}
        aria-describedby={candidate?._id ? `candidate-modal-desc-${candidate._id}` : 'candidate-modal-desc'}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-bg-surface rounded shadow-lg"
      >
        <div aria-live="polite" id="candidate-modal-announcement" className="sr-only">{announce}</div>
        <ModalHeader name={candidate?.name} title={candidate?.title} onClose={closeModal} onPrint={() => window.print()} titleId={candidate?._id ? `candidate-modal-title-${candidate._id}` : 'candidate-modal-title'} />

        {loading && <div className="p-6">Loading profile...</div>}

        {!loading && candidate && (
          <div>
            <ContactSection email={candidate.email} phone={candidate.phoneNumber} location={candidate.location} />
            <SkillsSection skills={candidate.skills} />
            <ExperienceSection experience={candidate.experience} />
            <EducationSection education={candidate.education} />
            <Suspense fallback={<div className="p-4">Loading projects...</div>}>
              <ProjectsSection projects={candidate.projects} />
              <CertificationsSection certifications={candidate.certifications} />
            </Suspense>
            <div id={candidate?._id ? `candidate-modal-desc-${candidate._id}` : 'candidate-modal-desc'} className="p-4 text-xs text-text-muted">Processed at: {candidate.processedAt}</div>
            {candidate.text && (
              <div className="p-4 border-t">
                <div className="text-xs text-text-muted mb-2">Resume Text</div>
                <div className="text-sm text-text-primary" dangerouslySetInnerHTML={{ __html: sanitizeHtml(candidate.text) }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateModal;
