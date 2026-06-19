import { useEffect, useRef } from 'react';

export default function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Node representation in the plexus constellation
    interface Point {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      glowIntensity: number;
    }

    const points: Point[] = [];
    const numPoints = Math.min(45, Math.floor((width * height) / 11000));
    
    // Cyber color palette matching the illustration's neon cyan/teal/purple notes
    const colors = [
      'rgba(6, 182, 212, ',   // cyan
      'rgba(168, 85, 247, ',  // purple
      'rgba(236, 72, 153, ',  // pink
      'rgba(79, 70, 229, ',   // indigo
    ];

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        glowIntensity: Math.random() * 5 + 3,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      width = canvas.width = parent?.clientWidth || window.innerWidth;
      height = canvas.height = parent?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Space background dark fade
      ctx.fillStyle = '#05050e';
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal & vertical grid lines (very subtle)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw faint, broad light ambient flows beneath the network
      const gradient = ctx.createRadialGradient(
        width / 2, height / 3, 10,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.08)');  // indigo aura
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)'); // violet aura
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update positions & draw links
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce boundaries
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Clip constraints
        if (p1.x < 0) p1.x = 0;
        if (p1.x > width) p1.x = width;
        if (p1.y < 0) p1.y = 0;
        if (p1.y > height) p1.y = height;

        // Draw links to close neighbors
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Threshold for plexus link
          const maxDist = 95;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw Node glow
        ctx.shadowBlur = p1.glowIntensity;
        ctx.shadowColor = p1.color + '0.8)';
        ctx.fillStyle = p1.color + '0.95)';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow properties for lines performance
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
