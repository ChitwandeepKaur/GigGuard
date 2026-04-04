import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-8 bg-app-bg min-h-screen">
      <h2 className="text-3xl font-display text-brand">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-app-card p-6 rounded-card border border-app-border shadow-sm">
          <h3 className="text-sm font-mono text-app-muted uppercase tracking-wider">Safe to Spend</h3>
          <p className="text-2xl font-bold mt-2">$245.50</p>
        </div>
      </div>
    </div>
  );
}
