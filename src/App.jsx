import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Float } from '@react-three/drei';
import gsap from 'gsap';

// --- ADAPTIVE ENGINE ---

const useTimeTheme = () => {
  const [theme, setTheme] = useState('evening');
  useEffect(() => {
    const hour = new Date().getHours();
    let currentTheme = 'evening';
    if (hour >= 6 && hour < 12) currentTheme = 'morning';
    else if (hour >= 12 && hour < 17) currentTheme = 'afternoon';
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);
  return theme;
};

// --- COMPONENTS ---

const OrganicPreloader = ({ onComplete }) => {
  return (
    <motion.div 
      style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}
      exit={{ opacity: 0 }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <motion.circle 
            cx="100" cy="100" r="40" fill="#fff"
            animate={{ 
              scale: [1, 1.5, 0.8, 1],
              x: [0, 20, -20, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle 
            cx="100" cy="100" r="30" fill="#fff"
            animate={{ 
              scale: [1, 0.8, 1.2, 1],
              x: [0, -20, 20, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
        <motion.text 
          x="50%" y="50%" dy=".35em" textAnchor="middle" fill="#000" fontSize="12" fontWeight="900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          D'NINJA
        </motion.text>
      </svg>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 3, ease: "easeInOut" }}
        onAnimationComplete={() => onComplete()}
        style={{ position: 'absolute', bottom: 0, height: '2px', background: 'var(--accent-glow)' }}
      />
    </motion.div>
  );
};

const CreatorCard = ({ name, role, image, skills, isSumit }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  return (
    <motion.div 
      ref={cardRef}
      className={`creator-card glass-skeuo ${hovered ? 'focused' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: '600px', position: 'relative' }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div 
            className="data-stream"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--accent-glow)' }}
          >
            {Math.random().toString(16).substring(2, 10).toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '70%', overflow: 'hidden' }}>
        <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: hovered ? 'grayscale(0)' : 'grayscale(1) contrast(1.2)', transition: 'all 0.8s ease' }} />
      </div>

      <div style={{ padding: '40px' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 100 }}>{name}</h3>
        <p style={{ opacity: 0.5, letterSpacing: '5px', fontSize: '0.7rem' }}>{role}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
          {skills.map((s, i) => (
            <motion.span 
              key={i} 
              className="tag mono"
              onClick={(e) => {
                const burst = document.createElement('div');
                burst.className = 'data-burst';
                burst.style.left = `${e.clientX}px`;
                burst.style.top = `${e.clientY}px`;
                document.body.appendChild(burst);
                setTimeout(() => burst.remove(), 1000);
              }}
              style={{ padding: '5px 15px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.6rem', cursor: 'pointer' }}
            >
              {s.name}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const MagneticLink = ({ children, href }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(x*x + y*y);
      if (dist < 100) {
        gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.3 });
      } else {
        gsap.to(el, { x: 0, y: 0, duration: 0.5 });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <a ref={ref} href={href} className="acoustic-btn floating-orb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </a>
  );
};

// --- MAIN APP ---

const App = () => {
  const theme = useTimeTheme();
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.8, ease: "power3.out" });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const catalog = { POSTER: [], BRANDING: [], LOGO: [], THUMBNAIL: [] };
  const images = import.meta.glob('./assets/work/**/*.{png,jpg,jpeg,svg,webp,mp4}', { eager: true });
  Object.entries(images).forEach(([path, module]) => {
    const parts = path.split('/');
    const category = parts[parts.length - 2].toUpperCase();
    if (catalog[category]) catalog[category].push(module.default);
  });

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <AnimatePresence>
        {loading && <OrganicPreloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div ref={cursorRef} className="aura-cursor" style={{ position: 'fixed', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--accent-glow)', pointerEvents: 'none', zIndex: 10000, transform: 'translate(-50%, -50%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '4px', height: '4px', background: 'var(--accent-glow)', borderRadius: '50%' }}></div>
      </div>

      <nav className="navbar" style={{ position: 'fixed', top: 0, width: '100%', padding: '40px 10%', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ fontWeight: 900, letterSpacing: '10px' }}>D'NINJA</div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link acoustic-btn" style={{ fontSize: '0.7rem', letterSpacing: '3px', textDecoration: 'none', color: '#fff' }}>{l}</a>
          ))}
        </div>
      </nav>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <div style={{ opacity: 0.5, fontFamily: 'monospace', marginBottom: '20px', letterSpacing: '2px' }}>
            BIOMETRIC AUTH: VERIFIED. SOLDIER IDENTIFIED. DEPLOYMENT PHASE: {theme.toUpperCase()} OPERATIONS.
          </div>
          <h1 className="hero-title" style={{ fontSize: '10rem', fontWeight: 100, margin: 0, filter: `drop-shadow(0 0 30px var(--accent-glow))` }}>D'NINJA</h1>
        </motion.div>
      </section>

      <section id="about" style={{ padding: '100px 10%', position: 'relative' }}>
        <div className="pulse-line" style={{ top: '50%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', position: 'relative', zIndex: 1 }}>
          <CreatorCard name="Sumit Dinda" role="Creative Director" image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" skills={[{name: 'Design'}, {name: 'Motion'}]} isSumit={true} />
          <CreatorCard name="Shuvam Jana" role="Lead Architect" image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" skills={[{name: 'React'}, {name: 'Web3'}]} isSumit={false} />
        </div>
      </section>

      <section id="work" style={{ padding: '100px 10%' }}>
        <h2 style={{ fontWeight: 100, fontSize: '4rem', marginBottom: '80px', textAlign: 'center' }}>ADAPTIVE_VAULT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {Object.values(catalog).flat().map((item, i) => (
            <motion.div 
              key={i} 
              className="glass-skeuo" 
              whileHover={{ scale: 1.05 }}
              style={{ aspectRatio: '1', position: 'relative' }}
              onMouseEnter={() => {
                if (cursorRef.current) cursorRef.current.innerHTML = '<span style="font-size:0.5rem; letter-spacing:2px">VIEW</span>';
              }}
              onMouseLeave={() => {
                if (cursorRef.current) cursorRef.current.innerHTML = '<div style="width:4px; height:4px; background:var(--accent-glow); borderRadius:50%"></div>';
              }}
            >
              {item.endsWith('.mp4') ? (
                <video src={item} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={item} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 100, fontSize: '5rem', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', gap: '60px' }}>
          <MagneticLink href="#">INSTAGRAM</MagneticLink>
          <MagneticLink href="#">WHATSAPP</MagneticLink>
          <MagneticLink href="#">EMAIL</MagneticLink>
        </div>
      </section>

      <div style={{ position: 'fixed', bottom: '40px', right: '40px', width: '80px', height: '80px' }}>
        <Canvas>
          <Float speed={5}>
            <Icosahedron args={[1, 0]}>
              <MeshDistortMaterial color={theme === 'morning' ? '#FFD700' : theme === 'afternoon' ? '#00BFFF' : '#FF4500'} speed={5} distort={0.4} wireframe />
            </Icosahedron>
          </Float>
        </Canvas>
      </div>
    </div>
  );
};

export default App;
