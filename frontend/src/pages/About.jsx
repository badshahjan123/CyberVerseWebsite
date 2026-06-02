import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Target, Trophy, Users, Shield, Zap, Server, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const About = () => {
  return (
    <div className="min-h-screen bg-[#050b14] font-sans text-slate-300 pb-20 selection:bg-cyan-400/30">
      
      {/* ── HERO ── */}
      <div className="relative pt-32 pb-24 overflow-hidden border-b border-white/5 bg-black/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00d1ff]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={STAGGER} className="space-y-6">
            <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-400 text-xs font-mono tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Our Mission
            </motion.div>
            
            <motion.h1 variants={FADE_UP} className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Bridging the gap between <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">theory and practice.</span>
            </motion.h1>
            
            <motion.p variants={FADE_UP} className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              CyberVerse is an interactive training platform designed to make complex digital technology accessible. We replace passive lectures with hands-on, browser-based environments.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── THE STORY ── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP}
          className="flex flex-col md:flex-row gap-16 items-start"
        >
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Our Origin</h2>
            <div className="h-1 w-12 bg-[#00d1ff] rounded-full" />
          </div>
          
          <div className="md:w-2/3 space-y-6 text-slate-300 text-lg leading-relaxed">
            <p>
              CyberVerse began as a Final Year Project at SZABIST. As students and developers, we recognized a recurring flaw in traditional tech education: it was overwhelmingly passive. Reading documentation and watching video tutorials rarely translates to real-world capability.
            </p>
            <p>
              We wanted to build the platform we wished we had—a place where learning feels active and engaging. A platform where you don't just read about deploying a server or securing a network; you actually do it in a safe, isolated sandbox.
            </p>
            <p>
              Today, CyberVerse combines robust cloud infrastructure with gamified progression systems to ensure that learners remain motivated while acquiring practical, industry-ready skills.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── CORE PILLARS ── */}
      <div className="border-y border-white/5 bg-[#0b121e]/50 py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">How We Teach</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our methodology is built on three core pillars designed to maximize retention and practical skill development.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Terminal size={24} />,
                title: "Hands-On First",
                desc: "No local setup required. We provision dedicated, browser-based environments for you to practice commands, write code, and configure systems in real-time."
              },
              {
                icon: <Trophy size={24} />,
                title: "Gamified Progression",
                desc: "Learning shouldn't be a chore. Earn XP, maintain daily streaks, and climb the global leaderboard as you complete tasks and interactive rooms."
              },
              {
                icon: <Shield size={24} />,
                title: "Verifiable Skills",
                desc: "Transition from learner to professional. Completing dedicated pathways earns you cryptographically verifiable certificates to showcase on your resume."
              }
            ].map((pillar, idx) => (
              <motion.div key={idx} variants={FADE_UP} className="bg-black/40 border border-white/5 p-8 rounded-2xl hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#00d1ff]/10 flex items-center justify-center text-cyan-400 mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── METRICS ── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: "Interactive Rooms", val: "50+" },
            { label: "Active Learners", val: "10k+" },
            { label: "Live Sandboxes", val: "20+" },
            { label: "Uptime", val: "99.9%" }
          ].map((stat, i) => (
            <motion.div key={i} variants={FADE_UP} className="text-center p-6 rounded-2xl border border-white/[0.03] bg-white/[0.01]">
              <div className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{stat.val}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── CTA ── */}
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
        className="max-w-3xl mx-auto px-6 py-12 text-center"
      >
        <div className="p-12 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Ready to start learning?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join thousands of learners on CyberVerse and take your tech skills to the next level today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors">
              Create Free Account
            </Link>
            <Link to="/rooms" className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              Explore Rooms <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default About;
