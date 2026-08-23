import { useState, type FormEvent } from 'react';
import { FiSend } from 'react-icons/fi';
import { profile } from '../data/profile';
import './ContactForm.css';

/**
 * The site is a static GitHub Pages build with no backend, so submissions go
 * through Formspree, which relays them to `profile.email`. The form id is
 * public by design (it only accepts posts), so it ships in the bundle via
 * VITE_FORMSPREE_ID rather than being treated as a secret.
 */
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;
const endpoint = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Without a configured endpoint the form would silently do nothing, so
    // fall back to the visitor's mail client rather than dropping the message.
    if (!endpoint) {
      const data = new FormData(form);
      const subject = encodeURIComponent(`Portfolio message from ${data.get('name') || 'a visitor'}`);
      const body = encodeURIComponent(`${data.get('message')}\n\nReply to: ${data.get('email')}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus('sending');
    setError('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.errors?.[0]?.message ?? 'Message could not be sent.');
      }
      form.reset();
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card contact-form contact-form-done" role="status">
        <h3>Thanks - your message is on its way.</h3>
        <p>I&apos;ll reply to the address you provided.</p>
        <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
          Send another
        </button>
      </div>
    );
  }

  const sending = status === 'sending';

  return (
    <form className="card contact-form" onSubmit={handleSubmit} noValidate={false}>
      <h3>Send a message</h3>

      <label className="field">
        <span className="field-label">
          Name <span className="field-optional">(optional)</span>
        </span>
        <input type="text" name="name" autoComplete="name" placeholder="Your name" />
      </label>

      <label className="field">
        <span className="field-label">
          Email <span className="field-required" aria-hidden="true">*</span>
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label className="field">
        <span className="field-label">
          Message <span className="field-required" aria-hidden="true">*</span>
        </span>
        <textarea name="message" required rows={5} placeholder="What would you like to talk about?" />
      </label>

      {/* Honeypot: bots fill hidden fields, humans never see this one. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="field-honeypot" />

      {status === 'error' && (
        <p className="field-error" role="alert">
          {error} You can also email{' '}
          <a href={`mailto:${profile.email}`}>{profile.email}</a> directly.
        </p>
      )}

      <button type="submit" className="btn btn-primary contact-submit" disabled={sending}>
        <FiSend aria-hidden="true" />
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
