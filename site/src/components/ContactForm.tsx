import { useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { FiCheckCircle, FiSend } from 'react-icons/fi';
import { profile } from '../data/profile';
import './ContactForm.css';

const formId = import.meta.env.VITE_FORMSPREE_ID;
const endpoint = formId ? `https://formspree.io/f/${formId}` : undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'email';
type Field = 'name' | 'email' | 'message';
type FieldErrors = Partial<Record<Field, string>>;

const fieldOrder: Field[] = ['name', 'email', 'message'];
const providerFieldMessages: Record<Field, string> = {
  name: 'Check your name and try again.',
  email: 'Check your email address and try again.',
  message: 'Check your message and try again.',
};

export function ContactForm({ initialMessage }: { initialMessage?: string }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const processing = useRef(false);
  const focusName = useRef(false);
  const pendingFocus = useRef<Field>();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState('');
  const [prefill, setPrefill] = useState(initialMessage ?? '');

  useLayoutEffect(() => {
    if (status === 'sent') {
      resultHeading.current?.focus();
      return;
    }
    const field = pendingFocus.current;
    pendingFocus.current = undefined;
    if (field) {
      const input = formRef.current?.elements.namedItem(field);
      if (input instanceof HTMLElement) input.focus();
    } else if (status === 'idle' && focusName.current) {
      focusName.current = false;
      formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }
  }, [errors, status]);

  function clearFieldError(field: Field) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function fieldAttributes(field: Field) {
    return {
      id: `${id}-${field}`,
      name: field,
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby': errors[field] ? `${id}-${field}-error` : undefined,
      onChange: () => clearFieldError(field),
    };
  }

  function fieldError(field: Field) {
    return errors[field] && <p id={`${id}-${field}-error`} className="contact-field-error" role="alert">{errors[field]}</p>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const emailField = form.elements.namedItem('email') as HTMLInputElement;
    const issues: FieldErrors = {};

    if (!email) issues.email = 'Enter your email address so I can reply.';
    else if (emailField.validity.typeMismatch) issues.email = 'Enter a valid email address, such as name@example.com.';
    if (!message) issues.message = 'Enter a message before sending.';

    pendingFocus.current = fieldOrder.find((field) => issues[field]);
    setErrors(issues);
    setFailure('');
    if (Object.keys(issues).length) {
      setStatus('idle');
      return;
    }

    if (!endpoint) {
      const subject = encodeURIComponent(`Portfolio message from ${name || 'a visitor'}`);
      const body = encodeURIComponent(`${message}\n\nReply to: ${email}`);
      setStatus('email');
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      return;
    }

    // Keep the provider's existing field names, including its _gotcha honeypot.
    data.set('name', name);
    data.set('email', email);
    data.set('message', message);
    processing.current = true;
    setStatus('sending');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result && result.ok !== false && !result.errors?.length) {
        setPrefill('');
        setStatus('sent');
        return;
      }

      const serverIssues: FieldErrors = {};
      if (Array.isArray(result?.errors)) {
        for (const issue of result.errors) {
          const field = fieldOrder.find((candidate) => candidate === issue?.field);
          if (field) serverIssues[field] = providerFieldMessages[field];
        }
      }
      pendingFocus.current = fieldOrder.find((field) => serverIssues[field]);
      setErrors(serverIssues);
      setFailure(response.status === 429
        ? 'Too many messages were sent recently. Please wait a minute and try again.'
        : 'Your message couldn’t be sent. Please try again.');
      setStatus('error');
    } catch {
      setFailure('Your message couldn’t be sent. Please check your connection and try again.');
      setStatus('error');
    } finally {
      processing.current = false;
    }
  }

  if (status === 'sent') {
    return (
      <section className="portfolio-card contact-form contact-form-result" aria-labelledby={`${id}-sent`}>
        <FiCheckCircle className="contact-success-icon" aria-hidden="true" />
        <h2 id={`${id}-sent`} ref={resultHeading} tabIndex={-1}>Message sent</h2>
        <p>Thanks for reaching out. I’ll reply to the email address you provided.</p>
        <button type="button" className="portfolio-pill contact-again" onClick={() => {
          focusName.current = true;
          setStatus('idle');
        }}>Send another message</button>
      </section>
    );
  }

  const sending = status === 'sending';
  return (
    <form ref={formRef} className="portfolio-card contact-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>Send a message</h2>

      <fieldset disabled={sending} aria-busy={sending} className="contact-fields">
        <div className="contact-sender">
          <div className="contact-field">
            <label htmlFor={`${id}-name`}>Name <span>(optional)</span></label>
            <input {...fieldAttributes('name')} type="text" autoComplete="name" />
            {fieldError('name')}
          </div>
          <div className="contact-field">
            <label htmlFor={`${id}-email`}>Email <span>(required)</span></label>
            <input {...fieldAttributes('email')} type="email" autoComplete="email" required />
            {fieldError('email')}
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor={`${id}-message`}>Message <span>(required)</span></label>
          <textarea {...fieldAttributes('message')} required rows={5} defaultValue={prefill} />
          {fieldError('message')}
        </div>

        <div hidden>
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-label="Leave this field empty" />
        </div>
      </fieldset>

      {status === 'error' && (
        <p className="contact-form-error" role="alert">
          {failure} You can also <a href={`mailto:${profile.email}`}>email me directly</a>.
        </p>
      )}

      <button type="submit" className="contact-submit" disabled={sending}>
        {endpoint ? sending ? 'Sending…' : 'Send message' : 'Open email app'}
        <FiSend aria-hidden="true" />
      </button>
      <p className="contact-form-hint" role="status">
        {sending ? 'Sending your message…' : status === 'email' ? 'Send the draft from your email app to complete your message.' : endpoint ? 'I’ll reply to the email address you provide.' : 'Your message opens as a draft in your email app.'}
      </p>
    </form>
  );
}
