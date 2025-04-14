import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import Logo from '../assets/logoWhite.png';
import { Instagram, Youtube, Linkedin, Menu, ChevronRight } from 'lucide-react';
import NavBar from '../components/LandingNavbar';
import Footer from '../components/LandingFooter';

const StorySection = () => {
  return (
    <section className="min-h-screen pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500">Doubtroom</span> Exists
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -left-4 top-0 text-4xl text-teal-400/20">"</div>
            <p className="text-xl text-white/80 italic pl-4 border-l-2 border-teal-400/30">
              I always had questions. I just never had the courage to ask them.
            </p>
            <p className="text-right text-white/60 mt-2">— SOMEONE</p>
            <div className="absolute -right-4 bottom-0 text-4xl text-teal-400/20">"</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 text-white/80"
          >
            <p>
              There was a student in our class. Always quiet, always listening.
              He wasn't lazy. He wasn't disinterested.
              In fact, he probably cared more than most.
            </p>
            <p>
              But every time the teacher paused for questions, his hand never went up.
              Not because he didn't have any.
              But because he was scared. Shy. Worried someone might laugh, or call his question "dumb."
            </p>
            <p>
              He struggled silently. Fell behind.
              Not because he lacked curiosity—but because he lacked a safe space to speak.
            </p>
            <p>
              That student? He wasn't alone.
              There are millions like him in classrooms across the world.
              Bright minds with real doubts, silenced by fear of judgment.
            </p>
            <p className="text-teal-400 font-medium">
              That's the story that inspired us to build Doubtroom.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const VisionSection = () => {
  return (
    <section className="py-20 px-4 sm:px-8 bg-gradient-to-b from-transparent to-[#0a192f]/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500">Vision</span>
          </h2>

          <div className="space-y-6 text-white/80">
            <p>
              To empower students who are falling behind not because they don't care—
              but because they're introverts.
              Because they're shy. Because they're afraid to speak up.
            </p>
            <p>
              And we believe that shouldn't stop anyone from learning.
              At Doubtroom, we're building a space where your curiosity doesn't 
              embarrass you
              Where you don't need to raise your hand to raise your voice.
            </p>
            <p className="text-teal-400 font-medium">
              Because being an introvert is not a flaw.
              It's time the education system stopped treating it like one.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const DifferenceSection = () => {
  return (
    <section className="py-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            What Makes <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500">Doubtroom</span> Different?
          </h2>

          <div className="space-y-6 text-white/80">
            <p>
              You might ask—
              "Why not just use an online doubt-solving app or ask ChatGPT?"
              Here's what makes Doubtroom truly unique:
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-teal-400">You're Anonymous — But Your Helpers Are Not</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>On Doubtroom, you ask your doubt anonymously.</li>
                <li>But your doubt is only visible to your own classmates and professors.</li>
                <li>That means the answers you get are relevant to your class, your subject, your syllabus—not generic responses from strangers or bots.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-center">Not a public forum</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-center">Not answered by random people</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-center">Not a machine-generated guess</p>
              </motion.div>
            </div>

            <p className="text-teal-400 font-medium text-center mt-8">
              Answered by your people—those who are learning and teaching alongside you.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FinalSection = () => {
  return (
    <section className="py-20 px-4 sm:px-8 bg-gradient-to-b from-transparent to-[#0a192f]/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8 text-center"
        >
          <p className="text-xl text-white/80">
            Because Asking Shouldn't Be Scary
          </p>
          <p className="text-white/80">
            We're not here to replace teachers.
            We're here to help students connect with them more easily—and safely.
            We're not here to tell you every answer.
            We're here to make sure you never feel ashamed to ask the question.
          </p>
          <p className="text-2xl text-teal-400 font-medium">
            Doubtroom is for the quiet ones. The thinkers. The late-night wonderers. The silent strugglers.
          </p>
          <p className="text-xl text-white/80">
            You're not alone.
            You've just been unheard—until now.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8"
          >
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl font-medium font-space hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200">
              Start Your Journey
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};


const LearnMorePage = () => {
  return (
    <div className="min-h-screen bg-[#0a192f] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <NavBar />
      <StorySection />
      <VisionSection />
      <DifferenceSection />
      <FinalSection />
      <Footer />
    </div>
  );
};

export default LearnMorePage; 