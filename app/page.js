import Galaxy from './components/Galaxy'
import MagicBento from './components/MagicBento'
import SpaceOrderForm from './components/SpaceOrderForm'

export default function Home() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <section style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <h1
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: '700',
              color: '#ffee00',
              letterSpacing: '0.05em',
              margin: 0,
              lineHeight: 1.1,
              textShadow:
                '0 0 40px rgb(204, 0, 255), 0 0 80px rgba(7, 139, 255, 0.2)',
            }}
          >
            Пироженка
          </h1>

          <p
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
              fontWeight: '400',
              color: 'rgba(255, 0, 119, 0.75)',
              letterSpacing: '0.3em',
              margin: '0.5rem 0 0',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgb(255, 217, 1)',
            }}
          >
            и Эклеры
          </p>
        </div>
      </section>

      <section className="magic-section">
        <div className="magic-bg magic-bg-one" />
        <div className="magic-bg magic-bg-two" />
        <div className="magic-bg magic-bg-three" />
        <div className="magic-stars" />

        <div className="magic-content">
          <div
            style={{
              width: '100%',
              maxWidth: '1180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '48px',
            }}
          >
            <MagicBento
              textAutoHide={true}
              enableStars
              enableSpotlight
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect
              spotlightRadius={400}
              particleCount={12}
              glowColor="132, 0, 255"
              disableAnimations={false}
            />

            <SpaceOrderForm />
          </div>
        </div>
      </section>

      <style>
        {`
          .magic-section {
            position: relative;
            min-height: 100vh;
            width: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 16px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 50% 50%, rgba(132, 0, 255, 0.35), transparent 35%),
              radial-gradient(circle at 20% 20%, rgba(255, 0, 140, 0.22), transparent 30%),
              radial-gradient(circle at 80% 80%, rgba(255, 210, 80, 0.18), transparent 28%),
              linear-gradient(180deg, #000 0%, #080111 45%, #000 100%);
          }

          .magic-content {
            position: relative;
            z-index: 10;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .magic-bg {
            position: absolute;
            border-radius: 999px;
            filter: blur(70px);
            opacity: 0.85;
            pointer-events: none;
            will-change: transform;
            z-index: 1;
          }

          .magic-bg-one {
            width: 420px;
            height: 420px;
            background: rgba(132, 0, 255, 0.55);
            top: 8%;
            left: 8%;
            animation: magicFloatOne 12s ease-in-out infinite alternate;
          }

          .magic-bg-two {
            width: 360px;
            height: 360px;
            background: rgba(255, 0, 140, 0.45);
            right: 10%;
            bottom: 12%;
            animation: magicFloatTwo 14s ease-in-out infinite alternate;
          }

          .magic-bg-three {
            width: 280px;
            height: 280px;
            background: rgba(255, 210, 80, 0.3);
            left: 50%;
            bottom: 5%;
            animation: magicFloatThree 16s ease-in-out infinite alternate;
          }

          .magic-stars {
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            opacity: 0.55;
            background-image:
              radial-gradient(circle, rgba(255, 255, 255, 0.95) 1px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 217, 0, 0.8) 1px, transparent 1.5px),
              radial-gradient(circle, rgba(255, 0, 200, 0.8) 1px, transparent 1.5px);
            background-size: 90px 90px, 140px 140px, 220px 220px;
            background-position: 0 0, 40px 60px, 100px 140px;
            animation: magicStarsMove 22s linear infinite;
          }

          .magic-section::before {
            content: '';
            position: absolute;
            inset: -40%;
            z-index: 3;
            pointer-events: none;
            background:
              conic-gradient(
                from 0deg,
                transparent,
                rgba(132, 0, 255, 0.14),
                transparent,
                rgba(255, 0, 140, 0.14),
                transparent
              );
            animation: magicRotate 28s linear infinite;
          }

          .magic-section::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 4;
            pointer-events: none;
            background:
              linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.75),
                transparent 25%,
                transparent 70%,
                rgba(0, 0, 0, 0.85)
              ),
              radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.55) 100%);
          }

          @keyframes magicFloatOne {
            from {
              transform: translate3d(0, 0, 0) scale(1);
            }

            to {
              transform: translate3d(120px, 80px, 0) scale(1.18);
            }
          }

          @keyframes magicFloatTwo {
            from {
              transform: translate3d(0, 0, 0) scale(1);
            }

            to {
              transform: translate3d(-100px, -90px, 0) scale(1.15);
            }
          }

          @keyframes magicFloatThree {
            from {
              transform: translate3d(-50%, 0, 0) scale(1);
            }

            to {
              transform: translate3d(-35%, -120px, 0) scale(1.25);
            }
          }

          @keyframes magicStarsMove {
            from {
              background-position: 0 0, 40px 60px, 100px 140px;
            }

            to {
              background-position: 300px 500px, -260px 360px, 420px -220px;
            }
          }

          @keyframes magicRotate {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {
            .magic-section {
              padding: 60px 12px;
            }

            .magic-bg-one {
              width: 260px;
              height: 260px;
            }

            .magic-bg-two {
              width: 240px;
              height: 240px;
            }

            .magic-bg-three {
              width: 200px;
              height: 200px;
            }
          }
        `}
      </style>
    </main>
  )
}