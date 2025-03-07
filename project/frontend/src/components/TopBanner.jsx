import React, { useEffect } from "react";
import "./TopBanner.css";

const TopBanner = () => {
  useEffect(() => {
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let transitionTime = 5000; // Time before transition (5 seconds)
    let transitioning = false;

    let mainRing = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 7,
      maxRadius: 70,
      color: 'rgba(0, 255, 0, 0.8)',
      growth: 0.35,
      state: 'growing',
      electronAngle: Math.random() * Math.PI * 2
    };

    let smallRings = [];
    const smallRingCount = 6;
    let lastSpawnTime = 0;
    const spawnInterval = 500; // 0.5 seconds per ring
    let transitionStartTime = null;

    function drawRing(ring) {
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawArrow(fromX, fromY, toX, toY) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function animate(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mainRing.state === 'growing' && mainRing.radius < mainRing.maxRadius) {
        mainRing.radius += mainRing.growth;
      } else if (mainRing.state === 'growing') {
        mainRing.state = 'complete';
      }

      drawRing(mainRing);

      if (mainRing.state === 'complete') {
        mainRing.electronAngle += 0.002;
        let mainElectronX = mainRing.x + Math.cos(mainRing.electronAngle) * (mainRing.maxRadius + 10);
        let mainElectronY = mainRing.y + Math.sin(mainRing.electronAngle) * (mainRing.maxRadius + 10);
        ctx.beginPath();
        ctx.arc(mainElectronX, mainElectronY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'cyan';
        ctx.fill();
      }

      if (smallRings.length < smallRingCount && timestamp - lastSpawnTime > spawnInterval) {
        const i = smallRings.length;
        let isLeft = i < smallRingCount / 2;
        let offsetX = isLeft ? -150 * (smallRingCount / 2 - i) : 150 * (i - smallRingCount / 2);
        let targetX = mainRing.x + offsetX;
        let targetY = mainRing.y;

        smallRings.push({
          x: mainRing.x + Math.random() * 100 - 50,
          y: mainRing.y + Math.random() * 100 - 50,
          radius: 30,
          color: ['rgba(255, 0, 255, 0.8)', 'rgba(0, 255, 255, 0.8)', 'rgba(255, 255, 0, 0.8)'][i % 3],
          targetX: targetX,
          targetY: targetY,
          transitionProgress: 0,
          electronAngle: Math.random() * Math.PI * 2
        });
        lastSpawnTime = timestamp;
      }

      if (timestamp > transitionTime && !transitioning) {
        transitioning = true;
        transitionStartTime = timestamp;
      }

      smallRings.forEach((ring) => {
        if (transitioning) {
          let progress = (timestamp - transitionStartTime) / 2000; // 2s transition
          if (progress > 1) progress = 1;
          ring.x += (ring.targetX - ring.x) * progress;
          ring.y += (ring.targetY - ring.y) * progress;
        }
        drawRing(ring);
        drawArrow(ring.x, ring.y, mainRing.x, mainRing.y);

        ring.electronAngle += 0.002;
        let electronX = ring.x + Math.cos(ring.electronAngle) * ring.radius;
        let electronY = ring.y + Math.sin(ring.electronAngle) * ring.radius;
        
        ctx.beginPath();
        ctx.arc(electronX, electronY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="banner reduced-space">
      <canvas id="animationCanvas" className="animation-canvas"></canvas>
      <div className="gradient-bg"></div>
      <div className="banner-content"> 
        <p className="banner-subtitle">
          Automate any workflow just by describing it — 10X Faster, at a fraction of the cost
        </p>
        <h1 className="banner-title">
          The era of <span className="highlight">Pharmacovigilance</span> Automation
        </h1>
      </div>
    </div>
  );
};

export default TopBanner;
