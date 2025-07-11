import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ 
        color: '#00ff00', 
        fontSize: '16px', 
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        Loading Commodore 64... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// 3D Model Component
function Commodore64Model({ modelPath }: { modelPath: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load the GLTF model
  const gltf = useLoader(GLTFLoader, modelPath);
  
  // No animations - model needs to stay perfectly positioned for terminal overlay
  // useFrame removed to keep model completely static

  useEffect(() => {
    if (gltf.scene) {
      // Center the model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      
      // Scale the model if needed
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      if (maxSize > 3) {
        const scale = 3 / maxSize;
        gltf.scene.scale.setScalar(scale);
      }
    }
  }, [gltf.scene]);

  return (
    <group ref={meshRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Fallback Cube (in case model doesn't load)
function FallbackCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 1.5, 2]} />
      <meshStandardMaterial color="#8B4513" />
      <Html position={[0, 0.8, 0]} center>
        <div style={{ 
          color: '#00ff00', 
          fontSize: '12px', 
          fontFamily: 'monospace',
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '5px',
          borderRadius: '3px'
        }}>
          Commodore 64
        </div>
      </Html>
    </mesh>
  );
}

interface Commodore64Props {
  modelPath?: string;
  width?: string;
  height?: string;
}

const Commodore64: React.FC<Commodore64Props> = ({ 
  modelPath = '/commodore_64.glb', 
  width = '100%',
  height = '400px'
}) => {
  const [modelExists, setModelExists] = useState(false);

  useEffect(() => {
    // Check if model file exists
    fetch(modelPath)
      .then(response => {
        if (response.ok) {
          setModelExists(true);
        }
      })
      .catch(() => {
        console.log('Model not found, using fallback');
        setModelExists(false);
      });
  }, [modelPath]);



  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0.15392431340849985, -0.9696265895263945, 2.0471628502959898], fov: 50 }}
        style={{ background: 'transparent' }}
        onCreated={({ camera }) => {
          // Apply the exact saved camera position and rotation
          camera.position.set(0.15392431340849985, -0.9696265895263945, 2.0471628502959898);
          camera.rotation.set(0.010834586247814715, -0.00010481756764425271, 0.0000011356994144546443);
          camera.updateProjectionMatrix();
        }}
      >
        {/* Lighting optimized for fixed desktop view */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} castShadow />
        <pointLight position={[-5, 3, 3]} intensity={0.4} />
        <pointLight position={[5, -2, -3]} intensity={0.2} />
        
        {/* Environment lighting */}
        <Environment preset="studio" />
        
        {/* 3D Model or Fallback - Fixed position */}
        <Suspense fallback={<Loader />}>
          {modelExists ? (
            <Commodore64Model modelPath={modelPath} />
          ) : (
            <FallbackCube />
          )}
        </Suspense>
        
        {/* No camera controls - model stays perfectly positioned */}
      </Canvas>
    </div>
  );
};

export default Commodore64; 