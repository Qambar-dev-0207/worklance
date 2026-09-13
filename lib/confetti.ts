import confetti from 'canvas-confetti';

/**
 * Safe client-side confetti celebration utilities for milestones,
 * ATS optimization, and account registrations.
 */

export function triggerCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  const count = 160;
  const defaults = {
    origin: { y: 0.8 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Realistic multi-stage explosion
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#FFFFFF', '#3B82F6', '#6366F1'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#10B981', '#34D399', '#6EE7B7'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function triggerScoreBoostConfetti() {
  if (typeof window === 'undefined') return;

  // Dual side cannons
  const end = Date.now() + 600;
  const colors = ['#10B981', '#3B82F6', '#FFFFFF'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: colors,
      zIndex: 99999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: colors,
      zIndex: 99999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
