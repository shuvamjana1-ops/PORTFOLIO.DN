import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// --- THE IDENTITY VAULT ---
import LogoImg from './assets/identity/logo.png';
const SumitImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
const ShuvamImg = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800";

// --- THE AUTO-SYNC ENGINE ---
// This logic scans your folders and builds the library automatically.
const useAutoLibrary = () => {
  return useMemo(() => {
    const library = {};
    const assets = import.meta.glob('./assets/work/**/*.{png,jpg,jpeg,svg,webp,mp4}', { eager: true });
    
    Object.entries(assets).forEach(([path, module]) => {
      const parts = path.split('/');
      const category = parts[parts.length - 2].toUpperCase();
      if (!library[category]) library[category] = [];
      library[category].push({
        url: module.default,
        type: path.endsWith('.mp4') ? 'video' : 'image',
        name: parts[parts.length - 1].split('.')[0]
      });
    });
    return library;
  }, []);
};

// --- DARK MATTER COMPONENTS ---

const EclipsePreloader = ({ onComplete }) => {
  return (
    <motion.div 
      className="preloader"
      style={{ position: 'fixed', inset: 0, background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ position: 'relative', width: '300px', height: '300px' }}>
        <motion.div 
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #FFD700', boxShadow: '0 0 30px #FFD700' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <h1 className="dark-matter-title" style={{ fontSize: '1.5rem', margin: 0 }}>D'NINJA</h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
            style={{ height: '1px', background: '#FFD700', marginTop: '10px' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const InkNebula = ({ velocity }) => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.uVelocity.value = velocity * 10;
    }
  });

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 }, uVelocity: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime; uniform float uVelocity; varying vec2 vUv; void main() { vec2 p = vUv * 2.0 - 1.0; float d = length(p); float ink = sin(d * 10.0 - uTime * 2.0 + uVelocity) * 0.5 + 0.5; gl_FragColor = vec4(vec3(0.02, 0.02, 0.02) * ink, 1.0); }`
  }), []);

  return (
    <mesh ref={meshRef} scale={[50, 50, 1]}>
      <planeGeometry />
      <shaderMaterial args={[shaderArgs]} transparent opacity={0.5} />
    </mesh>
  );
};

const NoirPortrait = ({ name, role, image, skills }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div 
      className="neon-trace-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: '350px', background: 'rgba(10,10,10,0.8)', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}
    >
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '25px' }}>
        <motion.div 
          animate={{ scale: hovered ? 1.1 : 1, borderColor: hovered ? '#FFD700' : 'rgba(255,255,255,0.1)' }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid', overflow: 'hidden', padding: '5px' }}
        >
          <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        </motion.div>
        {hovered && <motion.div layoutId="scan" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#FFD700', boxShadow: '0 0 10px #FFD700' }} animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity }} />}
      </div>
      
      <h3 className="dark-matter-title" style={{ fontSize: '1rem', letterSpacing: '5px' }}>{name}</h3>
      <p className="mono-detail" style={{ fontSize: '0.6rem', color: '#FFD700', marginTop: '5px' }}>{role}</p>
      
      <AnimatePresence>
        {hovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {skills.map((s, i) => (
              <span key={i} className="mono-detail" style={{ fontSize: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px' }}>
                {s.name}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const library = useAutoLibrary();
  const { scrollY } = useScroll();
  const scrollVel = useVelocity(scrollY);
  const smoothVel = useSpring(scrollVel, { stiffness: 100, damping: 30 });
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => { if (cursorRef.current) gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power2.out" }); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div style={{ background: '#050505', color: '#E0E0E0', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}><Canvas><InkNebula velocity={smoothVel} /></Canvas></div>
      <div ref={cursorRef} className="aura-cursor" style={{ position: 'fixed', width: '20px', height: '20px', border: '1px solid #FFD700', borderRadius: '50%', pointerEvents: 'none', zIndex: 10000, transform: 'translate(-50%, -50%)' }} />

      <AnimatePresence>{loading && <EclipsePreloader onComplete={() => setLoading(false)} />}</AnimatePresence>

      <nav className="smoked-glass" style={{ position: 'fixed', top: 0, width: '100%', padding: '30px 10%', display: 'flex', justifyContent: 'space-between', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={LogoImg} style={{ height: '25px', filter: 'invert(1)' }} alt="Logo" />
          <h2 className="dark-matter-title" style={{ fontSize: '1rem', margin: 0 }}>D'NINJA</h2>
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="mono-detail active-glow" style={{ textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </nav>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <div className="mono-detail">SOLDIER AUTHENTICATED. GHOST-MODE: ACTIVE. NIGHT-OPS SYNCHRONIZED.</div>
          <h1 className="dark-matter-title" style={{ fontSize: '12vw', margin: 0 }}>D'NINJA</h1>
        </motion.div>
      </section>

      <section id="about" style={{ padding: '100px 10%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ width: '300px' }}>
            <NoirPortrait name="Sumit Dinda" role="Lead Designer" image={SumitImg} skills={[{name: 'UX'}, {name: 'VisDev'}]} />
          </div>
          <div style={{ width: '300px' }}>
            <NoirPortrait name="Shuvam Jana" role="Lead Architect" image={ShuvamImg} skills={[{name: 'GLSL'}, {name: 'Architecture'}]} />
          </div>
        </div>
      </section>

      <section id="work" style={{ padding: '100px 10%' }}>
        <h2 className="dark-matter-title" style={{ fontSize: '3rem', marginBottom: '80px' }}>THE_SHADOW_VAULT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(45%, 1fr))', gap: '80px 40px' }}>
          {Object.entries(library).map(([category, items]) => (
            <div key={category} style={{ borderLeft: '1px solid rgba(255,215,0,0.1)', paddingLeft: '20px' }}>
              <h3 className="mono-detail" style={{ marginBottom: '30px', color: '#FFD700' }}>// CATEGORY: {category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                {items.map((item, idx) => (
                  <motion.div key={idx} className="neon-trace-card" whileHover={{ scale: 1.05 }} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                    {item.type === 'video' ? <video src={item.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" style={{ padding: '100px 10%', textAlign: 'center' }}>
        <h2 className="dark-matter-title" style={{ fontSize: '4rem', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <motion.a key={c} href="#" className="mono-detail active-glow" whileHover={{ letterSpacing: '8px' }}>{c}</motion.a>
          ))}
        </div>
      </section>

      <footer style={{ padding: '60px 10%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="ekg-line"><div className="ekg-pulse" style={{ animationDuration: `${2 / (1 + smoothVel.get() * 0.1)}s` }} /></div>
        <div className="mono-detail" style={{ marginTop: '20px', textAlign: 'center' }}>© 2026 D'NINJA SYSTEM. ALL RIGHTS RESERVED.</div>
      </footer>
    </div>
  );
};

export default App;
