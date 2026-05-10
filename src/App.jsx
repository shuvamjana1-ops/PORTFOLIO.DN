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

// --- DIGITAL EXPERIENCE COMPONENTS ---

const VitalityPreloader = ({ onComplete }) => {
  const canvasRef = useRef();
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let fill = 0;
    const animate = () => {
      ctx.clearRect(0, 0, 1000, 1000);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.font = 'bold 150px Playfair Display';
      ctx.strokeText("D'NINJA", 200, 500);
      
      ctx.fillStyle = '#E0E0E0';
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 500 - fill, 1000, fill);
      ctx.clip();
      ctx.fillText("D'NINJA", 200, 500);
      ctx.restore();

      if(fill < 300) fill += 2;
      else setTimeout(onComplete, 1000);
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width="1000" height="1000" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#050505', width: '100%', height: '100%' }} />;
};

const NeuralVoid = () => {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    meshRef.current.material.uniforms.uMouse.value.set(state.mouse.x, state.mouse.y);
  });

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float d = length(p - uMouse);
        float grid = step(0.98, fract(vUv.x * 20.0)) + step(0.98, fract(vUv.y * 20.0));
        float mask = smoothstep(0.4, 0.0, d);
        gl_FragColor = vec4(vec3(0.1, 0.1, 0.1) * grid * mask, 1.0);
      }
    `
  }), []);

  return <mesh ref={meshRef} scale={[50, 50, 1]}><planeGeometry /><shaderMaterial args={[shaderArgs]} transparent /></mesh>;
};

const MicroOrbCursor = () => {
  const dotRef = useRef();
  const ringRef = useRef();
  useEffect(() => {
    const move = (e) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(ringRef.current, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" style={{ transform: 'translate(-50%, -50%)' }} />
    </>
  );
};

const BioDock = ({ name, role, image, skills }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div 
      className="bio-dock" 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
      style={{ padding: '40px', width: '450px', display: 'flex', gap: '30px', position: 'relative' }}
    >
      <img src={image} style={{ width: '120px', height: '180px', objectFit: 'cover', filter: hovered ? 'none' : 'grayscale(1)' }} />
      <div>
        <h3 className="luxury-header" style={{ fontSize: '1.5rem' }}>{name}</h3>
        <p className="mono-detail" style={{ color: '#FFB347' }}>{role}</p>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {skills.map((s, i) => <span key={i} className="mono-detail" style={{ fontSize: '0.6rem', border: '1px solid #333', padding: '4px 8px' }}>{s.name}</span>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const RingClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', inset: 0, border: '1px dashed #FFB347', borderRadius: '50%' }} />
      <div className="mono-detail" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.5rem', color: '#FFB347' }}>
        {time.getSeconds()}S
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const library = useAutoLibrary();
  const { scrollY } = useScroll();

  return (
    <div style={{ background: '#050505', color: '#E0E0E0', minHeight: '100vh' }}>
      <MicroOrbCursor />
      <AnimatePresence>{loading && <VitalityPreloader onComplete={() => setLoading(false)} />}</AnimatePresence>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}><Canvas><NeuralVoid /></Canvas></div>

      <nav className="smoked-glass" style={{ position: 'fixed', top: 40, left: '10%', right: '10%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', zIndex: 1000, borderRadius: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={LogoImg} style={{ height: '20px', filter: 'invert(1)' }} alt="Logo" />
          <span className="luxury-header" style={{ fontSize: '1rem' }}>D'NINJA</span>
        </div>
        <div style={{ display: 'flex', gap: '60px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <motion.a key={l} href={`#${l.toLowerCase()}`} whileHover={{ z: 5, color: '#FFB347' }} className="mono-detail" style={{ textDecoration: 'none', color: '#E0E0E0' }}>{l}</motion.a>
          ))}
        </div>
      </nav>

      <div style={{ position: 'fixed', top: 40, right: '5%', zIndex: 1001, display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div className="mono-detail" style={{ fontSize: '0.5rem', textAlign: 'right' }}>
          SECTOR: WEST BENGAL<br />CONNECTION: SECURE
        </div>
        <RingClock />
      </div>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
        <h1 className="luxury-header" style={{ fontSize: '15vw', margin: 0, lineHeight: 0.8 }}>D'NINJA</h1>
      </section>

      <section id="about" style={{ padding: '100px 10%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <BioDock name="Sumit Dinda" role="Creative Lead" image={SumitImg} skills={[{name: 'UX'}, {name: 'VisDev'}, {name: 'Motion'}]} />
          <BioDock name="Shuvam Jana" role="Tech Architect" image={ShuvamImg} skills={[{name: 'GLSL'}, {name: 'React'}, {name: 'Hardware'}]} />
        </div>
      </section>

      <section id="work" style={{ padding: '100px 10%' }}>
        <h2 className="luxury-header" style={{ fontSize: '3rem', marginBottom: '80px' }}>THE_DYNAMIC_VAULT</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
          {Object.entries(library).map(([category, items]) => (
            <div key={category}>
              <h3 className="mono-detail" style={{ marginBottom: '30px', color: '#FFB347' }}>// {category}</h3>
              <div className="masonry-grid">
                {items.map((item, idx) => (
                  <motion.div key={idx} className="masonry-item" style={{ gridRowEnd: `span ${20 + (idx % 3) * 5}` }}>
                    <div className="glass-reflection" />
                    {item.type === 'video' ? <video src={item.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" style={{ padding: '100px 10%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="luxury-header" style={{ fontSize: '5rem', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <motion.a key={c} href="#" whileHover={{ letterSpacing: '8px', color: '#FFB347' }} className="mono-detail" style={{ fontSize: '0.8rem', textDecoration: 'none', color: '#E0E0E0' }}>{c}</motion.a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
