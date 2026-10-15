'use client';
import React from 'react';
import { UserRole } from '../../types';
import { Sparkles, Briefcase } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

/**
 * RoleSelector Component
 * Allows users to choose whether they are registering as a Creator or a Brand.
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        I want to join as a
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Creator Role Button */}
        <button
          type="button"
          onClick={() => onSelectRole('creator')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-300 ${
            selectedRole === 'creator'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/20 scale-[1.02]'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Creator
        </button>

        {/* Brand Role Button */}
        <button
          type="button"
          onClick={() => onSelectRole('brand')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-300 ${
            selectedRole === 'brand'
              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20 scale-[1.02]'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4 text-purple-400" />
          Brand
        </button>
      </div>
    </div>
  );
};