"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W,
      H,
      particles,
      blips = [],
      angle = 0,
      animId;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.28,
        dy: (Math.random() - 0.5) * 0.28,
        o: Math.random() * 0.45 + 0.08,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R = Math.sqrt(cx * cx + cy * cy) * 1.08;

      // 12-second rotation
      const SPEED = (2 * Math.PI) / (12 * 60);
      angle = (angle + SPEED) % (2 * Math.PI);

      // Ambient particles (dim)
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(119,141,169,${p.o * 0.35})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });

      // Rings
      [0.25, 0.5, 0.75, 1].forEach((f) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(65,90,119,0.18)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Cross-hairs
      ctx.strokeStyle = "rgba(65,90,119,0.12)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // Sweep trail
      const TRAIL = Math.PI * 0.55;
      const STEPS = 52;
      for (let i = 0; i < STEPS; i++) {
        const t = i / STEPS;
        const a0 = angle - TRAIL * (1 - t);
        const a1 = angle - TRAIL * (1 - (i + 1) / STEPS);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R * 1.1, a0, a1);
        ctx.closePath();
        ctx.fillStyle = `rgba(119,141,169,${t * 0.09})`;
        ctx.fill();
      }

      // Leading edge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle) * R * 1.1,
        cy + Math.sin(angle) * R * 1.1,
      );
      ctx.strokeStyle = "rgba(119,141,169,0.6)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Spawn blips when sweep passes a particle
      const now = Date.now();
      particles.forEach((p) => {
        const pa = Math.atan2(p.y - cy, p.x - cx);
        const diff =
          (((angle - pa) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (diff < 0.07) {
          const hit = blips.some(
            (b) => Math.abs(b.x - p.x) < 4 && Math.abs(b.y - p.y) < 4,
          );
          if (!hit) blips.push({ x: p.x, y: p.y, born: now, life: 2800 });
        }
      });

      // Draw & age blips
      blips = blips.filter((b) => now - b.born < b.life);
      blips.forEach((b) => {
        const prog = (now - b.born) / b.life;
        const alpha = (1 - prog) * 0.9;
        const r = 1.8 + prog * 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(119,141,169,${alpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.x, b.y, r + 2 + prog * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(119,141,169,${alpha * 0.28})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    const onResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="relative min-h-svh w-full flex items-center justify-center overflow-hidden">
      {/* ── Background layers ── */}
      <div className="fixed inset-0 z-0" style={{ background: "#0d1b2a" }} />
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 110%, #1b263b 0%, transparent 60%),
            radial-gradient(ellipse 80%  60% at 80% -10%,  #415a77 0%, transparent 50%),
            radial-gradient(ellipse 60%  40% at 10%  20%,  #1b263b 0%, transparent 55%)
          `,
        }}
      />
      <div
        className="fixed inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, #0d1b2a 100%)",
        }}
      />

      {/* ── Radar canvas ── */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[3] pointer-events-none"
      />

      {/* ── Page content ── */}
      <div className="relative z-10 flex flex-col items-center w-full min-h-svh px-6 py-12 justify-between">
        {/* Logo */}
        <div className="anim-1 flex items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="#778da9"
              strokeWidth="1"
              opacity="0.6"
            />
            <circle
              cx="24"
              cy="24"
              r="14"
              stroke="#778da9"
              strokeWidth="1"
              opacity="0.35"
            />
            <circle cx="24" cy="24" r="6" fill="#778da9" opacity="0.85" />
            <line
              x1="24"
              y1="2"
              x2="24"
              y2="10"
              stroke="#778da9"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <line
              x1="24"
              y1="38"
              x2="24"
              y2="46"
              stroke="#778da9"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <line
              x1="2"
              y1="24"
              x2="10"
              y2="24"
              stroke="#778da9"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <line
              x1="38"
              y1="24"
              x2="46"
              y2="24"
              stroke="#778da9"
              strokeWidth="1.5"
              opacity="0.7"
            />
          </svg>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.28em",
              color: "#778da9",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            WEATHERFUND
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center text-center flex-1 justify-center py-8 gap-0">
          <p
            className="anim-2 mb-6"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.35em",
              color: "#415a77",
              fontWeight: 400,
            }}
          >
            INTELLIGENCE · SIGNAL · PROFIT
          </p>

          <h1
            className="flex flex-col items-center leading-[0.9] mb-8"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            <span
              className="anim-3"
              style={{
                fontSize: "clamp(68px,15vw,148px)",
                color: "#e0e1dd",
                display: "block",
              }}
            >
              READ
            </span>
            <span
              className="hl-shimmer"
              style={{ fontSize: "clamp(48px,15vw,108px)", display: "block" }}
            >
              THE SKY.
            </span>
            <span
              className="anim-5"
              style={{
                fontSize: "clamp(48px,15vw,108px)",
                color: "#778da9",
                display: "block",
              }}
            >
              TRADE THE
            </span>
            <span
              className="anim-6"
              style={{
                fontSize: "clamp(48px,15vw,108px)",
                color: "#415a77",
                display: "block",
              }}
            >
              FUTURE.
            </span>
          </h1>

          <p
            className="anim-7 mb-9 max-w-lg"
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(14px,2vw,17px)",
              lineHeight: 1.75,
              color: "#778da9",
            }}
          >
            Weather patterns move markets. We decode both.
            <br />
            Real-time signals, climate alpha, and community-driven intelligence
            — delivered straight to your feed.
          </p>

          {/* Divider */}
          <div className="anim-8 flex items-center gap-3 mb-12">
            <span
              style={{
                width: 56,
                height: 1,
                background: "linear-gradient(90deg, transparent, #415a77)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#415a77",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 56,
                height: 1,
                background: "linear-gradient(90deg, #415a77, transparent)",
                display: "inline-block",
              }}
            />
          </div>

          {/* CTA */}
          <a
            href="https://t.me/weatherfund"
            target="_blank"
            rel="noopener noreferrer"
            className="anim-9 cta-btn flex items-center gap-3 px-10 py-4"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#e0e1dd",
              textDecoration: "none",
              padding: "0 12px",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: "#778da9",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.14 13.566l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.953z" />
              </svg>
            </span>
            <span>Join the Channel</span>
            <span
              className="cta-arrow"
              style={{ color: "#778da9", fontSize: "17px" }}
            >
              →
            </span>
          </a>

          <p
            className="anim-10 mt-3"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: "#415a77",
            }}
          >
            FREE TO JOIN · NO SPAM · PURE SIGNAL
          </p>
        </div>

        {/* Status bar */}
        <div
          className="anim-10 flex items-center gap-2 px-5 py-3"
          style={{
            border: "1px solid rgba(65,90,119,0.3)",
            background: "rgba(13,27,42,0.7)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="pulse-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#778da9",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: "#415a77",
            }}
          >
            LIVE CHANNEL
          </span>
          <span style={{ color: "#1b263b" }}>·</span>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: "#415a77",
            }}
          >
            weatherfund.xyz
          </span>
        </div>
      </div>
    </main>
  );
}
