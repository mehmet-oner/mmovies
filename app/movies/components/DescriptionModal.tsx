import { useEffect, useRef } from "react";

interface DescriptionModalProps {
  title: string;
  description: string;
  onClose: () => void;
}

const DescriptionModal = ({
  title,
  description,
  onClose,
}: DescriptionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close when clicking on the background
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      aria-labelledby="desc-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-2xl bg-background border border-foreground/15 shadow-lg">
        <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
          <h2
            id="desc-modal-title"
            className="text-lg font-semibold tracking-tight"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-foreground/70 hover:bg-foreground/5"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto text-sm text-foreground/80 whitespace-pre-line">
          {description}
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal;
