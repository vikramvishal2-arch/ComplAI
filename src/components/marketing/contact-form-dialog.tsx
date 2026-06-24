'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ContactFormData = {
  name: string;
  phone: string;
  email: string;
  requirement: string;
};

type ContactFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyForm: ContactFormData = {
  name: '',
  phone: '',
  email: '',
  requirement: '',
};

export function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  const [form, setForm] = useState<ContactFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setForm(emptyForm);
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange, reset]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
      setForm(emptyForm);
    } catch {
      setError('Unable to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close contact form"
        className="absolute inset-0 bg-scrut-navy/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="contact-form-title" className="text-lg font-semibold text-scrut-navy">
            Contact us
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <p className="text-lg font-semibold text-scrut-navy">Thank you for reaching out</p>
            <p className="mt-2 text-sm text-slate-600">
              We received your message and will get back to you shortly.
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-6 text-sm font-semibold text-scrut-navy hover:underline"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            <Field
              id="contact-name"
              label="Name"
              required
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Your full name"
            />
            <Field
              id="contact-phone"
              label="Phone"
              required
              type="tel"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
            />
            <Field
              id="contact-email"
              label="Email"
              required
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="you@company.com"
            />
            <div>
              <label htmlFor="contact-requirement" className="block text-sm font-medium text-slate-700">
                Requirement <span className="text-red-500">*</span>
              </label>
              <textarea
                id="contact-requirement"
                required
                rows={4}
                value={form.requirement}
                onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))}
                placeholder="Tell us about your GRC needs — frameworks, timelines, team size, etc."
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-scrut-blue focus:outline-none focus:ring-2 focus:ring-scrut-blue/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex w-full items-center justify-center rounded-full bg-scrut-gradient px-6 py-3 text-sm font-semibold text-scrut-navy shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60'
              )}
            >
              {submitting ? 'Submitting…' : 'Submit enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-scrut-blue focus:outline-none focus:ring-2 focus:ring-scrut-blue/20"
      />
    </div>
  );
}
