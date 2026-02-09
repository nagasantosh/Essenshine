export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[28px] border border-[hsl(var(--border))]",
        "bg-[hsl(var(--surface))]",
        "shadow-[0_22px_70px_rgba(17,24,39,0.10)]",
        "transition hover:shadow-[0_28px_90px_rgba(17,24,39,0.14)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={["p-7", className].join(" ")}>{children}</div>;
}