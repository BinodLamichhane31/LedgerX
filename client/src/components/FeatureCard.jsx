import React from 'react';

const FeatureCard = ({ title, description, icon }) => (
  <div className="relative w-full h-full p-8 text-left transition-all duration-300 border bg-slate-50 border-slate-100 rounded-2xl group hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 hover:bg-white">
    <div className="flex flex-col items-start justify-start h-full">
      <div className="flex items-center justify-center w-12 h-12 mb-6 text-indigo-600 transition-colors bg-indigo-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="leading-relaxed text-slate-600">{description}</p>
    </div>
  </div>
);

export default FeatureCard;