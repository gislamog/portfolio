import { useRef } from 'react';
import './AvatarButton.css';

const base = import.meta.env.BASE_URL;

/**
 * The header avatar. Clicking it opens the full picture in a modal overlay;
 * any click (or Esc) closes it. A native <dialog> puts the overlay in the top
 * layer above the whole shell and handles Esc and focus return for us.
 */
export function AvatarButton() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="avatar-button"
        aria-label="View profile picture"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <img
          className="logo-mark"
          src={`${base}avatar-cat.jpg`}
          alt=""
          width={40}
          height={40}
          decoding="async"
        />
      </button>
      <dialog
        ref={dialog}
        className="avatar-overlay"
        aria-label="Profile picture"
        onClick={() => dialog.current?.close()}
      >
        <img
          src={`${base}avatar-cat-full.jpg`}
          alt="Watercolor of a calico cat in an astronaut suit"
          width={900}
          height={789}
          loading="lazy"
          decoding="async"
        />
      </dialog>
    </>
  );
}
