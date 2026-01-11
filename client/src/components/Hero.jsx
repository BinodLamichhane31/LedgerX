import React, { useState, useCallback } from 'react'; 
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react'; 
import heroImage from '../assets/hero_candid.png';
import Modal from './Modal'; 
import RegisterForm from './RegisterForm'; 

const Hero = () => {
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const openRegister = useCallback(() => setRegisterOpen(true), []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, 
        ease: "easeOut"
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <> 
      <section id="home" className="relative w-full overflow-hidden bg-[#eef2ff] px-4 sm:px-8 md:px-16">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 hidden w-1/2 h-full bg-gradient-to-l from-indigo-100/50 to-transparent lg:block" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-300 rounded-full blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-48 left-12 w-72 h-72 bg-primary-300 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="relative max-w-screen-xl py-24 mx-auto lg:py-32">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="z-10"
            >
              {/* Badge */}
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold transition-all border rounded-full shadow-sm text-primary-900 bg-white/60 backdrop-blur-sm border-primary-200/50 hover:bg-white/80"
              >
                <Sparkles className="w-4 h-4 text-secondary-600" />
                <span>Next-Gen Ledger System</span>
              </motion.div>

              {/* Heading */}
              <motion.h1 
                variants={itemVariants}
                className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl font-heading"
              >
                Financial Intelligence for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-600 to-indigo-600">
                  Modern Business.
                </span>
              </motion.h1>
              
              {/* Paragraph */}
              <motion.p 
                variants={itemVariants}
                className="mt-8 text-lg leading-relaxed text-slate-600 md:text-xl max-w-xl"
              >
                <span className="font-semibold text-slate-800">Ledger X</span> provides the clarity and control you need to scale. Experience intelligent tracking, real-time insights, and seamless inventory management in one premium platform.
              </motion.p>
              
              {/* Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap gap-4 mt-10"
              >
                <a 
                  href="#" 
                  onClick={openRegister}
                  className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all transform bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 hover:shadow-primary-500/25 focus:ring-4 focus:ring-primary-500/20"
                >
                  Start Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
                <a 
                  href="#features" 
                  className="px-8 py-4 font-bold transition-all transform bg-white border border-slate-200 rounded-full shadow-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:scale-105"
                >
                  Explore Features
                </a>
              </motion.div>
             
             {/* Simple Stats */}
             <motion.div variants={itemVariants} className="flex gap-8 mt-12 pt-8 border-t border-slate-200/60">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900">10k+</span>
                  <span className="text-sm font-medium text-slate-500">Active Users</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900">99.9%</span>
                  <span className="text-sm font-medium text-slate-500">Uptime</span>
                </div>
             </motion.div>

            </motion.div>

            {/* Image */}
            <motion.div
              className="relative w-full max-w-lg mx-auto md:max-w-full"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-secondary-400 rounded-3xl blur-[80px] opacity-30 -z-10" />
              <div className="relative overflow-hidden shadow-2xl rounded-3xl">
                 <img src={heroImage} alt="Business Owner using LedgerX" className="object-cover w-full h-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Modal isOpen={isRegisterOpen} onClose={closeRegister}>
        <RegisterForm />
      </Modal>
    </>
  );
};

export default Hero;