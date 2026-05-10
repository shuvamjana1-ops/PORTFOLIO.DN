import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Float } from '@react-three/drei';
import gsap from 'gsap';

// --- COMPONENTS ---

const MolecularPreloader = ({ onComplete }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let assembling = false;
    
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for(let i=0; i<1000; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          targetX: canvas.width/2 + (Math.random() - 0.5) * 200,
          targetY: canvas.height/2 + (Math.random() - 0.5) * 50
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        if(assembling) {
          p.x += (p.targetX - p.x) * 0.1;
          p.y += (p.targetY - p.y) * 0.1;
        } else {
          p.x += p.vx;
          p.y += p.vy;
          if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }
        ctx.fillStyle = '#fff';
        ctx.fillRect(p.x, p.y, 1, 1);
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();
    setTimeout(() => assembling = true, 2000);
    setTimeout(onComplete, 4000);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />;
};

const PerformanceDial = () => {
  const meshRef = useRef();
  const [scrollSpeed, setScrollSpeed] = useState(0);

  useEffect(() => {
    let lastScroll = window.pageYOffset;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      setScrollSpeed(Math.abs(currentScroll - lastScroll));
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '40px', right: '40px', width: '100px', height: '100px', zIndex: 100 }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <Float speed={2 + scrollSpeed * 0.1} rotationIntensity={2} floatIntensity={2}>
          <Icosahedron args={[1, 0]}>
            <MeshDistortMaterial color="#fff" speed={5} distort={0.3} wireframe />
          </Icosahedron>
        </Float>
      </Canvas>
    </div>
  );
};

const CreatorCard = ({ name, role, image, skills }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div 
      className="creator-card glass-skeuo"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: '500px', position: 'relative', overflow: 'hidden' }}
    >
      <motion.img 
        src={image} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: hovered ? 1 : 0, filter: hovered ? 'none' : 'blur(20px)' }}
        animate={{ y: hovered ? 0 : 50 }}
      />
      <div style={{ position: 'absolute', bottom: 0, padding: '40px', background: 'linear-gradient(transparent, #000)' }}>
        <h3 style={{ fontColor: '#fff', fontSize: '1.5rem' }}>{name}</h3>
        <p style={{ opacity: 0.5 }}>{role}</p>
        <div style={{ fontFamily: 'monospace', marginTop: '10px' }}>
          {hovered && skills.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
              > {s.name}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const cursorRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const onMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.6, ease: "power2.out" });
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', onMouseMove);
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
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div ref={cursorRef} className="aura-cursor" style={{ position: 'fixed', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1000, transform: 'translate(-50%, -50%)', filter: 'blur(10px)' }}></div>
      
      <AnimatePresence>
        {loading && <MolecularPreloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <nav className="navbar" style={{ position: 'fixed', top: 0, width: '100%', padding: '40px 10%', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <div style={{ fontWeight: 900, letterSpacing: '5px' }}>D'NINJA</div>
        <div style={{ display: 'flex', gap: '30px' }}>
          {['HOME', 'ABOUT', 'WORK', 'CONTACT'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ textDecoration: 'none', color: '#fff', fontSize: '0.8rem', letterSpacing: '2px' }}>{l}</a>
          ))}
        </div>
      </nav>

      <section id="home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
        <div style={{ opacity: 0.5, fontFamily: 'monospace', marginBottom: '20px' }}>
          SOLDIER IDENTIFIED. Welcome to the D'NINJA NODE. Time: {time.toLocaleTimeString()}. Location: West Bengal Sector.
        </div>
        <h1 className="hero-title" style={{ fontSize: '8rem', fontWeight: 100, margin: 0 }}>D'NINJA</h1>
      </section>

      <section id="about" style={{ padding: '100px 10%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <CreatorCard name="Sumit Dinda" role="Creative Director" image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" skills={[{name: 'Three.js'}, {name: 'Motion'}]} />
          <CreatorCard name="Shuvam Jana" role="Lead Architect" image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" skills={[{name: 'React'}, {name: 'Physics'}]} />
        </div>
      </section>

      <section id="work" style={{ padding: '100px 10%' }}>
        <h2 style={{ fontWeight: 100, fontSize: '3rem', marginBottom: '60px' }}>KINETIC_GALLERY</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {Object.values(catalog).flat().map((img, i) => (
            <motion.div 
              key={i} 
              className="glass-skeuo" 
              whileHover={{ filter: 'invert(1)', scale: 1.05 }}
              style={{ aspectRatio: '1', overflow: 'hidden' }}
            >
              <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)', backgroundSize: '100% 100px' }}></div>
        <h2 style={{ fontWeight: 100, fontSize: '4rem', marginBottom: '40px' }}>ESTABLISH_COMM</h2>
        <div style={{ display: 'flex', gap: '40px' }}>
          {['INSTAGRAM', 'WHATSAPP', 'EMAIL'].map(c => (
            <motion.button 
              key={c}
              whileTap={{ skewX: 20 }}
              style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '15px 30px', cursor: 'pointer', letterSpacing: '2px' }}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </section>

      <PerformanceDial />
    </div>
  );
};

export default App;
