import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Local Assets
import LogoImg from './assets/identity/logo.png';
const SumitImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
const ShuvamImg = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800";

// --- THE AUTO-SYNC ENGINE ---
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

// --- CINEMATIC COMPONENTS ---

const MolecularPreloader = ({ onComplete }) => {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let phase = 'converge';

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for(let i=0; i<1500; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          tx: canvas.width/2 + (Math.random()-0.5)*300,
          ty: canvas.height/2 + (Math.random()-0.5)*100,
          vx: (Math.random()-0.5)*10,
          vy: (Math.random()-0.5)*10,
          size: Math.random() * 2
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        if(phase === 'converge') {
          p.x += (p.tx - p.x) * 0.05;
          p.y += (p.ty - p.y) * 0.05;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();
    setTimeout(() => phase = 'explode', 3000);
    setTimeout(onComplete, 4000);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#050505' }} />;
};

const InkBackground = ({ scrollVelocity }) => {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    meshRef.current.material.uniforms.uScroll.value = scrollVelocity;
  });

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime;
      uniform float uScroll;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float d = length(p);
        float ink = sin(d * 8.0 - uTime + uScroll * 0.1) * 0.5 + 0.5;
        gl_FragColor = vec4(vec3(0.01) * ink, 1.0);
      }
    `
  }), []);

  return (
    <mesh ref={meshRef} scale={[50, 50, 1]}>
      <planeGeometry />
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
};

const CinematicCard = ({ name, role, image, skills }) => {
  return (
    <motion.div 
      className="smoked-glass z-card"
      style={{ height: '400px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}
    >
      <motion.img 
        src={image} 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, opacity: 0.3, filter: 'grayscale(1)' }}
        whileHover={{ opacity: 0.8, filter: 'grayscale(0)' }}
      />
      <h3 className="refract-text" style={{ fontSize: '1.5rem' }}>{name}</h3>
      <p className="mono-detail" style={{ color: '#D4AF37' }}>{role}</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {skills.map((s, i) => <span key={i} style={{ fontSize: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px' }}>{s.name}</span>)}
      </div>
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
    const onMove = (e) => { if (cursorRef.current) gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.8, ease: "power3.out" }); };
    const onScrollUpdate = () => {
      document.documentElement.style.setProperty('--scroll-vel', Math.min(Math.abs(scrollVel.get()) / 10, 10));
    };
    window.addEventListener('mousemove', onMove);
    const scrollUnsub = scrollY.on("change", onScrollUpdate);
    return () => {
      window.removeEventListener('mousemove', onMove);
      scrollUnsub();
    };
  }, []);

  return (
    <div style={{ background: '#050505', color: '#E0E0E0', minHeight: '100vh' }}>
      <AnimatePresence>{loading && <MolecularPreloader onComplete={() => setLoading(false)} />}</AnimatePresence>
      <div ref={cursorRef} className="prismatic-cursor" />
      
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Canvas><InkBackground scrollVelocity={smoothVel.get()} /></Canvas>
      </div>

      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={LogoImg} style={{ height: '30px', filter: 'invert(1)' }} alt="Logo" />
          <span className="refract-text" style={{ fontSize: '1.2rem' }}>D'NINJA</span>
        </div>
        <div style={{ display: 'flex', gap: '50px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>
      </nav>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '5px', opacity: 0.5, marginBottom: '20px' }}>SOLDIER IDENTIFIED. GHOST-MODE: ACTIVE. SECTOR: WEST BENGAL.</div>
        <h1 className="refract-text" style={{ fontSize: '15vw', margin: 0, lineHeight: 0.8 }}>D'NINJA</h1>
      </section>

      <section id="about" style={{ padding: '100px 10%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
          <CinematicCard name="Sumit Dinda" role="Lead Designer" image={SumitImg} skills={[{name: 'UX'}, {name: 'Motion'}]} />
          <CinematicCard name="Shuvam Jana" role="Lead Architect" image={ShuvamImg} skills={[{name: 'Code'}, {name: 'Physics'}]} />
        </div>
      </section>

      <section id="work" style={{ padding: '100px 10%' }}>
        <h2 className="refract-text" style={{ fontSize: '3rem', marginBottom: '80px' }}>THE_ARCHIVE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px' }}>
          {Object.entries(library).map(([category, items]) => (
            <div key={category}>
              <h3 className="mono-detail" style={{ color: '#D4AF37', marginBottom: '30px' }}>// CATEGORY: {category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {items.map((item, idx) => (
                  <motion.div key={idx} className="smoked-glass z-card" whileHover={{ scale: 1.05 }} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                    {item.type === 'video' ? <video src={item.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '100px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="refract-text" style={{ fontSize: '5rem', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <a key={c} href="#" className="nav-link" style={{ fontSize: '0.8rem' }}>{c}</a>
          ))}
        </div>
        <div style={{ marginTop: '100px', opacity: 0.2, fontSize: '0.6rem', letterSpacing: '5px' }}>© 2026 D'NINJA CINEMATIC. ALL SYSTEMS OPERATIONAL.</div>
      </footer>
    </div>
  );
};

export default App;
