'use client';
import React from 'react';
import { UserRole } from '../../types';

interface AuthFormFieldsProps {
  isLogin: boolean;
  role: UserRole;
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  contactDetails: string;
  setContactDetails: (val: string) => void;
  brandMotive: string;
  setBrandMotive: (val: string) => void;
  marketValue: string;
  setMarketValue: (val: string) => void;
}

/**
 * AuthFormFields Component
 * Renders standard and conditional input fields based on authentication mode and user role.
 */
export const AuthFormFields: React.FC<AuthFormFieldsProps> = ({
  isLogin,
  role,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  contactDetails,
  setContactDetails,
  brandMotive,
  setBrandMotive,
  marketValue,
  setMarketValue,
}) => {
  return (
    <div className="space-y-4">
      {/* Name Field (Appears on Signup) */}
      {!isLogin && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {role === 'brand' ? 'Brand Name' : 'Creator Username / Name'}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            placeholder={role === 'brand' ? 'e.g. Acme Corp' : 'e.g. Alex MemeLord'}
          />
        </div>
      )}

      {/* Creator Specific Field: Contact Details */}
      {!isLogin && role === 'creator' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Contact Details
          </label>
          <input
            type="text"
            required
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            placeholder="Phone / Telegram / WhatsApp handle"
          />
        </div>
      )}

      {/* Brand Specific Fields: Motive & Market Value */}
      {!isLogin && role === 'brand' && (
        <>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Brand Motive / Tagline
            </label>
            <input
              type="text"
              required
              value={brandMotive}
              onChange={(e) => setBrandMotive(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              placeholder="e.g. Gen-Z viral meme marketing"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Market Value / Funding Tier
            </label>
            <input
              type="text"
              required
              value={marketValue}
              onChange={(e) => setMarketValue(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              placeholder="e.g. $10M - $50M"
            />
          </div>
        </>
      )}

      {/* Email Field (Always Required) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          placeholder="you@domain.com"
        />
      </div>

      {/* Password Field (Always Required) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          placeholder="••••••••"
        />
      </div>
    </div>
  );
};