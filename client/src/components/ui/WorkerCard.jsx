import React from 'react';
import { Star, MapPin, CheckCircle, XCircle, Phone } from 'lucide-react';

export default function WorkerCard({ worker, onHireClick }) {
  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const val = rating || 5;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${
            i <= val 
              ? 'fill-amber-400 text-amber-400' 
              : 'text-slate-300 dark:text-slate-600'
          }`} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="card-vanguard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
      <div className="flex gap-4 items-center">
        {/* Worker Avatar with Availability Dot */}
        <div className="relative flex-shrink-0">
          <img 
            src={worker.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${worker.name || 'worker'}`} 
            alt={worker.name} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-border dark:border-slate-700 bg-slate-100"
          />
          <span 
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface dark:border-slate-800 ${
              worker.isAvailable ? 'bg-success' : 'bg-danger'
            }`} 
            title={worker.isAvailable ? 'Available' : 'Unavailable'}
          />
        </div>

        {/* Worker Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-text dark:text-white truncate">
              {worker.name}
            </h4>
            <span className="text-xs text-text-muted flex items-center font-bold">
              {worker.isAvailable ? (
                <span className="text-success flex items-center gap-0.5">
                  <CheckCircle className="w-3.5 h-3.5 inline" /> Available
                </span>
              ) : (
                <span className="text-danger flex items-center gap-0.5">
                  <XCircle className="w-3.5 h-3.5 inline" /> Busy
                </span>
              )}
            </span>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mt-1 text-xs">
            <div className="flex">{renderStars(worker.rating)}</div>
            <span className="text-text-muted font-semibold ml-1">
              ({worker.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Skills chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(worker.skills || []).map((skill) => (
              <span 
                key={skill} 
                className="bg-accent-soft text-accent dark:bg-slate-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-text-muted">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span className="truncate">{worker.village || 'Ramanagara'}</span>
            <span className="font-bold text-text dark:text-white ml-2">
              ₹{worker.dailyRate || 400}/day
            </span>
          </div>
        </div>
      </div>

      {/* Hire Action Button */}
      <div className="w-full sm:w-auto">
        <button
          onClick={() => onHireClick && onHireClick(worker)}
          className="w-full sm:w-auto min-h-[52px] px-6 bg-accent hover:bg-opacity-95 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
        >
          <Phone className="w-4 h-4" />
          Hire Worker
        </button>
      </div>
    </div>
  );
}
