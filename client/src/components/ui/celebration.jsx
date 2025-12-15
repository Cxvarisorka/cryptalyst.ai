import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Sparkles, Crown, Medal, Award } from 'lucide-react';

// Confetti particle component
const ConfettiParticle = ({ index, color }) => {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 0.5;
  const randomDuration = 2 + Math.random() * 2;
  const randomRotation = Math.random() * 720 - 360;
  const size = 8 + Math.random() * 8;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${randomX}%`,
        top: '-20px',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: window.innerHeight + 100,
        opacity: [1, 1, 0],
        rotate: randomRotation,
        x: (Math.random() - 0.5) * 200,
        scale: [1, 1.2, 0.8],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeOut',
      }}
    />
  );
};

// Confetti burst effect
export const Confetti = ({ isActive, duration = 3000 }) => {
  const [particles, setParticles] = useState([]);
  const colors = [
    '#22C55E', // Green
    '#10B981', // Emerald
    '#14B8A6', // Teal
    '#FFD700', // Gold
    '#06B6D4', // Cyan
    '#FBBF24', // Amber
    '#6EE7B7', // Light Green
    '#34D399', // Medium Emerald
    '#5EEAD4', // Light Teal
    '#A7F3D0', // Pale Green
  ];

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (!isActive && particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} index={particle.id} color={particle.color} />
      ))}
    </div>,
    document.body
  );
};

// XP Gain popup animation
export const XPGainPopup = ({ xp, show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9998] pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-2xl">
            <Zap className="h-8 w-8 text-white animate-pulse" />
            <span className="text-3xl font-bold text-white">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Level Up celebration
export const LevelUpCelebration = ({ show, level, title, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti isActive={true} duration={4000} />
          <motion.div
            className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="relative p-8 rounded-3xl bg-gradient-to-br from-green-600 via-emerald-500 to-teal-400 shadow-2xl max-w-md mx-4"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: 'spring', damping: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-6 -right-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Star className="h-16 w-16 text-yellow-300 fill-yellow-300" />
                </motion.div>
              </div>

              <div className="text-center text-white">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Crown className="h-20 w-20 mx-auto mb-4 text-yellow-300" />
                </motion.div>

                <motion.h2
                  className="text-4xl font-bold mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  LEVEL UP!
                </motion.h2>

                <motion.div
                  className="text-6xl font-black mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  {level}
                </motion.div>

                <motion.p
                  className="text-xl font-semibold text-yellow-100"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {title}
                </motion.p>

                <motion.button
                  className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                >
                  Awesome!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Course Complete celebration
export const CourseCompleteCelebration = ({ show, courseName, xpEarned, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti isActive={true} duration={6000} />
          <motion.div
            className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="relative p-10 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 shadow-2xl max-w-lg mx-4 overflow-hidden"
              initial={{ scale: 0, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -100 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated background circles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    style={{
                      width: 100 + i * 50,
                      height: 100 + i * 50,
                      left: `${20 + i * 15}%`,
                      top: `${10 + i * 10}%`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              <div className="relative text-center text-white">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                >
                  <div className="relative inline-block">
                    <Trophy className="h-24 w-24 mx-auto mb-4 text-yellow-300" />
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Sparkles className="h-8 w-8 text-yellow-200" />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.h2
                  className="text-3xl font-bold mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  CONGRATULATIONS!
                </motion.h2>

                <motion.p
                  className="text-xl mb-6 text-white/90"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  You've completed
                </motion.p>

                <motion.div
                  className="px-6 py-4 bg-white/20 rounded-2xl mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <h3 className="text-2xl font-bold">{courseName}</h3>
                </motion.div>

                <motion.div
                  className="flex items-center justify-center gap-3 mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 px-6 py-3 bg-yellow-500/30 rounded-xl">
                    <Zap className="h-6 w-6 text-yellow-300" />
                    <span className="text-2xl font-bold">+{xpEarned} XP</span>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <button
                    className="w-full px-8 py-4 bg-white text-emerald-600 hover:bg-white/90 rounded-xl font-bold text-lg transition-colors"
                    onClick={onClose}
                  >
                    Continue Learning
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Achievement Unlocked popup
export const AchievementUnlocked = ({ show, achievement, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && achievement && (
        <motion.div
          className="fixed top-6 right-6 z-[9996]"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-2xl flex items-center gap-4 min-w-[300px]">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
              {achievement.icon}
            </div>
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Achievement Unlocked!</p>
              <p className="text-lg font-bold">{achievement.name}</p>
              <p className="text-sm opacity-90">+{achievement.xpReward} XP</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Award className="h-6 w-6 text-emerald-200" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Combined celebration hook for easy use
export const useCelebration = () => {
  const [confetti, setConfetti] = useState(false);
  const [xpPopup, setXpPopup] = useState({ show: false, xp: 0 });
  const [levelUp, setLevelUp] = useState({ show: false, level: 0, title: '' });
  const [courseComplete, setCourseComplete] = useState({ show: false, courseName: '', xpEarned: 0 });
  const [achievement, setAchievement] = useState({ show: false, data: null });

  const showConfetti = useCallback((duration = 3000) => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), duration);
  }, []);

  const showXPGain = useCallback((xp) => {
    setXpPopup({ show: true, xp });
  }, []);

  const showLevelUp = useCallback((level, title) => {
    setLevelUp({ show: true, level, title });
  }, []);

  const showCourseComplete = useCallback((courseName, xpEarned) => {
    setCourseComplete({ show: true, courseName, xpEarned });
  }, []);

  const showAchievement = useCallback((achievementData) => {
    setAchievement({ show: true, data: achievementData });
  }, []);

  const CelebrationComponents = useCallback(() => (
    <>
      <Confetti isActive={confetti} />
      <XPGainPopup
        xp={xpPopup.xp}
        show={xpPopup.show}
        onComplete={() => setXpPopup({ show: false, xp: 0 })}
      />
      <LevelUpCelebration
        show={levelUp.show}
        level={levelUp.level}
        title={levelUp.title}
        onClose={() => setLevelUp({ show: false, level: 0, title: '' })}
      />
      <CourseCompleteCelebration
        show={courseComplete.show}
        courseName={courseComplete.courseName}
        xpEarned={courseComplete.xpEarned}
        onClose={() => setCourseComplete({ show: false, courseName: '', xpEarned: 0 })}
      />
      <AchievementUnlocked
        show={achievement.show}
        achievement={achievement.data}
        onClose={() => setAchievement({ show: false, data: null })}
      />
    </>
  ), [confetti, xpPopup, levelUp, courseComplete, achievement]);

  return {
    showConfetti,
    showXPGain,
    showLevelUp,
    showCourseComplete,
    showAchievement,
    CelebrationComponents,
  };
};

export default Confetti;
