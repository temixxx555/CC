import { AnimatePresence, motion } from "framer-motion";
const AnimationWrapper = ({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 1 },
  keyValue,
  className,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={initial}
        animate={animate}
        transition={transition}
        key={keyValue}
        className={className}
      >
        {children}
        {/* children should be lower case */}
      </motion.div>
    </AnimatePresence>
  );
};
export default AnimationWrapper;
