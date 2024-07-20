import React from 'react';
import { motion } from 'framer-motion';
import PaintStreakImage from '../images/paint-streak.png';

const PaintStreak = () => {
    return (
        <motion.div
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, type: 'spring', stiffness: 50 }}
        >
            <img src={PaintStreakImage} alt="Paint Streak" className="paint-streak" />
        </motion.div>
    );
};

export default PaintStreak;
