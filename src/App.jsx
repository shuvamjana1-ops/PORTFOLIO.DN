import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Local Assets
import LogoImg from './assets/identity/logo.png';
const SumitImg = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800";
const ShuvamImg = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800";

// --- THE KINETIC ENGINE ---
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

// --- KINETIC COMPONENTS ---

const VolumetricPreloader = ({ onComplete }) => {
  const meshRef = useRef();
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFill(prev => {
        if(prev >= 1) { clearInterval(timer); setTimeout(onComplete, 1000); return 1; }
        return prev + 0.01;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '300px', height: '300px' }}>
        <Canvas>
          <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshBasicMaterial color="#00FFCC" wireframe opacity={0.3} transparent />
          </mesh>
          <mesh position={[0, -1 + fill, 0]} scale={[2, fill * 2, 2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#00FFCC" />
          </mesh>
          <ambientLight intensity={0.5} />
        </Canvas>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontFamily: 'Syne', fontSize: '1.2rem', letterSpacing: '10px' }}>D'NINJA</div>
      </div>
    </div>
  );
};

const LiquidObsidian = ({ velocity }) => {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    meshRef.current.material.uniforms.uVelocity.value = velocity;
    meshRef.current.material.uniforms.uMouse.value.set(state.mouse.x, state.mouse.y);
  });

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 }, uVelocity: { value: 0 }, uMouse: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime;
      uniform float uVelocity;
      uniform vec2 uMouse;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float d = length(p - uMouse);
        float swirl = sin(d * 10.0 - uTime + uVelocity * 0.01) * 0.5 + 0.5;
        gl_FragColor = vec4(vec3(0.02) * swirl, 1.0);
      }
    `
  }), []);

  return <mesh ref={meshRef} scale={[50, 50, 1]}><planeGeometry /><shaderMaterial args={[shaderArgs]} /></mesh>;
};

const LetterShuffle = ({ text }) => {
  const [display, setDisplay] = useState('');
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(text.split('').map((c, i) => {
        if(i < iteration) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if(iteration >= text.length) clearInterval(interval);
      iteration += 1/3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
};

const FocalCursor = () => {
  const dotRef = useRef();
  const trailRefs = useRef([]);
  useEffect(() => {
    const move = (e) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      trailRefs.current.forEach((ref, i) => {
        gsap.to(ref, { x: e.clientX, y: e.clientY, duration: 0.2 + i * 0.05, ease: "power2.out" });
      });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} ref={el => trailRefs.current[i] = el} className="cursor-trail" style={{ opacity: 0.5 - i * 0.1 }} />
      ))}
      <div ref={dotRef} className="focal-dot" />
    </>
  );
};

// --- MAIN APP ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const library = useAutoLibrary();
  const { scrollY } = useScroll();
  const scrollVel = useVelocity(scrollY);
  const smoothVel = useSpring(scrollVel, { stiffness: 100, damping: 30 });
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    const updateFps = (time) => {
      frames++;
      if (time > lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (time - lastTime)));
        lastTime = time;
        frames = 0;
      }
      requestAnimationFrame(updateFps);
    };
    requestAnimationFrame(updateFps);
    
    scrollY.on("change", (v) => {
      document.documentElement.style.setProperty('--scroll-velocity', Math.abs(scrollVel.get()));
    });
  }, []);

  return (
    <div style={{ background: '#000', color: '#E0E0E0', minHeight: '100vh' }}>
      <FocalCursor />
      <AnimatePresence>{loading && <VolumetricPreloader onComplete={() => setLoading(false)} />}</AnimatePresence>
      
      <div className="hud-status">
        SECTOR: WEST BENGAL<br />
        FPS_MONITOR: {fps} FPS<br />
        SOLDIER_STATUS: AUTHENTICATED
      </div>

      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Canvas><LiquidObsidian velocity={smoothVel.get()} /></Canvas>
      </div>

      <nav style={{ position: 'fixed', top: 40, left: '8%', right: '8%', display: 'flex', justifyContent: 'space-between', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={LogoImg} style={{ height: '25px', filter: 'invert(1)' }} alt="Logo" />
          <h2 className="chromatic-fringe" style={{ fontSize: '1rem', fontFamily: 'Syne' }}>D'NINJA</h2>
        </div>
        <div style={{ display: 'flex', gap: '60px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="chromatic-fringe" style={{ textDecoration: 'none', color: '#E0E0E0', fontSize: '0.6rem', letterSpacing: '4px' }}>{l}</a>
          ))}
        </div>
      </nav>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%' }}>
        <h1 className="chromatic-fringe" style={{ fontSize: '18vw', lineHeight: 0.8, fontFamily: 'Syne', margin: 0 }}>
          <LetterShuffle text="D'NINJA" />
        </h1>
      </section>

      <section id="about" style={{ padding: '100px 8%', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
        {[ {name: "Sumit Dinda", role: "Creative Lead", img: SumitImg}, {name: "Shuvam Jana", role: "Tech Architect", img: ShuvamImg} ].map((p, i) => (
          <motion.div 
            key={i} 
            className="elite-move" 
            whileHover={{ y: -20, boxShadow: '0 40px 100px rgba(0,255,204,0.1)' }}
            style={{ width: '400px', height: '550px', background: 'rgba(255,255,255,0.02)', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}
          >
            <img src={p.img} style={{ width: '100%', height: '70%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.5 }} />
            <h3 className="chromatic-fringe" style={{ fontSize: '1.5rem', marginTop: '30px' }}>{p.name}</h3>
            <p className="mono-detail" style={{ color: '#00FFCC' }}>{p.role}</p>
          </motion.div>
        ))}
      </section>

      <section id="work" style={{ padding: '100px 8%' }}>
        <h2 className="chromatic-fringe" style={{ fontSize: '4rem', marginBottom: '80px', fontFamily: 'Syne' }}>DYNAMIC_VAULT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px' }}>
          {Object.entries(library).map(([category, items]) => (
            <div key={category}>
              <h3 className="mono-detail" style={{ color: '#00FFCC', marginBottom: '30px' }}>// {category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {items.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="carousel-item elite-move" 
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    style={{ aspectRatio: '1', overflow: 'hidden', background: '#111' }}
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
        <h2 className="chromatic-fringe" style={{ fontSize: '8vw', fontFamily: 'Syne', marginBottom: '60px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '100px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <a key={c} href="#" className="chromatic-fringe" style={{ textDecoration: 'none', color: '#00FFCC', fontSize: '0.8rem', letterSpacing: '8px' }}>{c}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
