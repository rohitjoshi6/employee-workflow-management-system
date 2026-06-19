import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <section className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </section>
  );
}

