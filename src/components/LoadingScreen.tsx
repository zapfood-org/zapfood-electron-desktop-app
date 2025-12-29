import { Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import zapFoodLogoIcon from "../assets/images/zappy-text.png";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.img
          src={zapFoodLogoIcon}
          alt="ZappyFood Logo"
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-[256px] h-auto"
        />

        <Spinner size="lg" color="primary" label="Carregando..." />
      </motion.div>
    </div>
  );
}
