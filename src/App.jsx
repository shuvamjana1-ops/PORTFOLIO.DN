import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';

// Local Assets
import LogoImg from './assets/logo.png';
import SumitImg from './assets/sumit.jpg';
import ShuvamImg from './assets/shuvam.jpg';

// --- HEAVENLY COMPONENTS ---

const DivinePreloader = ({ onComplete }) => {
  return (
    <motion.div 
      className="preloader"
      style={{ position: 'fixed', inset: 0, background: '#F5F5F7', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ position: 'relative' }}>
        <svg width="200" height="200" viewBox="0 0 100 100">
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            onAnimationComplete={() => setTimeout(onComplete, 1000)}
          />
        </svg>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Playfair Display', fontStyle: 'italic', color: '#1D1D1F', letterSpacing: '5px' }}
        >
          D'NINJA
        </motion.div>
      </div>
    </motion.div>
  );
};

const SundialClock = ({ time }) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const rotation = (hours * 30) + (minutes * 0.5);

  return (
    <div className="sundial-wrapper">
      <motion.div 
        className="sundial-gnomon"
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 20, damping: 10 }}
      />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.5rem', opacity: 0.3, letterSpacing: '2px' }}>
        SUNDIAL_MODE
      </div>
    </div>
  );
};

const CreatorCard = ({ name, role, image, skills }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div 
      className="floating-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: '40px', background: 'rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Drifting Skills Parallax */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
        {skills.map((s, i) => (
          <motion.div
            key={i}
            className="parallax-skill"
            animate={{ y: hovered ? [0, -100] : 0, opacity: hovered ? 0.2 : 0 }}
            transition={{ duration: 10, repeat: Infinity, delay: i * 0.5 }}
            style={{ left: `${20 + i * 20}%`, fontSize: '2rem' }}
          >
            {s.name}
          </motion.div>
        ))}
      </div>

      <div style={{ height: '400px', overflow: 'hidden', marginBottom: '30px' }}>
        <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.1) contrast(0.9)', opacity: 0.9 }} />
      </div>
      <h3 className="heavenly-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>{name}</h3>
      <p className="minimal-sans">{role}</p>
    </motion.div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [zenEnabled, setZenEnabled] = useState(false);
  const cursorRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const quoteY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);
  const quoteOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const onMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 1.2, ease: "power2.out" });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  const catalog = { POSTER: [], BRANDING: [], LOGO: [], THUMBNAIL: [] };
  const images = import.meta.glob('./assets/work/**/*.{png,jpg,jpeg,svg,webp}', { eager: true });
  Object.entries(images).forEach(([path, module]) => {
    const parts = path.split('/');
    const category = parts[parts.length - 2].toUpperCase();
    if (catalog[category]) catalog[category].push(module.default);
  });

  return (
    <div style={{ background: '#F5F5F7', color: '#1D1D1F', minHeight: '100vh', position: 'relative' }}>
      <div className="silk-nebula" />
      <div ref={cursorRef} className="aura-cursor" />
      
      <AnimatePresence>
        {loading && <DivinePreloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="zen-toggle" onClick={() => setZenEnabled(!zenEnabled)}>
        {zenEnabled ? 'ZEN_ACTIVE' : 'ZEN_SILENT'}
      </div>

      <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '60px 10%', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={LogoImg} alt="D'NINJA" style={{ height: '30px', filter: 'brightness(0)' }} />
          D'NINJA
        </div>
        <div style={{ display: 'flex', gap: '60px' }}>
          {['SANCTUARY', 'CREATORS', 'ARCHIVE', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="minimal-sans" style={{ textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </nav>

      <section id="sanctuary" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
            <SundialClock time={time} />
            <div className="minimal-sans">
              Welcome to the Sanctuary, Soldier. <br />
              Current Mood: Serene. System: Optimized for West Bengal Daylight.
            </div>
          </div>
          <h1 className="heavenly-title">D'NINJA</h1>
        </motion.div>
      </section>

      <motion.div style={{ y: quoteY, opacity: quoteOpacity, textAlign: 'center', padding: '100px 0' }}>
        <h2 className="heavenly-title" style={{ fontSize: '3rem' }}>"The light follows those who walk in silk."</h2>
      </motion.div>

      <section id="creators" style={{ padding: '100px 10%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px' }}>
          <CreatorCard name="Sumit Dinda" role="Creative Director" image={SumitImg} skills={[{name: 'Vision'}, {name: 'Light'}]} />
          <CreatorCard name="Shuvam Jana" role="Lead Architect" image={ShuvamImg} skills={[{name: 'Silk'}, {name: 'Form'}]} />
        </div>
      </section>

      <section id="archive" style={{ padding: '100px 10%' }}>
        <h2 className="heavenly-title" style={{ fontSize: '3rem', marginBottom: '80px', textAlign: 'center' }}>THE_ARCHIVE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px' }}>
          {Object.values(catalog).flat().map((img, i) => (
            <motion.div key={i} className="floating-card gaussian-bloom" style={{ aspectRatio: '1.618', overflow: 'hidden', padding: '20px' }}>
              <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" style={{ padding: '200px 10%', textAlign: 'center' }}>
        <h2 className="heavenly-title" style={{ marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <motion.a key={c} href="#" className="minimal-sans" whileHover={{ letterSpacing: '8px', color: '#D4AF37' }}>{c}</motion.a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;
