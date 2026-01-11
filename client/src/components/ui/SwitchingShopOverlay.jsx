import { motion, AnimatePresence } from 'framer-motion';
import { Store } from 'lucide-react';
import { useState, useEffect } from 'react';


// Backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

// The central "Core" container
const coreVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', damping: 15, stiffness: 150, delay: 0.2 },
  },
  exit: { scale: 0.5, opacity: 0, transition: { duration: 0.3 } },
};

// Staggered container for the final text reveal
const textContainerVariants = {
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

// Individual letter animation
const letterVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } },
};

// --- Sub-Components for Animation Stages ---

const SwitchingShopOverlay = ({ isVisible, shopName, onExitComplete }) => {
    const [isRevealed, setIsRevealed] = useState(false);
  
    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          setIsRevealed(true);
        }, 1500); 
        return () => clearTimeout(timer);
      } else {
        setIsRevealed(false);
      }
    }, [isVisible]);
  
    return (
      // Pass the onExitComplete prop to AnimatePresence
      <AnimatePresence onExitComplete={onExitComplete}>
        {isVisible && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/70 backdrop-blur-lg"
          >
            <motion.div
              variants={coreVariants}
              className="relative w-64 h-64 rounded-full shadow-2xl bg-gray-900/50 shadow-orange-900/20 ring-1 ring-white/10"
              style={{ perspective: 1000 }}
            >
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(249,115,22,0.2)]"></div>
              
              <AnimatePresence mode="wait">
                {!isRevealed ? <LoadingRings /> : <RevealedContent shopName={shopName} />}
              </AnimatePresence>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // Re-pasting subcomponents for completeness
  const LoadingRings = () => (
      <motion.div
        key="loading"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="transform-gpu"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <motion.circle cx="60" cy="60" r="50" stroke="rgba(249, 115, 22, 0.2)" strokeWidth="3" fill="transparent" />
          <motion.circle cx="60" cy="60" r="50" stroke="rgba(249, 115, 22, 1)" strokeWidth="3" fill="transparent" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 0.25, opacity: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
          <motion.circle cx="60" cy="60" r="35" stroke="rgba(249, 115, 22, 0.15)" strokeWidth="2" fill="transparent" />
          <motion.circle cx="60" cy="60" r="35" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="2" fill="transparent" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 0.35, opacity: 1 }} transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }} style={{ rotate: 90, transformOrigin: 'center' }} />
        </motion.svg>
      </motion.div>
    );
    
  const RevealedContent = ({ shopName }) => {
        const shopNameChars = Array.from(shopName || ' ');
        return(
            <motion.div
                key="revealed"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full h-full"
                variants={textContainerVariants}
            >
                <motion.div className="p-4 bg-orange-100 rounded-full" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}>
                    <Store className="w-10 h-10 text-orange-600" />
                </motion.div>
                <motion.h2 className="flex mt-4 text-3xl font-bold tracking-wide text-gray-100" variants={textContainerVariants} aria-label={shopName}>
                    {shopNameChars.map((char, index) => (
                        <motion.span key={index} variants={letterVariants} className="inline-block">
                            {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                    ))}
                </motion.h2>
          </motion.div>
        )
    };
  
  export default SwitchingShopOverlay;