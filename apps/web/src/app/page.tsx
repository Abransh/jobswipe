'use client';

/**
 * JobSwipe Landing Page
 * Premium SaaS Landing Page with Apple-Level Aesthetics
 *
 * Design Inspiration:
 * - Apple.com (minimalism + precision)
 * - Linear.app (smooth animations)
 * - Stripe.com (clarity + trust)
 * - Vercel.com (modern + clean)
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="relative bg-white dark:bg-black overflow-hidden">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SocialProofSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

// Navigation Header - Fixed top navigation with login/signup
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-minimal'
          : 'bg-transparent'
      }`}
    >
      <div className="container-premium">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-base sm:text-lg font-bold text-white dark:text-gray-900">J</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              JobSwipe
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sign In Button - Outline */}
            <Link href="/auth/signin">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-9 sm:h-10 px-3 sm:px-5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white font-medium text-footnote sm:text-subhead transition-colors"
              >
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">Login</span>
              </motion.button>
            </Link>

            {/* Sign Up Button - Primary */}
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-9 sm:h-10 px-3 sm:px-5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-footnote sm:text-subhead shadow-card transition-colors"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Sign up</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section - The first impression
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-black dark:to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,122,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(175,82,222,0.05),transparent_50%)]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative container-premium py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <span className="text-footnote font-medium text-primary">AI-Powered Job Automation</span>
              </div>

              {/* Headline - Typography matters! */}
              <h1 className="text-[3rem] sm:text-[4rem] lg:text-[5rem] font-semibold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                Land your
                <br />
                <span className="gradient-text">dream job</span>
                <br />
                on autopilot
              </h1>

              {/* Subheadline */}
              <p className="text-headline text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Swipe through jobs like Tinder. Our AI applies for you automatically.
                Spend less time applying, more time interviewing.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signup">
                  <motion.button
                    className="group relative h-14 px-8 bg-primary text-white rounded-lg font-semibold text-callout shadow-card hover:shadow-elevated transition-all duration-quick overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Applying Free
                      <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-quick" />
                    </span>
                  </motion.button>
                </Link>

                <motion.button
                  className="h-14 px-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold text-callout hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-quick shadow-minimal"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-footnote text-gray-500 dark:text-gray-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-success" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-success" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-success" />
                  <span>2 min setup</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Animated Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <AnimatedJobCards />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-caption">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Animated Job Cards - Shows the swipe interface with premium interactions
function AnimatedJobCards() {
  const [currentCard, setCurrentCard] = useState(0);
  const [showGesture, setShowGesture] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [isDesktop, setIsDesktop] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cards = [
    { title: 'Senior Frontend Engineer', company: 'TechCorp', salary: '$120k-$180k', match: 95 },
    { title: 'Full Stack Developer', company: 'StartupCo', salary: '$100k-$150k', match: 88 },
    { title: 'React Developer', company: 'InnovateLab', salary: '$110k-$160k', match: 92 },
  ];

  // Auto-cycle cards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check if desktop for 3D tilt
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Show swipe gesture indicator once (sessionStorage)
  useEffect(() => {
    const hasSeenGesture = sessionStorage.getItem('hasSeenSwipeGesture');
    if (!hasSeenGesture) {
      const timer = setTimeout(() => {
        setShowGesture(true);
        // Hide after 3 seconds
        setTimeout(() => {
          setShowGesture(false);
          sessionStorage.setItem('hasSeenSwipeGesture', 'true');
        }, 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Apple-style 3D tilt effect (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (subtle, max 10 degrees)
    const rotateX = ((y - centerY) / centerY) * 5; // Max 5deg
    const rotateY = ((centerX - x) / centerX) * 5; // Max 5deg

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.3s ease-out',
    });
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Cards Container */}
      <div className="relative h-[600px] sm:h-[650px]">
        <AnimatePresence mode="wait">
          {cards.map((card, index) => {
            if (index !== currentCard) return null;

            return (
              <motion.div
                key={index}
                ref={cardRef}
                initial={{ scale: 0.95, opacity: 0, rotateY: -10 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 1.05, opacity: 0, x: 300 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={isDesktop ? tiltStyle : {}}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-premium border border-gray-200 dark:border-gray-800 p-6 sm:p-8 overflow-hidden cursor-pointer"
              >
                {/* Match Score */}
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white dark:bg-gray-800 shadow-card border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                  <span className="text-headline sm:text-title-3 font-semibold text-primary leading-none">{card.match}</span>
                  <span className="text-caption text-gray-500 dark:text-gray-400">match</span>
                </div>

                {/* Company Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary to-purple flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-white">{card.company.charAt(0)}</span>
                </div>

                {/* Job Info */}
                <h3 className="text-title-3 sm:text-title-2 font-semibold text-gray-900 dark:text-white mb-2 pr-16">{card.title}</h3>
                <p className="text-callout sm:text-headline text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{card.company}</p>

                {/* Salary */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-success-light dark:bg-success/20 border border-success/20 mb-6 sm:mb-8">
                  <span className="text-footnote sm:text-subhead font-semibold text-success">{card.salary}</span>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 flex gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 h-12 sm:h-14 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-subhead sm:text-callout"
                  >
                    Skip
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 h-12 sm:h-14 rounded-lg bg-primary text-white font-semibold shadow-card hover:bg-primary/90 transition-colors text-subhead sm:text-callout"
                  >
                    Apply Now
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Stack effect */}
        <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-200 dark:border-gray-800 -z-10 translate-y-4 scale-95 opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl shadow-minimal border border-gray-200 dark:border-gray-800 -z-20 translate-y-8 scale-90 opacity-30 pointer-events-none" />
      </div>

      {/* Swipe Gesture Indicator (shows once) */}
      <AnimatePresence>
        {showGesture && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          >
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-6 py-4 rounded-full shadow-premium border border-primary/30">
              <motion.div
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRightIcon className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="text-subhead font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                Swipe right to apply
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tagline below cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-callout sm:text-headline text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-2xl">👆</span>
          <span className="font-medium">Just swipe right.</span>
          <span className="text-primary font-semibold">Our AI applies for you.</span>
        </p>
      </motion.div>
    </div>
  );
}

// Problem Section
function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-950">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-title-1 font-semibold text-gray-900 dark:text-white mb-6">
            Job hunting is <span className="text-error">broken</span>
          </h2>
          <p className="text-headline text-gray-600 dark:text-gray-400">
            The average job seeker spends 100+ hours applying to positions,
            only to hear back from 2-5% of companies. It's demoralizing and inefficient.
          </p>
        </motion.div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: ClockIcon,
              stat: '4-6 hours',
              label: 'Spent per application',
              description: 'Customizing resumes, writing cover letters, filling forms'
            },
            {
              icon: ChartBarIcon,
              stat: '2-5%',
              label: 'Response rate',
              description: 'Most applications disappear into the void'
            },
            {
              icon: UserGroupIcon,
              stat: '200+',
              label: 'Applications needed',
              description: 'To land a single job offer in today\'s market'
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-card border border-gray-200 dark:border-gray-800"
            >
              <item.icon className="h-10 w-10 text-error mb-4" />
              <div className="text-display text-error font-bold mb-2">{item.stat}</div>
              <div className="text-callout font-semibold text-gray-900 dark:text-white mb-2">{item.label}</div>
              <p className="text-footnote text-gray-600 dark:text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Solution Section
function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 lg:py-32">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-title-1 font-semibold text-gray-900 dark:text-white mb-6">
            Meet JobSwipe: <span className="gradient-text">Job hunting, reinvented</span>
          </h2>
          <p className="text-headline text-gray-600 dark:text-gray-400">
            Swipe right on jobs you like. Our AI handles the rest—customizing your resume,
            writing cover letters, and submitting applications while you sleep.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: BoltIcon,
              stat: '10x faster',
              label: 'Application speed',
              description: 'Apply to hundreds of jobs in minutes, not months',
              color: 'text-primary'
            },
            {
              icon: RocketLaunchIcon,
              stat: '5x more',
              label: 'Interview invites',
              description: 'Optimized applications that actually get read',
              color: 'text-success'
            },
            {
              icon: SparklesIcon,
              stat: '100% automated',
              label: 'Zero manual work',
              description: 'Focus on interviewing, not paperwork',
              color: 'text-purple'
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-card hover:shadow-elevated border border-gray-200 dark:border-gray-800 transition-all duration-quick cursor-pointer"
            >
              <item.icon className={`h-10 w-10 ${item.color} mb-4`} />
              <div className={`text-display ${item.color} font-bold mb-2`}>{item.stat}</div>
              <div className="text-callout font-semibold text-gray-900 dark:text-white mb-2">{item.label}</div>
              <p className="text-footnote text-gray-600 dark:text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: '01',
      title: 'Upload your resume',
      description: 'Quick 2-minute setup. Our AI analyzes your skills and experience.',
      image: '📄'
    },
    {
      number: '02',
      title: 'Swipe on jobs you like',
      description: 'Browse curated opportunities. Swipe right to apply, left to skip.',
      image: '👆'
    },
    {
      number: '03',
      title: 'We apply for you',
      description: 'AI customizes applications and submits them automatically. You get interview invites.',
      image: '🎉'
    }
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-950">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-title-1 font-semibold text-gray-900 dark:text-white mb-6">
            Get started in 3 simple steps
          </h2>
          <p className="text-headline text-gray-600 dark:text-gray-400">
            From signup to first application in under 5 minutes
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex gap-8 items-start"
            >
              {/* Step Number */}
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-title-2 font-bold text-white shadow-card">
                {step.number}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="text-6xl mb-4">{step.image}</div>
                <h3 className="text-title-3 font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-body text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Applications',
      description: 'Smart algorithms customize each application to maximize your chances'
    },
    {
      icon: '📝',
      title: 'Resume Optimization',
      description: 'Automatically tailored for each job based on ATS requirements'
    },
    {
      icon: '📊',
      title: 'Application Tracking',
      description: 'Dashboard to monitor all applications, interviews, and offers'
    },
    {
      icon: '🎯',
      title: 'Job Matching',
      description: 'Advanced filters ensure you only see relevant opportunities'
    },
    {
      icon: '⚡',
      title: 'Instant Applications',
      description: 'Apply to multiple jobs in seconds, not hours'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'Your data is encrypted and never shared without permission'
    }
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-title-1 font-semibold text-gray-900 dark:text-white mb-6">
            Everything you need to land your next job
          </h2>
          <p className="text-headline text-gray-600 dark:text-gray-400">
            Powerful features that make job hunting effortless
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-card hover:shadow-elevated border border-gray-200 dark:border-gray-800 transition-all duration-quick cursor-pointer"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-headline font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-subhead text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { value: '10,000+', label: 'Active users' },
    { value: '500k+', label: 'Applications sent' },
    { value: '95%', label: 'User satisfaction' },
    { value: '3x', label: 'Faster job search' }
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black text-white">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-title-1 font-semibold mb-6">
            Trusted by thousands of job seekers
          </h2>
          <p className="text-headline text-gray-300">
            Join the community landing their dream jobs faster
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-display font-bold mb-2">{stat.value}</div>
              <div className="text-callout text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 lg:py-32">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-title-1 font-semibold text-gray-900 dark:text-white mb-6">
            Ready to revolutionize your job search?
          </h2>
          <p className="text-headline text-gray-600 dark:text-gray-400 mb-10">
            Join thousands of professionals landing jobs faster with JobSwipe.
            Start applying in 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <motion.button
                className="group h-16 px-10 bg-primary text-white rounded-lg font-semibold text-callout shadow-premium hover:shadow-elevated transition-all duration-quick"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-quick" />
                </span>
              </motion.button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-footnote text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-success" />
              <span>Free forever plan</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container-premium">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-semibold text-sm">J</span>
            </div>
            <span className="text-headline font-semibold text-gray-900 dark:text-white">JobSwipe</span>
          </div>

          <p className="text-footnote text-gray-500 dark:text-gray-400">
            © 2025 JobSwipe. All rights reserved.
          </p>

          <div className="flex gap-6 text-footnote text-gray-600 dark:text-gray-400">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
