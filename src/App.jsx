import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Local Assets
import LogoImg from './assets/identity/logo.png';
const SumitImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
const ShuvamImg = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800";

// --- THE MASTER AUTO-SYNC ---
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

// --- GOD-TIER COMPONENTS ---

const MolecularPreloader = ({ onComplete }) => {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let progress = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for(let i=0; i<1000; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          tx: canvas.width/2 + (Math.random()-0.5)*400,
          ty: canvas.height/2 + (Math.random()-0.5)*150,
          vx: (Math.random()-0.5)*2,
          vy: (Math.random()-0.5)*2
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 3, 3, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        if(progress < 100) {
          p.x += (p.tx - p.x) * 0.05;
          p.y += (p.ty - p.y) * 0.05;
        } else {
          p.x += p.vx * 10;
          p.y += p.vy * 10;
        }
        ctx.fillStyle = '#fff';
        ctx.fillRect(p.x, p.y, 2, 2);
      });
      progress += 0.5;
      if(progress > 120) onComplete();
      else requestAnimationFrame(animate);
    };

    init();
    animate();
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#030303' }} />;
};

const BlackHoleBackground = () => {
  const meshRef = useRef();
  const count = 2000;
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 40;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 40;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return temp;
  }, []);

  useFrame((state) => {
    meshRef.current.rotation.z += 0.001;
    meshRef.current.position.x = state.mouse.x * 2;
    meshRef.current.position.y = state.mouse.y * 2;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00FFCC" transparent opacity={0.3} />
    </points>
  );
};

const PrecisionCursor = () => {
  const dotRef = useRef();
  const ringRef = useRef();
  const [label, setLabel] = useState("");

  useEffect(() => {
    const move = (e) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(ringRef.current, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
    };
    const onHover = (e) => {
      if (e.target.closest('.z-card')) {
        setLabel("VIEW");
        gsap.to(ringRef.current, { width: 60, height: 60, duration: 0.3 });
      }
    };
    const onLeave = () => {
      setLabel("");
      gsap.to(ringRef.current, { width: 20, height: 20, duration: 0.3 });
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', onHover);
    window.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', onHover);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ width: label ? '40px' : '6px', height: label ? '40px' : '6px', borderRadius: label ? '20px' : '50%' }}>
        {label}
      </div>
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

const DepthBio = ({ name, role, image }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div 
      className="frozen-glass z-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
      style={{ width: '450px', height: '600px', overflow: 'hidden', position: 'relative', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <motion.img 
        src={image} 
        animate={{ scale: hovered ? 1.2 : 1, x: hovered ? -20 : 0 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, opacity: 0.4 }} 
      />
      <h3 className="hud-neon" style={{ fontFamily: 'Syne', fontSize: '2rem' }}>{name}</h3>
      <p className="mono-detail" style={{ letterSpacing: '5px' }}>{role}</p>
    </motion.div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const library = useAutoLibrary();
  const { scrollY } = useScroll();
  const scrollVel = useVelocity(scrollY);
  const [skew, setSkew] = useState(0);

  useEffect(() => {
    scrollY.on("change", () => {
      const v = scrollVel.get();
      setSkew(Math.min(Math.max(v / 20, -5), 5));
    });
  }, []);

  return (
    <div style={{ background: '#030303', color: '#E0E0E0', minHeight: '100vh', position: 'relative' }}>
      <PrecisionCursor />
      <AnimatePresence>{loading && <MolecularPreloader onComplete={() => setLoading(false)} />}</AnimatePresence>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Canvas><BlackHoleBackground /></Canvas>
      </div>

      <nav className="frozen-glass" style={{ position: 'fixed', top: 30, left: '5%', right: '5%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={LogoImg} style={{ height: '25px', filter: 'invert(1)' }} alt="Logo" />
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.2rem', margin: 0 }}>D'NINJA</h2>
        </div>
        <div style={{ display: 'flex', gap: '60px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="mono-detail" style={{ textDecoration: 'none', color: '#fff', fontSize: '0.7rem' }}>{l}</a>
          ))}
        </div>
      </nav>

      <div style={{ transform: `skewY(${skew}deg)` }} className="kinetic-skew">
        <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
          <div className="hud-neon mono-detail" style={{ marginBottom: '20px' }}>SENTRY: ACTIVE | WELCOME, SOLDIER | SECTOR: WEST BENGAL</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '15vw', margin: 0, lineHeight: 0.8 }}>D'NINJA</h1>
        </section>

        <section id="about" style={{ padding: '100px 10%', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <DepthBio name="Sumit Dinda" role="Creative Lead" image={SumitImg} />
          <DepthBio name="Shuvam Jana" role="Tech Architect" image={ShuvamImg} />
        </section>

        <section id="work" style={{ padding: '100px 10%' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '3rem', marginBottom: '60px' }}>ARCHIVE_CINEMATIC</h2>
          {Object.entries(library).map(([category, items]) => (
            <div key={category} style={{ marginBottom: '80px' }}>
              <h3 className="hud-neon mono-detail">// {category}</h3>
              <div className="horizontal-slider">
                {items.map((item, idx) => (
                  <motion.div key={idx} className="frozen-glass z-card" style={{ minWidth: '400px', height: '300px', overflow: 'hidden' }}>
                    {item.type === 'video' ? <video src={item.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <footer id="contact" style={{ padding: '100px 10%', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '5rem', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '80px' }}>
            {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
              <motion.a key={c} href="#" whileHover={{ scale: 1.1, color: '#00FFCC' }} className="frozen-glass" style={{ padding: '20px 40px', textDecoration: 'none', color: '#fff' }}>{c}</motion.a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
