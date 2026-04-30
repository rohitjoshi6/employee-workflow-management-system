export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="state-block">
      <div className="spinner-border spinner-border-sm text-primary" role="status" />
      <span>{label}</span>
    </div>
  );
}
