import {useEffect, useId, useRef, type ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {X} from "@phosphor-icons/react";
import {cn} from "@/lib/utils.ts";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export const Modal = ({open, onClose, title, children, className}: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const {t} = useTranslation();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      /* Names the dialog off its own heading, so it is announced as more than "dialog". */
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "m-auto w-full max-w-lg rounded-[var(--radius-md)] border-0 bg-surface p-0 text-text",
        "backdrop:bg-black/70 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h3 id={titleId} className="text-xl text-text">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto cursor-pointer text-neutral-400 transition-colors hover:text-text"
            aria-label={t("a11y:close")}
          >
            <X size={20}/>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
};
