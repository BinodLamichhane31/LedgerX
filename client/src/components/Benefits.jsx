import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, Zap, BarChart3, Users, BellRing } from 'lucide-react';

const benefits = [
  { title: "Localized for Nepal", description: "Built specifically for local tax laws and business practices.", icon: <ShieldCheck size={24} /> },
  { title: "Cross-Platform", description: "Seamlessly sync data between your mobile, tablet, and web dashboard.", icon: <Smartphone size={24} /> },
  { title: "Precision Accounting", description: "Eliminate errors with automated calculations and verifying tools.", icon: <Zap size={24} /> },
  { title: "Clean Interface", description: "Zero learning curve. Designed for speed and simplicity.", icon: <BarChart3 size={24} /> },
  { title: "Strategic Insights", description: "Turn raw data into actionable growth strategies.", icon: <Users size={24} /> },
  { title: "Smart Automation", description: "Automated reminders for credits, bills, and inventory.", icon: <BellRing size={24} /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Benefits = () => (
  <section id="benefits" className="px-4 py-20 bg-slate-50 sm:px-8 md:px-16 overflow-hidden">
    <div className="max-w-screen-xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl font-heading">
          Built for <span className="text-indigo-600">Business Excellence</span>
        </h2>
        <p className="max-w-2xl mx-auto mt-6 text-lg leading-relaxed text-slate-600">
          Everything you need to run your business smoothly, packed into one powerful platform.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="visible"
        animate="visible"
      >
        {benefits.map((benefit, i) => (
          <motion.div
            key={i}
            className="group p-8 transition-all duration-300 border bg-white border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 mb-6 text-indigo-600 rounded-xl bg-indigo-50 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              {benefit.icon}
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">{benefit.title}</h3>
            <p className="leading-relaxed text-slate-600">{benefit.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Benefits;