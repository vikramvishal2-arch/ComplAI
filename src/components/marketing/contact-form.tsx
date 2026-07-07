'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  COUNTRY_DIAL_CODES,
  countryCodeToFlag,
  formatPhoneWithDialCode,
  getDialCodeForCountry,
  getPhoneDigits,
  isTenDigitPhone,
} from '@/lib/data/country-dial-codes';

export type ContactFormData = {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  requirement: string;
};

type ContactFormProps = {
  idPrefix?: string;
  className?: string;
  onSuccess?: () => void;
};

const emptyForm: ContactFormData = {
  name: '',
  countryCode: COUNTRY_DIAL_CODES[0].code,
  phone: '',
  email: '',
  requirement: '',
};

const fieldClassName =
  'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';

const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || '/api/contact';

export function ContactForm({ idPrefix = 'contact', className, onSuccess }: ContactFormProps) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isTenDigitPhone(form.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);

    const phone = formatPhoneWithDialCode(getDialCodeForCountry(form.countryCode), form.phone);
    const payload =
      CONTACT_ENDPOINT.includes('formsubmit.co')
        ? {
            name: form.name,
            email: form.email,
            phone,
            requirement: form.requirement,
            _subject: 'New contact enquiry from the Propel Ready Solutions website',
            _template: 'table',
          }
        : {
            name: form.name,
            email: form.email,
            requirement: form.requirement,
            phone,
          };

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CONTACT_ENDPOINT.includes('formsubmit.co') ? { Accept: 'application/json' } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
      setForm(emptyForm);
      onSuccess?.();
    } catch {
      setError('Unable to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={cn('py-6 text-center', className)}>
        <p className="text-lg font-semibold text-black">Thank you for reaching out</p>
        <p className="mt-2 text-sm text-slate-600">
          We received your message and will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 text-sm font-semibold text-black hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <Field
        id={`${idPrefix}-name`}
        label="Name"
        required
        value={form.name}
        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        placeholder="Your full name"
      />
      <PhoneField
        idPrefix={idPrefix}
        countryCode={form.countryCode}
        phone={form.phone}
        onCountryCodeChange={(countryCode) => setForm((f) => ({ ...f, countryCode }))}
        onPhoneChange={(phone) => setForm((f) => ({ ...f, phone }))}
      />
      <Field
        id={`${idPrefix}-email`}
        label="Email"
        required
        type="email"
        value={form.email}
        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        placeholder="you@company.com"
      />
      <div>
        <label htmlFor={`${idPrefix}-requirement`} className="block text-sm font-medium text-black">
          Requirement <span className="text-red-600">*</span>
        </label>
        <textarea
          id={`${idPrefix}-requirement`}
          required
          rows={4}
          value={form.requirement}
          onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))}
          placeholder="Tell us about your GRC needs — frameworks, timelines, team size, etc."
          className={fieldClassName}
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
          'inline-flex w-full items-center justify-center rounded-full bg-scrut-gradient px-6 py-3 text-sm font-semibold text-black shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60'
        )}
      >
        {submitting ? 'Submitting…' : 'Submit enquiry'}
      </button>
    </form>
  );
}

function CountryCodePicker({
  idPrefix,
  countryCode,
  onCountryCodeChange,
}: {
  idPrefix: string;
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected =
    COUNTRY_DIAL_CODES.find((country) => country.code === countryCode) ?? COUNTRY_DIAL_CODES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        id={`${idPrefix}-country-code`}
        aria-label="Country code"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-w-[6.75rem] items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2.5 text-sm text-black focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:min-w-[7.5rem]"
      >
        <span className="text-lg leading-none" aria-hidden>
          {countryCodeToFlag(selected.code)}
        </span>
        <span className="font-medium">{selected.dial}</span>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Country codes"
          className="absolute left-0 top-[calc(100%+0.25rem)] z-20 max-h-56 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {COUNTRY_DIAL_CODES.map((country) => {
            const active = country.code === countryCode;
            return (
              <li key={country.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(country.code);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-black hover:bg-slate-50',
                    active && 'bg-emerald-50'
                  )}
                >
                  <span className="text-lg leading-none">{countryCodeToFlag(country.code)}</span>
                  <span className="w-12 shrink-0 font-medium">{country.dial}</span>
                  <span className="truncate text-slate-600">{country.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PhoneField({
  idPrefix,
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
}: {
  idPrefix: string;
  countryCode: string;
  phone: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={`${idPrefix}-phone`} className="block text-sm font-medium text-black">
        Phone <span className="text-red-600">*</span>
      </label>
      <div className="mt-1.5 flex gap-2">
        <CountryCodePicker
          idPrefix={idPrefix}
          countryCode={countryCode}
          onCountryCodeChange={onCountryCodeChange}
        />
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel-national"
          minLength={10}
          maxLength={10}
          pattern="\d{10}"
          title="Enter a 10-digit phone number"
          value={phone}
          onChange={(e) => onPhoneChange(getPhoneDigits(e.target.value).slice(0, 10))}
          placeholder="9876543210"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">10-digit mobile number</p>
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
      <label htmlFor={id} className="block text-sm font-medium text-black">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClassName}
      />
    </div>
  );
}
