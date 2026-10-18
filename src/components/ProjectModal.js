'use client';

import { useState, useEffect, useRef } from 'react';
import { siteData } from '@/data/siteData';
import { soundManager } from '@/lib/audioManager';

export default function ProjectModal({ isOpen, onClose, initialService = '' }) {
  const defaultService = siteData.services?.[0]?.title || 'Commercial Ad Film';

  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    companyName: '',
    serviceType: initialService || defaultService,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [inquiryResult, setInquiryResult] = useState(null);

  const modalRef = useRef(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      serviceType: initialService || defaultService,
    }));
  }, [initialService, defaultService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.stop();
      }
      setSubmitted(false);
      setErrorMsg('');
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const servicesList = siteData.services ? siteData.services.map((s) => s.title) : [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundManager.playSubBoom();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setInquiryResult(data);
      setSubmitted(true);
      soundManager.playWhoosh();
    } catch (err) {
      console.error('Inquiry Submission Error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate WhatsApp summary text for one-click fast messaging
  const getWhatsAppMessage = () => {
    if (!inquiryResult) return '';
    const text = `Hi ATZYNC Media! 👋
I just submitted a project inquiry on your website:
*Inquiry Code:* ${inquiryResult.inquiryId}
*Name:* ${formData.clientName}
*Company:* ${formData.companyName || 'N/A'}
*Service:* ${formData.serviceType}
*Phone/WhatsApp:* ${formData.phone}
*Overview:* ${formData.description}`;

    return `${siteData.contact.whatsappUrl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="project-modal-backdrop"
      data-lenis-prevent="true"
      data-lenis-prevent-touch="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="project-modal-container"
        data-lenis-prevent="true"
        data-lenis-prevent-touch="true"
      >
        {/* Close Icon */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          aria-label="Close Modal"
        >
          ✕
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1.25rem' }}>
            {/* Header */}
            <div className="flex-col" style={{ gap: '0.65rem', paddingRight: '2.5rem', marginBottom: '0.6rem' }}>
              <div>
                <span className="badge-tag" style={{ fontSize: '0.68rem', padding: '0.4rem 0.9rem', letterSpacing: '0.12em' }}>
                  ATZYNC STUDIO // INQUIRY FORM
                </span>
              </div>
              <h2
                className="heading-lg"
                style={{
                  fontSize: 'clamp(1.6rem, 3.8vw, 2.2rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  lineHeight: 1.18,
                  marginTop: '0.15rem',
                  marginBottom: '0.15rem',
                }}
              >
                START YOUR PROJECT
              </h2>
              <p
                className="body-regular"
                style={{
                  fontSize: '0.86rem',
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.55,
                  marginTop: '0.1rem',
                }}
              >
                Select your required editing service and enter your details to initiate your project brief.
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'rgba(255, 60, 60, 0.12)',
                  border: '1px solid rgba(255, 60, 60, 0.4)',
                  borderRadius: '12px',
                  color: '#ff6b6b',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 1. Service Selection */}
            <div className="flex-col" style={{ gap: '0.45rem' }}>
              <label className="meta-tag" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>
                1. SELECT SERVICE REQUIRED *
              </label>
              <div className="flex-row inquiry-pills-grid" style={{ flexWrap: 'wrap', gap: '0.45rem' }}>
                {servicesList.map((srv) => {
                  const isActive = formData.serviceType === srv;
                  return (
                    <button
                      key={srv}
                      type="button"
                      className={`inquiry-pill ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        soundManager.playClick();
                        setFormData({ ...formData, serviceType: srv });
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      <span className="check-icon">{isActive ? '✓' : '•'}</span>
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Contact Information Inputs */}
            <div className="flex-col" style={{ gap: '0.75rem' }}>
              <label className="meta-tag" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>
                2. CONTACT & BRAND DETAILS *
              </label>

              <div className="grid-2col" style={{ gap: '0.85rem' }}>
                <div className="flex-col" style={{ gap: '0.25rem' }}>
                  <label className="meta-tag" style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)' }}>YOUR FULL NAME *</label>
                  <input
                    type="text"
                    name="clientName"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.clientName}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div className="flex-col" style={{ gap: '0.25rem' }}>
                  <label className="meta-tag" style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)' }}>EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div className="flex-col" style={{ gap: '0.25rem' }}>
                  <label className="meta-tag" style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)' }}>WHATSAPP / PHONE NUMBER *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div className="flex-col" style={{ gap: '0.25rem' }}>
                  <label className="meta-tag" style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.8)' }}>COMPANY / BRAND NAME (OPTIONAL)</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Apex Media House"
                    value={formData.companyName}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* 3. Project Description & Scope */}
            <div className="flex-col" style={{ gap: '0.25rem' }}>
              <label className="meta-tag" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>
                3. PROJECT DESCRIPTION & SCOPE *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Describe your video project goals, required video count, editing style, or reference channels..."
                value={formData.description}
                onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Submit Button */}
            <div className="flex-row items-center justify-end" style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.25rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ padding: '0.8rem 2.2rem', minWidth: '190px' }}
              >
                {loading ? 'PROCESSING...' : 'SUBMIT INQUIRY →'}
              </button>
            </div>
          </form>
        ) : (
          /* SUCCESS CONFIRMATION SCREEN */
          <div className="flex-col items-center" style={{ gap: '1.5rem', textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                boxShadow: '0 0 30px rgba(255,255,255,0.2)',
              }}
            >
              ✓
            </div>

            <div className="flex-col items-center" style={{ gap: '0.5rem' }}>
              <span className="badge-tag" style={{ fontSize: '0.75rem' }}>
                INQUIRY CODE: {inquiryResult?.inquiryId || 'AM-CONFIRMED'}
              </span>
              <h2 className="heading-lg" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', textTransform: 'uppercase' }}>
                INQUIRY RECEIVED!
              </h2>
              <p className="body-regular" style={{ maxWidth: '520px', opacity: 0.88, fontSize: '0.9rem', lineHeight: 1.55 }}>
                Thank you, <strong>{formData.clientName}</strong>! Your project inquiry has been registered and a confirmation email has been sent to <strong>{formData.email}</strong>. Our creative director will review your brief and reach out shortly.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex-col items-center" style={{ gap: '0.75rem', width: '100%', maxWidth: '420px', marginTop: '0.5rem' }}>
              <a
                href={getWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: '100%', textDecoration: 'none' }}
                onClick={() => soundManager.playClick()}
              >
                💬 SEND DIRECT SUMMARY TO WHATSAPP →
              </a>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
              >
                DONE / CLOSE WINDOW
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.95rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '10px',
  color: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'all 0.2s ease',
};
