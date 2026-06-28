import React from 'react';

export default function Emergency() {
  return (
    <div className="card-vanguard p-6 text-center space-y-3 bg-red-950/20 border-red-900">
      <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Emergency Alert Center</h2>
      <p className="text-sm text-text-muted">Trigger immediate alert broadcasts to all village members.</p>
      <div className="h-96 bg-red-950/40 rounded-xl flex items-center justify-center border border-red-900">
        <span className="text-xs text-red-200 font-bold">Emergency Grid Alert Trigger Placeholder</span>
      </div>
    </div>
  );
}
