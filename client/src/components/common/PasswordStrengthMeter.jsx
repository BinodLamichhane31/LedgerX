import React, { useMemo } from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

    // 1. Length Check
    if (password.length > 7) score += 1;
    if (password.length > 10) score += 1;

    // 2. Complexity Check
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasUpper && hasLower) score += 1;
    if (hasNum && hasSpecial) score += 1;

    // 3. Predictability Penalty (Basic)
    const repeats = /(.)\1{2,}/.test(password); // 3+ repeating chars
    const sequential = /(123|abc|qwerty|password)/i.test(password); // Common patterns

    if (repeats || sequential) score = Math.max(0, score - 1);

    // Normalize to 0-4
    if (score > 4) score = 4;

    switch (score) {
      case 0: return { score, label: 'Very Weak', color: 'bg-rose-500' };
      case 1: return { score, label: 'Weak', color: 'bg-orange-500' };
      case 2: return { score, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score, label: 'Good', color: 'bg-emerald-500' };
      case 4: return { score, label: 'Strong', color: 'bg-green-600' };
      default: return { score: 0, label: 'Very Weak', color: 'bg-slate-200' };
    }
  }, [password]);

  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500">Password Strength</span>
        <span className="text-xs font-bold text-slate-700">{strength.label}</span>
      </div>
      <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-full flex-1 transition-all duration-300 rounded-full ${
              index < strength.score ? strength.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Use 8+ chars with mix of UPPER, lower, numbers & symbols.
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;
