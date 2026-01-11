import React from 'react';
import Typewriter from 'typewriter-effect';
import { RocketIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const HighlightBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex items-center justify-center gap-3 px-6 py-4 text-white bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500"
    >
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <RocketIcon className="w-6 h-6 text-white" />
      </motion.div>

      <div className="text-lg font-semibold tracking-wide md:text-xl">
        <Typewriter
          options={{
            strings: [
              'Manage smarter.',
              'Save better.',
              'Grow faster.',
              'Welcome to Ledger X!'
            ],
            autoStart: true,
            loop: true,
            delay: 40,
            deleteSpeed: 20,
            pauseFor: 1800
          }}
        />
      </div>
    </motion.div>
  );
};

export default HighlightBanner;
