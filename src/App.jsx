import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Local Assets
import LogoImg from './assets/identity/logo.png';
const SumitImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
const ShuvamImg = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800";

// --- THE ARCHIVE-X ENGINE ---
const useAutoLibrary = () => {
  return useMemo(() => {
    const library = {};
    const assets = import.meta.glob('./assets/work/**/*.{png,jpg,jpeg,svg,webp,mp4}', { eager: true });
    Object.entries(assets).forEach(([path, module]) => {
      const parts = path.split('/');
      const category = parts[parts.length - 2].toUpperCase();
      if (!library[category]) library[category] = [];
      library[category].push({ url: module.default, type: path.endsWith('.mp4') ? 'video' : 'image' });
    });
    return library;
  }, []);
};

// --- HYPER-REALISTIC COMPONENTS ---

const VitalityStreamPreloader = ({ onComplete }) => {
  const canvasRef = useRef();
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let fill = 0;
    const animate = () => {
      ctx.clearRect(0, 0, 1000, 1000);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 2;
      ctx.font = '900 120px Inter';
      ctx.strokeText("D'NINJA", 200, 500);
      
      // Volumetric Slosh Effect
      const wave = Math.sin(Date.now() * 0.005) * 10;
      ctx.fillStyle = '#E0E0E0';
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 500 - fill + wave, 1000, fill);
      ctx.clip();
      ctx.fillText("D'NINJA", 200, 500);
      ctx.restore();

      if(fill < 250) fill += 1.5;
      else {
        gsap.to(canvasRef.current, { opacity: 0, scale: 2, duration: 1, ease: "power4.inOut", onComplete });
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width="1000" height="1000" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#030303', width: '100%', height: '100%' }} />;
};

const MoltenGlassBackground = ({ velocity }) => {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    meshRef.current.material.uniforms.uVelocity.value = velocity;
  });

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 }, uVelocity: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime;
      uniform float uVelocity;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float dist = length(p);
        float wave = sin(dist * 5.0 - uTime + uVelocity * 0.01) * 0.5 + 0.5;
        gl_FragColor = vec4(vec3(0.01) * wave, 1.0);
      }
    `
  }), []);

  return <mesh ref={meshRef} scale={[50, 50, 1]}><planeGeometry /><shaderMaterial args={[shaderArgs]} /></mesh>;
};

const PrecisionCursor = () => {
  const dotRef = useRef();
  const ringRef = useRef();
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(ringRef.current, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    const onHover = () => setHovering(true);
    const onLeave = () => setHovering(false);
    
    window.addEventListener('mousemove', move);
    document.querySelectorAll('a, button, .z-card').forEach(el => {
      el.addEventListener('mouseenter', onHover);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <div ref={dotRef} className="precision-dot" style={{ background: hovering ? 'transparent' : '#fff' }}>
        {hovering && <span style={{ color: '#D4AF37', fontSize: '10px' }}>[ ]</span>}
      </div>
      <div ref={ringRef} className="ghost-ring" style={{ scale: hovering ? 1.5 : 1, opacity: hovering ? 0 : 1 }} />
    </>
  );
};

const HolographicBio = ({ name, role, image, skills }) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  return (
    <motion.div 
      className="hologram-slab z-card"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({ x: (e.clientX - (rect.left + rect.width / 2)) / 10, y: (e.clientY - (rect.top + rect.height / 2)) / 10 });
      }}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      style={{ width: '400px', height: '600px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      {/* Floating Orbitals Simulation */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)' }}>
        {skills.map((s, i) => (
          <motion.div 
            key={i}
            animate={{ rotate: 360, x: Math.cos(i) * 100, y: Math.sin(i) * 50 }}
            transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', fontSize: '0.5rem', color: '#D4AF37', whiteSpace: 'nowrap' }}
          >
            {s.name}
          </motion.div>
        ))}
      </div>

      <motion.img 
        src={image} 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, opacity: 0.5, x: mouse.x, y: mouse.y }} 
      />
      
      <motion.div style={{ x: mouse.x * 1.5, y: mouse.y * 1.5 }}>
        <h3 className="etched-text unmask" style={{ fontSize: '1.5rem' }}>{name}</h3>
        <p className="mono-detail" style={{ color: '#D4AF37', marginTop: '10px' }}>{role}</p>
      </motion.div>
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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: '#030303', color: '#E0E0E0', minHeight: '100vh' }}>
      <PrecisionCursor />
      <AnimatePresence>{loading && <VitalityStreamPreloader onComplete={() => setLoading(false)} />}</AnimatePresence>
      
      <div className="bento-grid" />
      <div style={{ position: 'fixed', inset: 0, zIndex: -2 }}><Canvas><MoltenGlassBackground velocity={smoothVel.get()} /></Canvas></div>

      <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '40px 8%', display: 'flex', justifyContent: 'space-between', zIndex: 1000, mixBlendMode: 'difference' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={LogoImg} style={{ height: '25px', filter: 'invert(1)' }} alt="Logo" />
          <span className="etched-text" style={{ fontSize: '1rem' }}>D'NINJA</span>
        </div>
        <div style={{ display: 'flex', gap: '50px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="mono-detail" style={{ textDecoration: 'none', color: '#fff', fontSize: '0.6rem', letterSpacing: '4px' }}>{l}</a>
          ))}
        </div>
      </nav>

      <div style={{ position: 'fixed', bottom: 40, right: '8%', zIndex: 1000, textAlign: 'right' }}>
        <div className="mono-detail" style={{ fontSize: '0.5rem', color: '#D4AF37', letterSpacing: '2px' }}>
          SENTRY ACTIVE. WELCOME, SOLDIER.<br />
          SECTOR: WEST BENGAL | {time.toLocaleTimeString()}_SYNC
        </div>
      </div>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%' }}>
        <h1 className="etched-text unmask" style={{ fontSize: '16vw', lineHeight: 0.8, margin: 0 }}>D'NINJA</h1>
      </section>

      <section id="about" style={{ padding: '100px 8%', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <HolographicBio name="Sumit Dinda" role="Lead Designer" image={SumitImg} skills={[{name: 'UX'}, {name: 'Visuals'}]} />
        <HolographicBio name="Shuvam Jana" role="Lead Architect" image={ShuvamImg} skills={[{name: 'Code'}, {name: 'Hardware'}]} />
      </section>

      <section id="work" style={{ padding: '100px 8%' }}>
        <h2 className="etched-text" style={{ fontSize: '3rem', marginBottom: '80px' }}>ARCHIVE_X</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px' }}>
          {Object.entries(library).map(([category, items]) => (
            <div key={category}>
              <h3 className="mono-detail" style={{ color: '#D4AF37', marginBottom: '30px' }}>// {category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {items.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="hologram-slab z-card" 
                    whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)' }}
                    style={{ aspectRatio: '1', overflow: 'hidden' }}
                  >
                    {item.type === 'video' ? <video src={item.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" style={{ padding: '200px 8%', textAlign: 'center' }}>
        <h2 className="etched-text" style={{ fontSize: '6vw', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '100px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <a key={c} href="#" className="mono-detail" style={{ textDecoration: 'none', color: '#D4AF37', fontSize: '0.8rem', letterSpacing: '8px' }}>{c}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
