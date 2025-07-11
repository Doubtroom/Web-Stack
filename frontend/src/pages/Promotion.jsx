import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Brain,
  Zap,
  Repeat,
  Star,
  BookOpen,
  Users,
  Smile,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Brain className="w-8 h-8 text-blue-600 dark:text-blue-300" />,
    title: "Active Recall",
    desc: "Boost memory retention by practicing active retrieval, proven by cognitive science.",
  },
  {
    icon: <Repeat className="w-8 h-8 text-purple-600 dark:text-purple-300" />,
    title: "Spaced Repetition",
    desc: "Review cards at optimal intervals to move knowledge into long-term memory.",
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-500 dark:text-yellow-300" />,
    title: "Quick & Interactive",
    desc: "Flip, rate, and review cards in a beautiful, gamified interface.",
  },
  {
    icon: <Star className="w-8 h-8 text-pink-500 dark:text-pink-300" />,
    title: "Personalized Progress",
    desc: "Track your mastery and focus on what matters most to you.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-green-600 dark:text-green-300" />,
    title: "Science-Backed Learning",
    desc: "Built on research in educational psychology for real results.",
  },
];

const heroImg = "https://doubtroom.sirv.com/Doubtroom/Flash%20Cards.png";
const journeyImg =
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80";
const forgettingCurveImg =
  "https://www.growthengineering.co.uk/wp-content/uploads/2016/09/combating-the-forgetting-curve.png";

const Promotion = () => {
  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center py-10 px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl w-full text-center mb-10"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 dark:text-blue-200 mb-4 drop-shadow-lg">
          Unlock Your Brain's Potential with{" "}
          <span className="text-purple-600 dark:text-purple-400">
            FlashCards
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-6">
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            Active recall
          </span>{" "}
          and{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-300">
            spaced repetition
          </span>{" "}
          are the secret weapons of top learners. Our FlashCards are designed
          for{" "}
          <span className="font-semibold text-green-600 dark:text-green-300">
            deep retention
          </span>{" "}
          and{" "}
          <span className="font-semibold text-pink-600 dark:text-pink-300">
            long-term mastery
          </span>
          —all backed by science.
        </p>
        <motion.img
          src={heroImg}
          alt="Flashcards psychology"
          className="mx-auto rounded-2xl shadow-2xl w-full max-w-lg mb-8 object-cover"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
        />
      </motion.div>

      {/* Psychological Context Section */}
      <motion.div
        className="max-w-4xl w-full text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
          Why FlashCards Work
        </h2>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6">
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            The Testing Effect
          </span>{" "}
          shows that recalling information strengthens memory far more than
          passive review. <br />
          <span className="font-semibold text-purple-600 dark:text-purple-300">
            Spaced repetition
          </span>{" "}
          leverages your brain's natural forgetting curve, helping you remember
          more with less effort.
        </p>
        <motion.img
          src={forgettingCurveImg}
          alt="Memory science"
          className="mx-auto rounded-xl shadow-xl w-full max-w-md mb-4 object-cover"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
        />
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base mt-4">
          "The testing effect and spaced repetition are two of the most powerful
          tools in cognitive psychology for long-term learning." <br />
          <span className="italic">
            — Dr. Henry Roediger, Memory Researcher
          </span>
        </p>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="bg-white/80 dark:bg-gray-900/70 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center backdrop-blur-md border border-blue-100 dark:border-blue-800 hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            {f.icon}
            <h3 className="text-xl font-bold mt-4 mb-2 text-blue-900 dark:text-blue-200">
              {f.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-base">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Learning Journey Section */}
      <motion.div
        className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-8 mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <motion.img
          src={journeyImg}
          alt="Learning journey"
          className="rounded-xl shadow-xl w-full max-w-md object-cover"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            Your Learning Journey
          </h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Start with a question. Flip the card. Rate your confidence. <br />
            Our system schedules your next review for maximum retention. <br />
            Watch your knowledge grow, one card at a time!
          </p>
          <div className="flex items-center gap-3 justify-center md:justify-start mt-4">
            <Users className="w-7 h-7 text-blue-500 dark:text-blue-300" />
            <span className="text-blue-700 dark:text-blue-200 font-semibold">
              Join thousands of learners mastering their memory!
            </span>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="flex flex-col items-center gap-6"
      >
        <Link to="/flashcards">
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Try FlashCards Now
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Promotion;
