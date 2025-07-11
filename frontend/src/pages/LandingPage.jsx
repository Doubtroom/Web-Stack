import React, { useState, useEffect } from "react";
import {
  Search,
  Instagram,
  Youtube,
  Linkedin,
  Menu,
  ChevronRight,
  User,
  MessageSquare,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import Logo from "../assets/logoWhite.png";
import { motion } from "framer-motion";
import NavBar from "../components/LandingNavbar";
import Footer from "../components/LandingFooter";
import Art2 from "../assets/art2.png";

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-teal-400/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-white/70 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <User size={24} className="text-teal-400" />,
      title: "100% Anonymous",
      description:
        "Ask questions without revealing your identity. Your privacy is our top priority.",
    },
    {
      icon: <MessageSquare size={24} className="text-teal-400" />,
      title: "Easy Question Posting",
      description:
        "Post your questions in seconds. No complicated forms or lengthy processes.",
    },
    {
      icon: <CheckCircle size={24} className="text-teal-400" />,
      title: "Verified Faculty Answers",
      description:
        "Get answers from verified faculty members. Look for the special faculty badge.",
    },
    {
      icon: <MessageCircle size={24} className="text-teal-400" />,
      title: "Rich Discussions",
      description:
        "Engage in meaningful discussions through comments and follow-up questions.",
    },
  ];

  return (
    <section className="w-full py-20 bg-gradient-to-b from-transparent to-[#0a192f]/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500">
              Doubtroom
            </span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Experience a modern way of learning where every question matters and
            every answer counts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const HeroSection = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-12">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 py-8">
          <motion.div
            className="flex-1 text-center lg:text-left order-2 lg:order-1 mt-4 lg:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-space leading-tight">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500">
                  Doubtroom
                </span>
              </h1>

              {/* mobile buttons section  */}
              <motion.div
                className="flex lg:hidden gap-4 justify-center pt-4 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link to="/signup">
                  <motion.button
                    className="px-2 py-4 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl font-medium font-space hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-base">Start Your Journey</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    className="px-4 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium font-space hover:bg-white/20 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-base">Learn More</span>
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative flex flex-col gap-1 py-4"
              >
                <div className="absolute -left-4 top-0 text-4xl text-teal-400/20 ">
                  "
                </div>
                <p className="text-xl text-white/80 italic pl-4 border-l-2 border-teal-400/30">
                  The only bad question is the one never asked.
                </p>
                <p className="text-right text-white/60 mt-2">
                  — Albert Einstein
                </p>
                <div className="absolute -right-4 bottom-0 text-4xl text-teal-400/20">
                  "
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <p className="text-lg text-white/80">
                  We believe every doubt deserves an answer—no matter how small
                  or "silly" it may seem. That's why Doubtroom lets you ask your
                  questions anonymously, free from hesitation or embarrassment.
                </p>
                <div className="space-y-2">
                  <p className="text-lg text-white/90 font-medium">
                    You're not shouting into the void.
                  </p>
                  <p className="text-lg text-white/80">
                    You're asking your own classmates and professors—people who
                    truly understand your context, syllabus, and pace.
                  </p>
                </div>

                <motion.div
                  className="hidden lg:flex gap-4 justify-start pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Link to="/signup">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl font-medium font-space hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-base">Start Your Journey</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link to="/about">
                    <motion.button
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium font-space hover:bg-white/20 transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-base">Learn More</span>
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 relative flex flex-col items-center order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <div className="flex flex-col items-center gap-0">
              <motion.h2
                className="text-xl sm:text-2xl md:text-3xl font-bold text-center max-w-[280px] sm:max-w-md md:max-w-2xl relative px-4 pb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="absolute -left-4 top-0 text-3xl sm:text-4xl text-teal-400/20">
                  "
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
                  Ask Freely. Learn Boldly. Anonymously
                </span>
                <div className="absolute -right-4 bottom-0 text-3xl sm:text-4xl text-teal-400/20">
                  "
                </div>
              </motion.h2>
              <div className="relative w-full max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto -mt-1">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-3xl blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <motion.img
                  src={Art2}
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                  alt="Doubtroom Illustration"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const DoubtRoomPage = () => {
  return (
    <div className="min-h-screen bg-[#0a192f] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default DoubtRoomPage;
