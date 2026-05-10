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
  const [isAuraIdle, setIsAuraIdle] = useState(true);
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
      setIsAuraIdle(false);
      
      // Comet Tail Physics
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { 
          x: clientX, 
          y: clientY, 
          duration: 0.5, 
          ease: "power2.out"
        });
      }

      // Weight Shift Logic (Dynamic Font Weight)
      const elements = document.querySelectorAll('.hero-title, .hero-quote, .nav-link');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        
        if (dist < 150) {
          const weight = Math.max(100, Math.min(900, 900 - (dist * 5)));
          el.style.fontWeight = weight;
        } else {
          el.style.fontWeight = 100;
        }
      });
    };
    
    const onMouseStop = gsap.delayedCall(0.1, () => setIsAuraIdle(true));
    
    const handleMove = (e) => {
      onMouseMove(e);
      onMouseStop.restart(true);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', handleMove);
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
    return `STATUS: GHOST // ENVIRONMENT: WEST BENGAL. WELCOME BACK, SOLDIER. MISSION: EXCELLENCE.`;
  };

  return (
    <div className={`main-wrapper ${isShaking ? 'shake' : ''}`}>
      <div className="bento-grid"></div>
      <Background />
      
      {/* Aura Cursor */}
      <div 
        ref={cursorRef}
        className={`aura-cursor ${isAuraIdle ? 'aura-breathing' : ''}`}
      ></div>

      <AnimatePresence>
        {loading && (
          <motion.div 
            className="preloader"
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Hydro-Kinetic Splash Drop */}
              <motion.div 
                initial={{ y: -500, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "circIn" }}
                style={{ width: '10px', height: '10px', background: 'var(--accent-cyan)', borderRadius: '50%', marginBottom: '20px' }}
              ></motion.div>

              {/* Liquid Splash Text */}
              <svg viewBox="0 0 400 100" style={{ width: '600px', fontWeight: '900', letterSpacing: '10px' }}>
                <defs>
                  <linearGradient id="liquid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" />
                  </linearGradient>
                </defs>
                <text x="50%" y="50%" dy=".35em" textAnchor="middle" style={{ fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.1)', strokeWidth: '1px' }}>
                  D'NINJA
                </text>
                <motion.text 
                  x="50%" y="50%" dy=".35em" textAnchor="middle" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.1 }}
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
                    transition={{ delay: 1.5, duration: 1.5, ease: "power4.out" }}
                    onAnimationComplete={() => {
                      setTimeout(() => setLoading(false), 800);
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
          <div className="intelligence-node" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <RingClock time={time} />
            <div>
              <div className="hero-greeting" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {formatGreeting()}
              </div>
              <h1 className="hero-title">D'NINJA</h1>
            </div>
          </div>
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

      <section id="work" className="work-section" style={{ overflow: 'hidden' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '60px', textAlign: 'center', fontWeight: 100 }}>CINEMATIC_VAULT</h2>
        
        {/* Cinematic Background Immersion */}
        <div id="vault-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2, opacity: 0, transition: 'opacity 1s ease', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px) brightness(0.3)' }}></div>

        {Object.entries(catalog).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: '100px', position: 'relative' }}>
            <h3 style={{ letterSpacing: '8px', color: 'var(--accent-cyan)', fontSize: '0.8rem', marginBottom: '30px' }}>
              // {cat}
            </h3>
            <div 
              className="work-strip"
              style={{ display: 'flex', gap: '50px', overflowX: 'auto', paddingBottom: '30px', scrollbarWidth: 'none' }}
              onMouseEnter={() => {
                if (items[0]) {
                  const bg = document.getElementById('vault-bg');
                  bg.style.backgroundImage = `url(${items[0]})`;
                  bg.style.opacity = 0.5;
                }
              }}
              onMouseLeave={() => {
                document.getElementById('vault-bg').style.opacity = 0;
              }}
            >
              {items.map((img, i) => (
                <motion.div 
                  key={i} 
                  className="work-item glass-skeuo z-expand"
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  style={{ minWidth: '500px', height: '300px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0 }}
                >
                  <img src={img} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="contact" className="contact-section">
        <h2 style={{ fontSize: '4rem', marginBottom: '40px', fontWeight: 100 }}>ESTABLISH_COMM</h2>
        <div className="contact-links">
          {['Instagram', 'WhatsApp', 'Email'].map(link => (
            <a key={link} href="#" className="floating-orb">
              <div className="orb-ping"></div>
              <span style={{ fontSize: '0.6rem', letterSpacing: '2px', fontWeight: 900 }}>{link.toUpperCase()}</span>
            </a>
          ))}
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

const CreatorCard = ({ name, role, image, skills }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <motion.div 
      className="creator-card glass-skeuo" 
      style={{ height: '600px', perspective: '1000px', background: 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div 
            initial={{ y: -600 }}
            animate={{ y: 600 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--accent-cyan)', zIndex: 5, boxShadow: '0 0 20px var(--accent-cyan)' }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ opacity: hovered ? 1 : 0.05 }}
        style={{ height: '100%', width: '100%' }}
      >
        <div className="frosted-container" style={{ height: '60%' }}>
          <img src={image} alt={name} className="frosted-img" style={{ filter: hovered ? 'none' : 'grayscale(1) blur(20px)' }} />
        </div>
        <div className="card-overlay" style={{ background: 'linear-gradient(to top, var(--bg-dark), transparent)', padding: '40px' }}>
          <h3 className="hero-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>{name}</h3>
          <p style={{ opacity: 0.5, letterSpacing: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>{role}</p>
        </div>
      </motion.div>

      {/* 3D Orbiting Satellite Tags */}
      {hovered && skills.map((s, i) => (
        <motion.div
          key={s.name}
          animate={{
            rotate: 360,
            x: [Math.cos(i) * 150, Math.cos(i + 2) * 150, Math.cos(i) * 150],
            y: [Math.sin(i) * 150, Math.sin(i + 2) * 150, Math.sin(i) * 150],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '40%', left: '45%', pointerEvents: 'none' }}
        >
          <span className="tag glass-skeuo" style={{ padding: '8px 15px', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
            {s.name}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

const RingClock = ({ time }) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const progress = ((hours * 60 + minutes) / 1440) * 100;
  
  return (
    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
      <svg width="80" height="80" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <motion.circle 
          cx="50" cy="50" r="45" fill="none" 
          stroke="var(--accent-cyan)" 
          strokeWidth="2" 
          strokeDasharray="283"
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
          style={{ filter: `drop-shadow(0 0 10px var(--accent-cyan))` }}
        />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.6rem', opacity: 0.5 }}>
        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default App;
