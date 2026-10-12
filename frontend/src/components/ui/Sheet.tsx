import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'center' | 'right' | 'bottom';
}

const POSITION_CLASSES: Record<NonNullable<SheetProps['position']>, string> = {
  center: 'inset-0 flex items-center justify-center p-4',
  right: 'inset-0 flex justify-end',
  bottom: 'inset-x-0 bottom-0 flex',
};

const PANEL_CLASSES: Record<NonNullable<SheetProps['position']>, string> = {
  center: 'w-full max-w-md rounded-2xl',
  right: 'h-full w-full max-w-sm',
  bottom: 'w-full max-h-[85vh] rounded-t-2xl',
};

export function Sheet({ open, onClose, title, children, position = 'center' }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div className={`absolute ${POSITION_CLASSES[position]}`}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`animate-slide-up relative flex flex-col overflow-hidden bg-surface shadow-popover ${PANEL_CLASSES[position]}`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg text-ink">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted"
              >
                ✕
              </button>
            </div>
          )}
          <div className="overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
