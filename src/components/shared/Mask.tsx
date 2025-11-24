import { type ReactNode } from "react";

export const Mask = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => {
  return (
    <div className="fixed left-0 top-0 z-10 min-w-screen min-h-screen" onClick={onClose}>
      <div className="min-w-screen min-h-screen bg-base-100 opacity-30" />
      {children}
    </div>
  );
};
