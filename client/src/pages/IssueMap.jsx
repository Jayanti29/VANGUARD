import React from 'react';

export default function IssueMap() {
  return (
    <div className="card-vanguard p-6 text-center space-y-3">
      <h2 className="text-xl font-bold text-text dark:text-white">Community Incident Map</h2>
      <p className="text-sm text-text-muted">Live map visualizing open local issues and municipal offices.</p>
      <div className="h-96 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center border border-border dark:border-slate-600">
        <span className="text-xs text-text-muted font-bold">Interactive Google Map Placeholder</span>
      </div>
    </div>
  );
}
