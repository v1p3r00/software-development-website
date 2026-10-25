/**
 * The 100 effects of the /effects gallery: id (= file name in ./fx), category, name,
 * a one-line hook and a 1–5 "video score" (how well it reads in a 2-second clip).
 * `video: true` marks the ten that have a Remotion short.
 */
export type FxCategory =
  | 'buttons'
  | 'auth'
  | 'cards'
  | 'type'
  | 'cursor'
  | 'loaders'
  | 'controls'
  | 'transitions'
  | 'surfaces'
  | 'feedback';

export interface FxEntry {
  id: string;
  cat: FxCategory;
  name: string;
  hook: string;
  score: 1 | 2 | 3 | 4 | 5;
  video?: boolean;
}

export const CATEGORIES: { id: FxCategory; name: string }[] = [
  { id: 'buttons', name: 'Tactile buttons' },
  { id: 'auth', name: 'Auth & forms' },
  { id: 'cards', name: 'Cards & 3D' },
  { id: 'type', name: 'Typography' },
  { id: 'cursor', name: 'Cursor & pointer' },
  { id: 'loaders', name: 'Loaders & progress' },
  { id: 'controls', name: 'Toggles & controls' },
  { id: 'transitions', name: 'Transitions' },
  { id: 'surfaces', name: 'Surfaces & shaders' },
  { id: 'feedback', name: 'Feedback & delight' },
];

export const CATALOG: FxEntry[] = [
  // ── tactile buttons
  { id: 'balloon-button', cat: 'buttons', name: 'Balloon button', hook: 'An inflated button that dents wherever you press it, then wobbles back.', score: 5, video: true },
  { id: 'jelly-button', cat: 'buttons', name: 'Jelly button', hook: 'Squash, stretch and a wobble that settles like real gelatin.', score: 4 },
  { id: 'keycap-button', cat: 'buttons', name: 'Mechanical keycap', hook: 'A 3D keycap with real travel, a bottom-out and a crisp return.', score: 4 },
  { id: 'magnetic-button', cat: 'buttons', name: 'Magnetic button', hook: 'The button leans toward your cursor and snaps back on a spring.', score: 3 },
  { id: 'liquid-fill-button', cat: 'buttons', name: 'Liquid fill', hook: 'Hover pours colour in from the exact point you entered — and it sloshes.', score: 4 },
  { id: 'hold-to-confirm', cat: 'buttons', name: 'Hold to confirm', hook: 'Press and hold: a ring charges, glows and bursts on completion.', score: 4 },
  { id: 'submit-morph', cat: 'buttons', name: 'Submit morph', hook: 'The button shrinks into a spinner, then blooms into a checkmark.', score: 3 },
  { id: 'clay-button', cat: 'buttons', name: 'Soft clay push', hook: 'A neumorphic button that sinks into the surface like soft clay.', score: 3 },
  { id: 'rubber-button', cat: 'buttons', name: 'Rubber band button', hook: 'Grab it and pull — it stretches like rubber and snaps home.', score: 4 },
  { id: 'big-red-button', cat: 'buttons', name: 'Big red button', hook: 'Flip the safety cover, then press. Everything shakes.', score: 5 },

  // ── auth & forms
  { id: 'glass-login', cat: 'auth', name: 'Glass login → MFA', hook: 'A frosted glass login card that flips in 3D to a one-time code screen.', score: 5, video: true },
  { id: 'otp-snap', cat: 'auth', name: 'OTP snap', hook: 'Code digits drop in and click into their slots; a wrong code shakes.', score: 4 },
  { id: 'password-lamp', cat: 'auth', name: 'Password lamp', hook: 'Pull the lamp cord to shine a light that reveals your password.', score: 5 },
  { id: 'password-creature', cat: 'auth', name: 'Strength creature', hook: 'A little creature grows happier as your password gets stronger.', score: 4 },
  { id: 'fingerprint-scan', cat: 'auth', name: 'Fingerprint scan', hook: 'Hold to scan — the ridges light up one by one, then unlock.', score: 4 },
  { id: 'face-scan', cat: 'auth', name: 'Face scan ring', hook: 'A scanning ring fills tick by tick and resolves into a check.', score: 4 },
  { id: 'ink-input', cat: 'auth', name: 'Ink underline', hook: 'The underline spreads like ink from where you clicked; the label floats.', score: 3 },
  { id: 'drawn-checkbox', cat: 'auth', name: 'Hand-drawn checkbox', hook: 'Each tick is drawn by pen, with a small bounce.', score: 3 },
  { id: 'paper-plane-send', cat: 'auth', name: 'Paper plane send', hook: 'The message folds itself into a paper plane and flies off.', score: 5, video: true },
  { id: 'crack-error', cat: 'auth', name: 'Cracked error', hook: 'A wrong value cracks the field like glass and shakes it.', score: 4 },

  // ── cards & 3D
  { id: 'holo-card', cat: 'cards', name: 'Holographic card', hook: 'A foil trading card: tilt it and the rainbow sheen follows the light.', score: 5, video: true },
  { id: 'depth-card', cat: 'cards', name: 'Depth layers', hook: 'Glass card with three parallax layers that separate as it tilts.', score: 4 },
  { id: 'thick-flip', cat: 'cards', name: 'Thick flip card', hook: 'A card with a real edge flips over and lands with a bounce.', score: 3 },
  { id: 'swipe-stack', cat: 'cards', name: 'Swipe stack', hook: 'Fling cards off the deck with momentum; the next one rises.', score: 4 },
  { id: 'card-expand', cat: 'cards', name: 'Card expand', hook: 'A tile grows into a full detail view in one continuous motion.', score: 3 },
  { id: 'credit-card', cat: 'cards', name: 'Live credit card', hook: 'The card fills in as you type and flips over for the CVV.', score: 4 },
  { id: 'origami-card', cat: 'cards', name: 'Origami unfold', hook: 'A folded note opens panel by panel with real shading.', score: 4 },
  { id: 'spotlight-grid', cat: 'cards', name: 'Spotlight grid', hook: 'A soft light under the cursor lights up borders across the grid.', score: 3 },
  { id: 'magnifier', cat: 'cards', name: 'Magnifier lens', hook: 'A glass lens with real bulge distortion glides over the content.', score: 4 },
  { id: 'polaroid', cat: 'cards', name: 'Polaroid develop', hook: 'Shake the photo and watch it develop out of the grey.', score: 4 },

  // ── typography
  { id: 'scramble-text', cat: 'type', name: 'Decrypt text', hook: 'Characters scramble and lock in, left to right.', score: 3 },
  { id: 'weight-wave', cat: 'type', name: 'Weight wave', hook: 'Letters thicken as the cursor approaches, like a magnetic field.', score: 4 },
  { id: 'liquid-text', cat: 'type', name: 'Liquid text', hook: 'Type ripples like water where the cursor passes.', score: 4 },
  { id: 'split-flap', cat: 'type', name: 'Split-flap board', hook: 'An airport departure board flapping to each new word.', score: 5 },
  { id: 'circle-type', cat: 'type', name: 'Orbit type', hook: 'Text on a circle that spins faster when you spin it.', score: 3 },
  { id: 'falling-letters', cat: 'type', name: 'Falling letters', hook: 'Click a heading: letters drop with gravity and can be thrown.', score: 5 },
  { id: 'ink-heading', cat: 'type', name: 'Ink bleed heading', hook: 'A heading bleeds onto the page like ink on wet paper.', score: 3 },
  { id: 'typewriter', cat: 'type', name: 'Typewriter', hook: 'Keys strike, the carriage moves, the bell dings at the end.', score: 4 },
  { id: 'neon-sign', cat: 'type', name: 'Neon sign', hook: 'A neon sign flickers on, tube by tube, with glow on the wall.', score: 4 },
  { id: 'text-shatter', cat: 'type', name: 'Text shatter', hook: 'Click and the word shatters into shards, then pulls itself back.', score: 5 },

  // ── cursor & pointer
  { id: 'gooey-cursor', cat: 'cursor', name: 'Gooey cursor', hook: 'A blob cursor that melts into the buttons it touches.', score: 4 },
  { id: 'ribbon-trail', cat: 'cursor', name: 'Ribbon trail', hook: 'Silk ribbons follow the cursor and settle with drag.', score: 4 },
  { id: 'flashlight', cat: 'cursor', name: 'Flashlight', hook: 'A dark page — your cursor is a torch that finds what is hidden.', score: 4 },
  { id: 'particle-repel', cat: 'cursor', name: 'Particle field', hook: 'Thousands of particles part around the cursor and flow back.', score: 4 },
  { id: 'grid-warp', cat: 'cursor', name: 'Gravity grid', hook: 'A dot grid bends around the cursor like spacetime.', score: 4 },
  { id: 'googly-eyes', cat: 'cursor', name: 'Googly eyes', hook: 'Eyes with loose pupils that follow you and wobble.', score: 4 },
  { id: 'water-ripple', cat: 'cursor', name: 'Water ripple', hook: 'Tap the surface — real ripples spread, reflect and interfere.', score: 5 },
  { id: 'pixel-trail', cat: 'cursor', name: 'Pixel trail', hook: 'The cursor leaves glowing pixels that fade like a CRT.', score: 3 },
  { id: 'pluck-string', cat: 'cursor', name: 'Pluck string', hook: 'A divider line you can pluck like a guitar string.', score: 5 },
  { id: 'dock-magnify', cat: 'cursor', name: 'Dock magnify', hook: 'Icons swell under the cursor like a desktop dock.', score: 3 },

  // ── loaders & progress
  { id: 'liquid-progress', cat: 'loaders', name: 'Liquid progress', hook: 'A glass sphere fills with sloshing liquid as it loads.', score: 4 },
  { id: 'gooey-dots', cat: 'loaders', name: 'Gooey dots', hook: 'Metaball dots that stretch, merge and split.', score: 3 },
  { id: 'rocket-download', cat: 'loaders', name: 'Rocket download', hook: 'The download button turns into a rocket and launches when done.', score: 4 },
  { id: 'battery-charge', cat: 'loaders', name: 'Battery charge', hook: 'A battery fills with rising bubbles and a spark on full.', score: 3 },
  { id: 'shape-morph', cat: 'loaders', name: 'Shape morph', hook: 'One shape morphs smoothly into the next, forever.', score: 3 },
  { id: 'dna-loader', cat: 'loaders', name: 'DNA helix', hook: 'A rotating double helix built from dots.', score: 3 },
  { id: 'skeleton-reveal', cat: 'loaders', name: 'Skeleton reveal', hook: 'Shimmering placeholders resolve into real content.', score: 3 },
  { id: 'particle-ring', cat: 'loaders', name: 'Particle ring', hook: 'A progress ring that fills with swirling particles.', score: 3 },
  { id: 'hourglass', cat: 'loaders', name: 'Hourglass', hook: 'Real sand grains pour, pile up, and the glass flips.', score: 4 },
  { id: 'file-drop', cat: 'loaders', name: 'File drop', hook: 'A file drops into the folder, which gulps it down.', score: 4 },

  // ── toggles & controls
  { id: 'day-night-toggle', cat: 'controls', name: 'Day / night toggle', hook: 'The sun rolls into a moon; clouds part for stars.', score: 5, video: true },
  { id: 'lamp-cord', cat: 'controls', name: 'Pull-cord lamp', hook: 'Pull the cord and the whole UI switches to dark mode.', score: 5, video: true },
  { id: 'rocker-switch', cat: 'controls', name: 'Rocker switch', hook: 'A chunky physical rocker with a lit indicator.', score: 3 },
  { id: 'elastic-slider', cat: 'controls', name: 'Elastic slider', hook: 'The thumb stretches with speed and the value bubble swings.', score: 4 },
  { id: 'knob-dial', cat: 'controls', name: 'Rotary knob', hook: 'An aluminium knob with detents and an LED ring.', score: 4 },
  { id: 'heart-burst', cat: 'controls', name: 'Heart burst', hook: 'Like it: the heart pops with a ring of confetti.', score: 4 },
  { id: 'star-rating', cat: 'controls', name: 'Star rating', hook: 'Stars fill with a spark and a happy little jump.', score: 3 },
  { id: 'gooey-tabs', cat: 'controls', name: 'Gooey tabs', hook: 'The tab indicator stretches like liquid to its new place.', score: 3 },
  { id: 'segmented-pill', cat: 'controls', name: 'Segmented pill', hook: 'A segmented control whose pill squashes as it slides.', score: 3 },
  { id: 'wave-volume', cat: 'controls', name: 'Wave volume', hook: 'A volume slider drawn as a waveform that grows louder.', score: 3 },

  // ── transitions
  { id: 'page-curl', cat: 'transitions', name: 'Page curl', hook: 'Drag the corner: the page curls with a real shadow.', score: 5 },
  { id: 'fold-accordion', cat: 'transitions', name: 'Paper accordion', hook: 'Sections fold out like a paper map.', score: 4 },
  { id: 'shutter', cat: 'transitions', name: 'Camera shutter', hook: 'An iris shutter closes and opens on the next scene.', score: 4 },
  { id: 'pixel-dissolve', cat: 'transitions', name: 'Pixel dissolve', hook: 'One screen dissolves into the next, block by block.', score: 3 },
  { id: 'liquid-swipe', cat: 'transitions', name: 'Liquid swipe', hook: 'Pull the edge — the next page pours in like liquid.', score: 5 },
  { id: 'portal-zoom', cat: 'transitions', name: 'Portal zoom', hook: 'Zoom through a window into the next screen.', score: 4 },
  { id: 'parallax-hero', cat: 'transitions', name: 'Parallax hero', hook: 'A mountain landscape with layers that move at their own depth.', score: 3 },
  { id: 'curtain', cat: 'transitions', name: 'Theatre curtain', hook: 'Velvet curtains sweep open with folds and sway.', score: 4 },
  { id: 'cube-rotate', cat: 'transitions', name: 'Cube rotate', hook: 'Screens sit on the faces of a cube that turns.', score: 3 },
  { id: 'scroll-fill', cat: 'transitions', name: 'Scroll fill text', hook: 'Words fill with colour as you scroll through them.', score: 3 },

  // ── surfaces & shaders
  { id: 'liquid-glass', cat: 'surfaces', name: 'Liquid glass', hook: 'A glass lens with true refraction and highlights, sliding over content.', score: 5, video: true },
  { id: 'aurora', cat: 'surfaces', name: 'Aurora', hook: 'A slow, soft aurora that bends toward the cursor.', score: 3 },
  { id: 'warp-speed', cat: 'surfaces', name: 'Warp speed', hook: 'Click to jump to light speed.', score: 4 },
  { id: 'lava-lamp', cat: 'surfaces', name: 'Lava lamp', hook: 'Warm blobs rise, merge and split.', score: 3 },
  { id: 'smoke-fluid', cat: 'surfaces', name: 'Ink in water', hook: 'Drag through the water and coloured ink swirls behind you.', score: 5 },
  { id: 'terrain', cat: 'surfaces', name: 'Wireframe terrain', hook: 'An endless retro wireframe landscape flying beneath you.', score: 3 },
  { id: 'bubble-wrap', cat: 'surfaces', name: 'Bubble wrap', hook: 'Bubble wrap you can actually pop. One by one.', score: 5, video: true },
  { id: 'confetti-cannon', cat: 'surfaces', name: 'Confetti cannon', hook: 'Paper confetti with real flutter, drag and spin.', score: 4 },
  { id: 'fireworks', cat: 'surfaces', name: 'Fireworks', hook: 'Tap the sky to launch fireworks.', score: 4 },
  { id: 'rain-glass', cat: 'surfaces', name: 'Rain on glass', hook: 'Raindrops gather, merge and run down the window.', score: 4 },

  // ── feedback & delight
  { id: 'toast-stack', cat: 'feedback', name: 'Toast stack', hook: 'Notifications stack in depth and fan out on hover.', score: 3 },
  { id: 'dynamic-island', cat: 'feedback', name: 'Dynamic island', hook: 'A black pill that morphs into each notification.', score: 5 },
  { id: 'copy-morph', cat: 'feedback', name: 'Copy morph', hook: 'The copy icon morphs into a check with a tiny pop.', score: 3 },
  { id: 'shred-delete', cat: 'feedback', name: 'Shred delete', hook: 'Delete feeds the item through a shredder, strip by strip.', score: 5, video: true },
  { id: 'cart-fly', cat: 'feedback', name: 'Add to cart', hook: 'The product arcs into the cart and the counter bumps.', score: 4 },
  { id: 'pull-refresh', cat: 'feedback', name: 'Elastic pull-to-refresh', hook: 'Pull down: the list stretches like a membrane and snaps.', score: 4 },
  { id: 'swipe-delete', cat: 'feedback', name: 'Swipe to delete', hook: 'Swipe a row away; its neighbours close the gap.', score: 3 },
  { id: 'emoji-float', cat: 'feedback', name: 'Floating reactions', hook: 'Reactions float up and sway like a live stream.', score: 4 },
  { id: 'success-burst', cat: 'feedback', name: 'Success burst', hook: 'A check draws in, rings expand, particles scatter.', score: 3 },
  { id: 'scratch-card', cat: 'feedback', name: 'Scratch card', hook: 'Scratch the foil off with your finger to reveal the prize.', score: 5, video: true },
];

export const VIDEO_IDS = CATALOG.filter((e) => e.video).map((e) => e.id);
