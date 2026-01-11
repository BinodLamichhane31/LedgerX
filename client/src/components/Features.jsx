import React from 'react';
import FeatureCard from './FeatureCard';
import { motion } from 'framer-motion';
import {
  HiOutlineTrendingUp, HiOutlineShoppingBag, HiOutlineUsers,
  HiOutlineChartBar, HiOutlineBell,
} from 'react-icons/hi';
import { MdOutlineSmartToy } from 'react-icons/md';


const featureList = [
  { title: "Precision Logging", description: "Record every transaction with absolute accuracy and ease.", icon: <HiOutlineTrendingUp size={32}/> },
  { title: "Inventory Intelligence", description: "Real-time stock management across all your locations.", icon: <HiOutlineShoppingBag size={32} /> },
  { title: "Customer Profiles", description: "Deep dive into customer behavior and preferences.", icon: <HiOutlineUsers size={32} /> },
  { title: "Executive Reports", description: "Visual analytics that drive smarter business decisions.", icon: <HiOutlineChartBar size={32} /> },
  { title: "Smart Alerts", description: "Automated notifications for payments and inventory levels.", icon: <HiOutlineBell size={32} /> },
  { title: "Ledger AI", description: "Your 24/7 intelligent financial assistant.", icon: <MdOutlineSmartToy size={32} /> },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // COOL DESIGN: Staggered animation for cards
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  viewport: { once: true, margin: "-100px" }
};

const Features = () => (
  <section id="features" className="relative px-8 py-24 overflow-hidden bg-white sm:px-16 lg:px-20">
    {/* Background Decorations */}
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white -z-10" />

    <div className="max-w-screen-xl mx-auto text-center">
      <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl font-heading">
        Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Growth</span>
      </h2>
      <p className="max-w-2xl mx-auto mt-6 text-lg text-slate-600">
        From granular transaction data to high-level strategic insights, Ledger X provides the toolkit you need to dominate your market.
      </p>
    </div>
    <motion.div
      className="grid max-w-screen-xl grid-cols-1 gap-8 mx-auto mt-16 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {featureList.map((feature, i) => (
        <motion.div key={i} variants={itemVariants}>
          <FeatureCard {...feature} />
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default Features;