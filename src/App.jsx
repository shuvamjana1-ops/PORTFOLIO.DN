import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Background from './Background';
// HUD removed as per strict instructions


// Automated Catalog Logic
const images = import.meta.glob('./assets/work/**/*.{png,jpg,jpeg,svg,webp}', { eager: true });

const App = () => {
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const [navStyle, setNavStyle] = useState({ left: 0, width: 0 });
  const cursorRef = useRef(null);
  const cursorLiquidRef = useRef(null);

  // Audio Engine (Synthesized)
  const playPowerOn = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePos({ x: clientX, y: clientY });
      document.documentElement.style.setProperty('--mouse-x', `${clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${clientY}px`);

      if (cursorRef.current) gsap.to(cursorRef.current, { x: clientX - 10, y: clientY - 10, duration: 0.1 });
      if (cursorLiquidRef.current) gsap.to(cursorLiquidRef.current, { x: clientX - 20, y: clientY - 20, duration: 0.3 });
    };
    
    const onClick = () => {
      if (!isInitialized) {
        setIsInitialized(true);
        setLoading(false);
        playPowerOn();
      }
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, [isInitialized]);

  // Catalog Processing
  const catalog = { POSTER: [], BRANDING: [], LOGO: [], THUMBNAIL: [] };
  Object.entries(images).forEach(([path, module]) => {
    const parts = path.split('/');
    const category = parts[parts.length - 2].toUpperCase();
    if (catalog[category]) catalog[category].push(module.default);
  });

  const handleNavHover = (e) => {
    const { offsetLeft, offsetWidth } = e.target;
    setNavStyle({ left: offsetLeft, width: offsetWidth });
  };

  const formatGreeting = () => {
    return `STATUS: ACTIVE // SYSTEM_SYNCHRONIZED_WBT [WEST_BENGAL_TIME]. WELCOME, SOLDIER.`;
  };

  return (
    <div className={`main-wrapper ${isShaking ? 'shake' : ''}`}>
      <Background />
      
      {/* Global Lens Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="chromatic-aberration">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
          <feOffset in="red" dx="2" dy="0" result="red-offset" />
          <feOffset in="blue" dx="-2" dy="0" result="blue-offset" />
          <feBlend in="red-offset" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue-offset" mode="screen" />
        </filter>
      </svg>

      <div className="lens-cursor" style={{ left: mousePos.x, top: mousePos.y }}></div>

      <AnimatePresence>
        {loading && (
          <motion.div 
            className="preloader"
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div style={{ position: 'relative' }}>
              {/* Liquid Fill SVG Text */}
              <svg viewBox="0 0 400 100" style={{ width: '600px', fontWeight: '900', letterSpacing: '10px' }}>
                <defs>
                  <linearGradient id="liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" />
                  </linearGradient>
                </defs>
                <text x="50%" y="50%" dy=".35em" textAnchor="middle" className="liquid-text-bg" style={{ fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.1)', strokeWidth: '1px' }}>
                  D'NINJA
                </text>
                <motion.text 
                  x="50%" y="50%" dy=".35em" textAnchor="middle" 
                  style={{ 
                    fill: 'var(--accent-cyan)',
                    clipPath: 'url(#wave-clip)'
                  }}
                >
                  D'NINJA
                </motion.text>
                <clipPath id="wave-clip">
                  <motion.rect 
                    x="0" width="400" 
                    initial={{ y: 100, height: 0 }}
                    animate={{ y: 0, height: 100 }}
                    transition={{ duration: 3, ease: "linear" }}
                    onAnimationComplete={() => {
                      setTimeout(() => setLoading(false), 500);
                    }}
                  />
                </clipPath>
              </svg>
            </div>
            {!isInitialized && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                style={{ position: 'absolute', bottom: '20%', fontSize: '0.7rem', opacity: 0.5, letterSpacing: '8px', color: 'var(--accent-cyan)' }}
              >
                SYNC_NEURAL_LINK // CLICK_TO_INIT
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav 
        className="navbar glass-skeuo"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="logo-container z-expand">
          <img src="/src/assets/logo.png" alt="D'NINJA" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="nav-links" style={{ position: 'relative' }}>
          {['Home', 'About', 'Work', 'Contact'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="nav-link z-expand" onMouseEnter={handleNavHover}>{link}</a>
          ))}
          <div className="nav-liquid-border" style={{ left: navStyle.left, width: navStyle.width }}></div>
        </div>
      </motion.nav>

      <section id="home" className="hero">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <div className="hero-greeting" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {formatGreeting()}
          </div>
          <h1 className="hero-title" style={{ textShadow: '0 0 30px rgba(0,255,255,0.3)' }}>D'NINJA</h1>
          <p className="hero-quote">"Architecting digital shadows through high-fidelity precision."</p>
          <div className="open-to-work">
            <div className="pulse-dot"></div>
            <span>LINK_ESTABLISHED // 2026</span>
          </div>
        </motion.div>
      </section>

      <section id="about" className="about-section">
        <h2 style={{ fontSize: '3rem', marginBottom: '60px', textAlign: 'center' }}>BIO_VECTORS</h2>
        <div className="cards-container">
          <CreatorCard 
            name="Sumit Dinda" 
            role="Creative Director" 
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" 
            skills={[{name: 'Three.js', val: 95}, {name: 'Motion', val: 90}, {name: 'Design', val: 85}]} 
          />
          <CreatorCard 
            name="Shuvam Jana" 
            role="Lead Architect" 
            image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" 
            skills={[{name: 'React', val: 98}, {name: 'GSAP', val: 92}, {name: 'Cloud', val: 88}]} 
          />
        </div>
      </section>

      <section id="work" className="work-section">
        <h2 style={{ fontSize: '3rem', marginBottom: '60px', textAlign: 'center' }}>DATA_ARCHIVE</h2>
        
        {/* Water Ripple Filter */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="ripple">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise">
              <animate attributeName="baseFrequency" values="0.01;0.015;0.01" dur="5s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
          </filter>
        </svg>

        {Object.entries(catalog).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: '100px', position: 'relative' }}>
            <h3 style={{ letterSpacing: '8px', color: 'var(--accent-cyan)', fontSize: '0.8rem', marginBottom: '30px' }}>
              // {cat}
            </h3>
            <motion.div 
              className="work-carousel"
              drag="x"
              dragConstraints={{ left: -((items.length - 1) * 430), right: 0 }}
              style={{ display: 'flex', gap: '30px', cursor: 'grab' }}
              whileTap={{ cursor: 'grabbing', filter: 'url(#ripple)' }}
            >
              {items.map((img, i) => (
                <motion.div 
                  key={i} 
                  className="work-item glass-skeuo"
                  whileHover={{ scale: 0.98 }}
                  style={{ minWidth: '400px', height: '250px', borderRadius: '20px', overflow: 'hidden' }}
                >
                  <img src={img} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </motion.div>
              ))}
              {items.length === 0 && <div className="glass-skeuo" style={{ padding: '40px', width: '100%', opacity: 0.3 }}>EMPTY_NODE</div>}
            </motion.div>
          </div>
        ))}
      </section>

      <section id="contact" className="contact-section">
        <h2 style={{ fontSize: '4rem', marginBottom: '40px' }}>ESTABLISH_COMM</h2>
        <div className="contact-links">
          <a href="#" className="glass-btn glass-skeuo z-expand">Instagram</a>
          <a href="#" className="glass-btn glass-skeuo z-expand">WhatsApp</a>
          <a href="mailto:contact@dninja.com" className="glass-btn glass-skeuo z-expand">Email</a>
        </div>
        <div className="glass-skeuo feedback-loop" style={{ marginTop: '100px', padding: '80px', borderRadius: '40px' }}>
          <h3>VAL_FEEDBACK_LOOP</h3>
          <p style={{ margin: '20px 0', opacity: 0.6 }}>Your input is critical to system evolution.</p>
          <button className="glass-btn" style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none' }} onClick={() => window.open('https://forms.google.com')}>
            SUBMIT_DATA
          </button>
        </div>
      </section>
    </div>
  );
};

const CreatorCard = ({ name, role, image, skills }) => (
  <motion.div 
    className="creator-card glass-skeuo" 
    style={{ height: '600px', perspective: '1000px' }}
    whileHover={{ scale: 1.02, translateZ: 100 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <div className="frosted-container" style={{ height: '60%' }}>
      <img src={image} alt={name} className="frosted-img" />
    </div>
    <div className="card-overlay" style={{ background: 'linear-gradient(to top, var(--bg-dark), transparent)', padding: '40px' }}>
      <h3 style={{ fontSize: '2rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>{name}</h3>
      <p style={{ opacity: 0.5, letterSpacing: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>{role}</p>
      
      <div className="tag-cloud" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '30px' }}>
        {skills.map(s => (
          <motion.span 
            key={s.name} 
            className="tag glass-skeuo"
            whileHover={{ y: -5, color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
            style={{ padding: '8px 15px', fontSize: '0.6rem', letterSpacing: '1px' }}
          >
            {s.name}
          </motion.span>
        ))}
      </div>
    </div>
    {/* Shatter Border Animation Placeholder */}
    <div className="shatter-border" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '1px solid var(--accent-cyan)', opacity: 0.2, pointerEvents: 'none' }}></div>
  </motion.div>
);

export default App;
