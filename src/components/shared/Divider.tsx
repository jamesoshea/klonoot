export const Divider = ({ className }: { className?: string }) => (
  <div className={`divider m-0${className ? ` ${className}` : ""}`} />
);
