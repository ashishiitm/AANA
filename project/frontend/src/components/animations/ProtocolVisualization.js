import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

const ProtocolVisualization = ({ activeStep = -1, completedSteps = {} }) => {
  const containerRef = useRef(null);
  const threeInstanceRef = useRef(null);
  const theme = useTheme();
  
  useEffect(() => {
    if (!containerRef.current || !window.THREE) return;
    
    // Get the container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 300; // Fixed height
    
    // Setup Three.js scene
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    
    // Clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    container.appendChild(renderer.domElement);
    
    // Create nodes for each step
    const nodes = [];
    const nodeGeometry = new window.THREE.SphereGeometry(0.3, 32, 32);
    const activeMaterial = new window.THREE.MeshBasicMaterial({ color: theme.palette.primary.main });
    const completedMaterial = new window.THREE.MeshBasicMaterial({ color: theme.palette.success.main });
    const upcomingMaterial = new window.THREE.MeshBasicMaterial({ color: theme.palette.grey[400] });
    
    // Positions for five nodes in a line with equal spacing
    const totalSteps = 5;
    const spacing = 1.5;
    const startX = -(totalSteps - 1) * spacing / 2;
    
    for (let i = 0; i < totalSteps; i++) {
      let material;
      
      if (i === activeStep) {
        material = activeMaterial;
      } else if (completedSteps[i]) {
        material = completedMaterial;
      } else {
        material = upcomingMaterial;
      }
      
      const node = new window.THREE.Mesh(nodeGeometry, material);
      node.position.x = startX + i * spacing;
      node.position.y = 0;
      node.position.z = 0;
      nodes.push(node);
      scene.add(node);
      
      // Add connecting line to previous node
      if (i > 0) {
        const lineGeometry = new window.THREE.BufferGeometry().setFromPoints([
          new window.THREE.Vector3(nodes[i-1].position.x, 0, 0),
          new window.THREE.Vector3(node.position.x, 0, 0)
        ]);
        
        let lineColor;
        if (i <= activeStep || completedSteps[i]) {
          lineColor = theme.palette.primary.main;
        } else {
          lineColor = theme.palette.grey[300];
        }
        
        const lineMaterial = new window.THREE.LineBasicMaterial({ color: lineColor });
        const line = new window.THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }
    
    // Position camera
    camera.position.z = 5;
    
    // Add floating particles
    const particleGeometry = new window.THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random positions in a box around our nodes
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 5;
      positions[i + 2] = (Math.random() - 0.5) * 5;
      
      // Random sizes
      sizes[i / 3] = Math.random() * 0.1;
    }
    
    particleGeometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new window.THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new window.THREE.PointsMaterial({
      color: theme.palette.primary.light,
      size: 0.1,
      transparent: true
    });
    
    const particles = new window.THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Animation loop
    const animate = () => {
      const frame = requestAnimationFrame(animate);
      
      // Rotate nodes slightly 
      nodes.forEach((node, index) => {
        node.rotation.y += 0.01;
        
        // Pulse the active node
        if (index === activeStep) {
          const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
          node.scale.set(scale, scale, scale);
        }
      });
      
      // Animate particles
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Set up resize handling
    const handleResize = () => {
      const width = container.clientWidth;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Store the instance for cleanup
    threeInstanceRef.current = {
      animate,
      cleanup: () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animate);
        renderer.dispose();
        scene.clear();
      }
    };
    
    return () => {
      if (threeInstanceRef.current) {
        threeInstanceRef.current.cleanup();
      }
    };
  }, [activeStep, completedSteps, theme]);
  
  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: 300,
        overflow: 'hidden'
      }}
    />
  );
};

export default ProtocolVisualization; 