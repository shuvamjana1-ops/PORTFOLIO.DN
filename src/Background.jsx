import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas } from '@react-three/fiber';

const NeuralNetwork = () => {
  const group = useRef();
  const nodesCount = 120;
  const maxDistance = 6;
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < nodesCount; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        baseVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        )
      });
    }
    return temp;
  }, []);

  const linesRef = useRef();
  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  
  useFrame((state) => {
    const positions = [];
    const scrollSpeed = state.clock.getElapsedTime(); // Placeholder for scroll speed
    
    nodes.forEach((node, i) => {
      // Seaweed-like movement
      const t = state.clock.getElapsedTime();
      node.velocity.x = node.baseVelocity.x + Math.sin(t * 0.5 + i) * 0.005;
      node.velocity.y = node.baseVelocity.y + Math.cos(t * 0.5 + i) * 0.005;
      
      node.position.add(node.velocity);

      // Bounds check
      if (Math.abs(node.position.x) > 25) node.velocity.x *= -1;
      if (Math.abs(node.position.y) > 25) node.velocity.y *= -1;
      if (Math.abs(node.position.z) > 15) node.velocity.z *= -1;

      // Check distances and draw lines
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = node.position.distanceTo(nodes[j].position);
        if (dist < maxDistance) {
          positions.push(
            node.position.x, node.position.y, node.position.z,
            nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
          );
        }
      }
    });

    if (linesRef.current) {
      linesRef.current.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <lineSegments ref={linesRef}>
        <bufferGeometry attach="geometry" />
        <lineBasicMaterial 
          attach="material" 
          color="#00ffff" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
        />
      </lineSegments>
      {/* Visual Nodes */}
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={nodes.length}
            array={new Float32Array(nodes.flatMap(n => [n.position.x, n.position.y, n.position.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial attach="material" size={0.05} color="#00ffff" transparent opacity={0.5} />
      </points>
    </group>
  );
};

const Background = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: -1, 
      pointerEvents: 'none', 
      background: '#070707' 
    }}>
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <NeuralNetwork />
      </Canvas>
    </div>
  );
};

export default Background;
