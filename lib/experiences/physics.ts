/* SOKKAR — Physics experiences (20). SI units throughout. */
import { formulaExperience, fmt } from './shared';
import type { Experience } from '../types';

const PI = Math.PI;

export const physicsExperiences: Experience[] = [
  formulaExperience({
    slug: 'uniform-linear-motion',
    title: 'Uniform Linear Motion',
    category: 'physics', difficulty: 'Beginner', duration: 10, featured: true,
    description: 'Find the constant velocity of an object travelling a known distance in a known time.',
    keywords: ['velocity', 'speed', 'distance', 'time', 'motion', 'kinematics', 'v = s / t'],
    concept: [
      'When an object covers equal distances in equal intervals of time, it is moving with uniform velocity. A car cruising on a straight motorway at a steady 25 metres per second is a classic example.',
      'Velocity tells us how fast position changes. It is the single signed quantity that captures both how fast and in which direction motion happens. Average velocity over any interval equals the total displacement divided by the total time.',
    ],
    formula: 'v = s / t',
    formulaNote: 'Valid for motion at constant velocity (or for average velocity over an interval).',
    variables: [
      { symbol: 'v', meaning: 'Average velocity', unit: 'm/s' },
      { symbol: 's', meaning: 'Displacement (distance along a straight line)', unit: 'm' },
      { symbol: 't', meaning: 'Time interval', unit: 's' },
    ],
    assumptions: ['Motion is along a straight line.', 'Velocity is constant, or we want the average over the interval.', 'Time is strictly positive.'],
    inputDefs: [
      { id: 's', label: 'Distance', unit: 'm', type: 'number', default: '120', placeholder: 'e.g. 120' },
      { id: 't', label: 'Time', unit: 's', type: 'number', default: '10', placeholder: 'e.g. 10' },
    ],
    inputLabel: 'Read distance, time', validateLabel: 'time > 0?', computeLabel: 'v = s ÷ t', outputLabel: 'Display velocity',
    validate: v => (v.t > 0 ? null : 'Time must be greater than zero.'),
    solve: v => ({
      steps: [
        { text: `Substitute values: v = ${fmt(v.s)} ÷ ${fmt(v.t)}` },
        { text: `v = ${fmt(v.s / v.t)} m/s`, vars: { s: v.s, t: v.t, v: fmt(v.s / v.t) } },
      ],
      output: `v = ${fmt(v.s / v.t)} m/s`, value: v.s / v.t,
    }),
    workedExample: {
      title: 'A runner completes 100 m in 12.5 s',
      steps: ['Write down the formula: v = s ÷ t', 'Substitute: v = 100 ÷ 12.5', 'Divide: v = 8 m/s'],
      result: 'Average velocity = 8 m/s',
    },
    challenge: { mode: 'numeric', question: 'A cyclist travels 150 m in 30 s at constant velocity. What is the velocity?', answer: '5', unit: 'm/s', tolerance: 0.01, explanation: 'v = s ÷ t = 150 ÷ 30 = 5 m/s.' },
    related: ['acceleration-calculator', 'free-fall', 'circular-motion'],
  }),

  formulaExperience({
    slug: 'acceleration-calculator',
    title: 'Acceleration Calculator',
    category: 'physics', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'Compute acceleration from a change in velocity over a time interval.',
    keywords: ['acceleration', 'velocity', 'change', 'a = (v - u) / t', 'kinematics', 'deceleration'],
    concept: [
      'Acceleration measures how quickly velocity changes. If a car’s speed rises from 0 to 20 m/s in 5 s, it accelerates at 4 metres per second per second.',
      'Acceleration is a signed quantity. A positive value means velocity is increasing in the chosen direction; a negative value (sometimes called deceleration) means it is decreasing.',
    ],
    formula: 'a = (v − u) / t',
    formulaNote: 'Gives average acceleration over the interval. For instantaneous acceleration, the interval approaches zero.',
    variables: [
      { symbol: 'a', meaning: 'Average acceleration', unit: 'm/s²' },
      { symbol: 'u', meaning: 'Initial velocity', unit: 'm/s' },
      { symbol: 'v', meaning: 'Final velocity', unit: 'm/s' },
      { symbol: 't', meaning: 'Time interval', unit: 's' },
    ],
    assumptions: ['Acceleration is constant, or you want the average value.', 'Time is strictly positive.', 'Sign of a follows the sign of (v − u).'],
    inputDefs: [
      { id: 'u', label: 'Initial velocity u', unit: 'm/s', type: 'number', default: '4' },
      { id: 'v', label: 'Final velocity v', unit: 'm/s', type: 'number', default: '24' },
      { id: 't', label: 'Time', unit: 's', type: 'number', default: '5' },
    ],
    inputLabel: 'Read u, v, t', validateLabel: 't > 0?', computeLabel: 'a = (v − u) ÷ t', outputLabel: 'Display acceleration',
    validate: v => (v.t > 0 ? null : 'Time must be greater than zero.'),
    solve: v => ({
      steps: [
        { text: `Change in velocity: v − u = ${fmt(v.v)} − ${fmt(v.u)} = ${fmt(v.v - v.u)} m/s` },
        { text: `a = ${fmt(v.v - v.u)} ÷ ${fmt(v.t)} = ${fmt((v.v - v.u) / v.t)} m/s²`, vars: { u: v.u, v: v.v, t: v.t, a: fmt((v.v - v.u) / v.t) } },
      ],
      output: `a = ${fmt((v.v - v.u) / v.t)} m/s²`, value: (v.v - v.u) / v.t,
    }),
    workedExample: {
      title: 'A car speeds up from rest to 27 m/s in 9 s',
      steps: ['Formula: a = (v − u) ÷ t', 'Substitute: a = (27 − 0) ÷ 9', 'Compute: a = 3 m/s²'],
      result: 'Acceleration = 3 m/s²',
    },
    challenge: { mode: 'numeric', question: 'A train moving at 30 m/s brakes to 10 m/s in 8 s. What is its acceleration (signed)?', answer: '-2.5', unit: 'm/s²', tolerance: 0.01, explanation: 'a = (10 − 30) ÷ 8 = −20 ÷ 8 = −2.5 m/s². Negative sign = slowing down.' },
    related: ['newtons-second-law', 'uniform-linear-motion', 'free-fall'],
  }),

  formulaExperience({
    slug: 'newtons-second-law',
    title: "Newton's Second Law",
    category: 'physics', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'Calculate the resultant force acting on a mass undergoing acceleration.',
    keywords: ['force', 'mass', 'acceleration', 'newton', 'F = ma', 'dynamics'],
    concept: [
      'Newton’s Second Law is the rule that connects force, mass and acceleration: the resultant force on an object equals its mass multiplied by its acceleration.',
      'Double the force and the acceleration doubles. Double the mass and the same force produces half the acceleration. This single law powers everything from rocket design to car crash analysis.',
    ],
    formula: 'F = m × a',
    formulaNote: 'F is the resultant (net) force acting on the body, in the direction of acceleration.',
    variables: [
      { symbol: 'F', meaning: 'Resultant force', unit: 'N (kg·m/s²)' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'a', meaning: 'Acceleration', unit: 'm/s²' },
    ],
    assumptions: ['Force is the net force after all forces are combined.', 'Mass is constant (non-relativistic speeds).', 'Use a consistent sign convention.'],
    inputDefs: [
      { id: 'm', label: 'Mass', unit: 'kg', type: 'number', default: '800' },
      { id: 'a', label: 'Acceleration', unit: 'm/s²', type: 'number', default: '2' },
    ],
    inputLabel: 'Read mass, acceleration', validateLabel: 'mass ≥ 0?', computeLabel: 'F = m × a', outputLabel: 'Display force',
    validate: v => (v.m >= 0 ? null : 'Mass cannot be negative.'),
    solve: v => ({
      steps: [
        { text: `Substitute: F = ${fmt(v.m)} kg × ${fmt(v.a)} m/s²` },
        { text: `F = ${fmt(v.m * v.a)} N`, vars: { m: v.m, a: v.a, F: fmt(v.m * v.a) } },
      ],
      output: `F = ${fmt(v.m * v.a)} N`, value: v.m * v.a,
    }),
    workedExample: {
      title: 'Pushing a 15 kg trolley at 2 m/s²',
      steps: ['Formula: F = m × a', 'Substitute: F = 15 × 2', 'Compute: F = 30 N'],
      result: 'Required force = 30 N',
    },
    challenge: { mode: 'numeric', question: 'What force accelerates a 1200 kg car at 1.5 m/s²?', answer: '1800', unit: 'N', tolerance: 0.5, explanation: 'F = 1200 × 1.5 = 1800 N.' },
    related: ['weight-calculator', 'friction-force', 'acceleration-calculator'],
  }),

  formulaExperience({
    slug: 'weight-calculator',
    title: 'Weight Calculator',
    category: 'physics', difficulty: 'Beginner', duration: 8,
    description: 'Find the weight of a body from its mass and the local gravitational acceleration.',
    keywords: ['weight', 'gravity', 'mass', 'W = mg', 'force'],
    concept: [
      'In everyday language, “weight” and “mass” are used interchangeably, but in physics they are different. Mass is the amount of matter; weight is the gravitational force pulling on that matter.',
      'Weight depends on where you are. The same 10 kg object weighs 98.1 N on Earth, about 16.2 N on the Moon, and would be nearly weightless far from any planet.',
    ],
    formula: 'W = m × g',
    variables: [
      { symbol: 'W', meaning: 'Weight (gravitational force)', unit: 'N' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational field strength', unit: 'N/kg (m/s²)' },
    ],
    assumptions: ['g is constant near the surface — 9.81 m/s² on Earth.', 'Moon: g ≈ 1.62 m/s². Mars: g ≈ 3.71 m/s².'],
    inputDefs: [
      { id: 'm', label: 'Mass', unit: 'kg', type: 'number', default: '65' },
      { id: 'g', label: 'Gravitational acceleration g', unit: 'm/s²', type: 'number', default: '9.81' },
    ],
    inputLabel: 'Read mass, g', validateLabel: 'm ≥ 0 and g > 0?', computeLabel: 'W = m × g', outputLabel: 'Display weight',
    validate: v => (v.m >= 0 && v.g > 0 ? null : 'Mass must be ≥ 0 and g must be greater than 0.'),
    solve: v => ({
      steps: [
        { text: `Substitute: W = ${fmt(v.m)} kg × ${fmt(v.g)} m/s²` },
        { text: `W = ${fmt(v.m * v.g)} N`, vars: { m: v.m, g: v.g, W: fmt(v.m * v.g) } },
      ],
      output: `W = ${fmt(v.m * v.g)} N`, value: v.m * v.g,
    }),
    workedExample: {
      title: 'Weight of a 60 kg student on Earth',
      steps: ['Formula: W = m × g', 'Substitute: W = 60 × 9.81', 'Compute: W = 588.6 N'],
      result: 'Weight = 588.6 N',
    },
    challenge: { mode: 'numeric', question: 'What is the weight of a 10 kg object on the Moon (g = 1.62 m/s²)?', answer: '16.2', unit: 'N', tolerance: 0.05, explanation: 'W = 10 × 1.62 = 16.2 N.' },
    related: ['newtons-second-law', 'gravitational-potential-energy', 'free-fall'],
  }),

  formulaExperience({
    slug: 'density-calculator',
    title: 'Density Calculator',
    category: 'physics', difficulty: 'Beginner', duration: 10,
    description: 'Determine density from mass and volume — and compare materials quantitatively.',
    keywords: ['density', 'mass', 'volume', 'rho', 'materials', 'buoyancy'],
    concept: [
      'Density tells you how much mass is packed into a given volume. Lead is dense because a small block of it is very heavy; polystyrene is light because the same volume holds far less mass.',
      'Density explains why ships float: a steel hull encloses trapped air so the average density of the whole ship is less than that of water.',
    ],
    formula: 'ρ = m / V',
    variables: [
      { symbol: 'ρ', meaning: 'Density (rho)', unit: 'kg/m³' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'V', meaning: 'Volume', unit: 'm³' },
    ],
    assumptions: ['Volume must not be zero — density is undefined there.', 'Temperature and pressure affect density of fluids; the value here assumes constant conditions.'],
    inputDefs: [
      { id: 'm', label: 'Mass', unit: 'kg', type: 'number', default: '7.8' },
      { id: 'V', label: 'Volume', unit: 'm³', type: 'number', default: '0.001' },
    ],
    inputLabel: 'Read mass, volume', validateLabel: 'V > 0 and m ≥ 0?', computeLabel: 'ρ = m ÷ V', outputLabel: 'Display density',
    validate: v => (v.V > 0 && v.m >= 0 ? null : 'Mass must be ≥ 0 and volume must be greater than 0.'),
    solve: v => ({
      steps: [
        { text: `Substitute: ρ = ${fmt(v.m)} kg ÷ ${fmt(v.V)} m³` },
        { text: `ρ = ${fmt(v.m / v.V)} kg/m³`, vars: { m: v.m, V: v.V, rho: fmt(v.m / v.V) } },
      ],
      output: `ρ = ${fmt(v.m / v.V)} kg/m³`, value: v.m / v.V,
    }),
    workedExample: {
      title: 'Density of a metal block: 7.8 kg occupying 0.001 m³',
      steps: ['Formula: ρ = m ÷ V', 'Substitute: ρ = 7.8 ÷ 0.001', 'Compute: ρ = 7800 kg/m³ (iron)'],
      result: 'Density ≈ 7800 kg/m³',
    },
    challenge: { mode: 'numeric', question: 'A sample of 500 g occupies 0.0002 m³? What is its density in kg/m³?', answer: '2500', unit: 'kg/m³', tolerance: 1, explanation: '500 g = 0.5 kg; ρ = 0.5 ÷ 0.0002 = 2500 kg/m³.' },
    related: ['pressure-calculator', 'hookes-law', 'weight-calculator'],
  }),

  formulaExperience({
    slug: 'pressure-calculator',
    title: 'Pressure Calculator',
    category: 'physics', difficulty: 'Beginner', duration: 10,
    description: 'See how force spread over an area produces pressure — from knife edges to snowshoes.',
    keywords: ['pressure', 'force', 'area', 'pascal', 'P = F / A'],
    concept: [
      'Pressure is force per unit area. The same force produces very different pressures depending on the area it acts on — which is why sharp knives cut and wide snowshoes stop you sinking.',
      'One pascal (Pa) is one newton per square metre. Atmospheric pressure at sea level is about 101,325 Pa.',
    ],
    formula: 'P = F / A',
    variables: [
      { symbol: 'P', meaning: 'Pressure', unit: 'Pa (N/m²)' },
      { symbol: 'F', meaning: 'Force normal to the surface', unit: 'N' },
      { symbol: 'A', meaning: 'Area over which the force acts', unit: 'm²' },
    ],
    assumptions: ['Force acts perpendicular (normal) to the surface.', 'Area is strictly positive.'],
    inputDefs: [
      { id: 'F', label: 'Force', unit: 'N', type: 'number', default: '500' },
      { id: 'A', label: 'Area', unit: 'm²', type: 'number', default: '0.25' },
    ],
    inputLabel: 'Read force, area', validateLabel: 'A > 0?', computeLabel: 'P = F ÷ A', outputLabel: 'Display pressure',
    validate: v => (v.A > 0 ? null : 'Area must be greater than 0.'),
    solve: v => ({
      steps: [
        { text: `Substitute: P = ${fmt(v.F)} N ÷ ${fmt(v.A)} m²` },
        { text: `P = ${fmt(v.F / v.A)} Pa`, vars: { F: v.F, A: v.A, P: fmt(v.F / v.A) } },
      ],
      output: `P = ${fmt(v.F / v.A)} Pa`, value: v.F / v.A,
    }),
    workedExample: {
      title: '500 N resting on 0.25 m²',
      steps: ['Formula: P = F ÷ A', 'Substitute: P = 500 ÷ 0.25', 'Compute: P = 2000 Pa'],
      result: 'Pressure = 2000 Pa',
    },
    challenge: { mode: 'numeric', question: 'A 1200 N force spreads over 3 m². What pressure results?', answer: '400', unit: 'Pa', tolerance: 0.5, explanation: 'P = 1200 ÷ 3 = 400 Pa.' },
    related: ['density-calculator', 'newtons-second-law', 'friction-force'],
  }),

  formulaExperience({
    slug: 'work-calculator',
    title: 'Work Calculator',
    category: 'physics', difficulty: 'Intermediate', duration: 15,
    description: 'Compute mechanical work, including the angle between force and displacement.',
    keywords: ['work', 'force', 'displacement', 'angle', 'cosine', 'W = Fd cos θ', 'energy'],
    concept: [
      'In physics, work is done only when a force moves something. Carrying a heavy box across a room horizontally does no work on the box against gravity (but you burn energy biologically). Lifting it does.',
      'Only the component of force along the displacement transfers energy: W = F d cos θ. At 90°, no work is done; above 90°, work is negative — energy is taken out of the motion.',
    ],
    formula: 'W = F × d × cos(θ)',
    variables: [
      { symbol: 'W', meaning: 'Work done', unit: 'J (N·m)' },
      { symbol: 'F', meaning: 'Force magnitude', unit: 'N' },
      { symbol: 'd', meaning: 'Displacement magnitude', unit: 'm' },
      { symbol: 'θ', meaning: 'Angle between force and displacement', unit: 'degrees' },
    ],
    assumptions: ['θ is measured in degrees, between 0 and 180.', 'Force is constant over the displacement.', 'Negative work (θ > 90°) removes energy from the motion.'],
    inputDefs: [
      { id: 'F', label: 'Force', unit: 'N', type: 'number', default: '40' },
      { id: 'd', label: 'Displacement', unit: 'm', type: 'number', default: '12' },
      { id: 'theta', label: 'Angle θ', unit: '°', type: 'number', default: '30' },
    ],
    inputLabel: 'Read force, displacement, θ', validateLabel: '0° ≤ θ ≤ 180°?', computeLabel: 'W = F × d × cos θ', outputLabel: 'Display work',
    validate: v => (v.theta >= 0 && v.theta <= 180 ? null : 'Angle must be between 0° and 180°.'),
    solve: v => {
      const rad = (v.theta * PI) / 180;
      const w = v.F * v.d * Math.cos(rad);
      return {
        steps: [
          { text: `Convert angle: θ = ${fmt(v.theta)}° = ${fmt(rad, 4)} rad` },
          { text: `cos(${fmt(v.theta)}°) = ${fmt(Math.cos(rad), 4)}` },
          { text: `W = ${fmt(v.F)} × ${fmt(v.d)} × ${fmt(Math.cos(rad), 4)} = ${fmt(w)} J`, vars: { F: v.F, d: v.d, theta: v.theta, W: fmt(w) } },
        ],
        output: `W = ${fmt(w)} J`, value: w,
      };
    },
    workedExample: {
      title: 'Dragging a box: 40 N at 30° over 12 m',
      steps: ['Formula: W = F d cos θ', 'Substitute: W = 40 × 12 × cos 30°', 'cos 30° ≈ 0.866', 'W ≈ 480 × 0.866 ≈ 415.7 J'],
      result: 'Work ≈ 415.7 J',
    },
    challenge: { mode: 'numeric', question: 'How much work does a 50 N force do over 8 m when pushing straight ahead (θ = 0°)?', answer: '400', unit: 'J', tolerance: 0.5, explanation: 'cos 0° = 1, so W = 50 × 8 × 1 = 400 J.' },
    related: ['power-calculator', 'kinetic-energy', 'newtons-second-law'],
  }),

  formulaExperience({
    slug: 'kinetic-energy',
    title: 'Kinetic Energy',
    category: 'physics', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'Calculate the energy of motion from mass and velocity, and see the v² dependence.',
    keywords: ['kinetic', 'energy', 'motion', ' Ek = 1/2 mv2', 'collision'],
    concept: [
      'Anything moving carries energy of motion — kinetic energy. It depends on mass linearly, but on velocity as a square: doubling speed quadruples the energy.',
      'That v² dependence is why high-speed collisions are so much more destructive, and why braking distances grow so quickly with speed.',
    ],
    formula: 'Ek = ½ × m × v²',
    variables: [
      { symbol: 'Ek', meaning: 'Kinetic energy', unit: 'J' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'v', meaning: 'Speed (magnitude of velocity)', unit: 'm/s' },
    ],
    assumptions: ['Speed here is a magnitude, so v² makes direction irrelevant.', 'Classical mechanics — speeds well below light speed.'],
    inputDefs: [
      { id: 'm', label: 'Mass', unit: 'kg', type: 'number', default: '0.145' },
      { id: 'v', label: 'Velocity', unit: 'm/s', type: 'number', default: '40' },
    ],
    inputLabel: 'Read mass, velocity', validateLabel: 'mass ≥ 0?', computeLabel: 'Ek = ½ m v²', outputLabel: 'Display kinetic energy',
    validate: v => (v.m >= 0 ? null : 'Mass cannot be negative.'),
    solve: v => {
      const ek = 0.5 * v.m * v.v * v.v;
      return {
        steps: [
          { text: `v² = ${fmt(v.v)}² = ${fmt(v.v * v.v)}` },
          { text: `Ek = ½ × ${fmt(v.m)} × ${fmt(v.v * v.v)} = ${fmt(ek)} J`, vars: { m: v.m, v: v.v, Ek: fmt(ek) } },
        ],
        output: `Ek = ${fmt(ek)} J`, value: ek,
      };
    },
    workedExample: {
      title: 'A 0.145 kg baseball at 40 m/s',
      steps: ['Formula: Ek = ½ m v²', 'v² = 1600', 'Ek = 0.5 × 0.145 × 1600', 'Ek = 116 J'],
      result: 'Kinetic energy = 116 J',
    },
    challenge: { mode: 'numeric', question: 'A 1000 kg car moves at 20 m/s. What is its kinetic energy?', answer: '200000', unit: 'J', tolerance: 1, explanation: 'Ek = ½ × 1000 × 400 = 200,000 J (200 kJ).' },
    related: ['gravitational-potential-energy', 'power-calculator', 'momentum-calculator'],
  }),

  formulaExperience({
    slug: 'gravitational-potential-energy',
    title: 'Gravitational Potential Energy',
    category: 'physics', difficulty: 'Beginner', duration: 10,
    description: 'Energy stored by height above a reference level.',
    keywords: ['potential', 'energy', 'gravity', 'height', 'Ep = mgh'],
    concept: [
      'Objects held above the ground have stored energy — lift a book and it can do work falling back down. That stored energy is gravitational potential energy.',
      'Potential energy is always measured relative to a chosen reference level (the “zero”). Only differences in height matter physically, so choose h = 0 wherever is convenient.',
    ],
    formula: 'Ep = m × g × h',
    variables: [
      { symbol: 'Ep', meaning: 'Gravitational potential energy', unit: 'J' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'g', meaning: 'Gravitational field strength', unit: 'm/s²' },
      { symbol: 'h', meaning: 'Height above the reference level', unit: 'm' },
    ],
    assumptions: ['g is constant over the height range (near Earth’s surface, g ≈ 9.81 m/s²).', 'Height may be negative if the object is below the reference level.'],
    inputDefs: [
      { id: 'm', label: 'Mass', unit: 'kg', type: 'number', default: '2' },
      { id: 'g', label: 'Gravitational g', unit: 'm/s²', type: 'number', default: '9.81' },
      { id: 'h', label: 'Height', unit: 'm', type: 'number', default: '3' },
    ],
    inputLabel: 'Read mass, g, height', validateLabel: 'm ≥ 0 and g > 0?', computeLabel: 'Ep = m × g × h', outputLabel: 'Display potential energy',
    validate: v => (v.m >= 0 && v.g > 0 ? null : 'Mass must be ≥ 0 and g must be greater than 0.'),
    solve: v => {
      const ep = v.m * v.g * v.h;
      return {
        steps: [
          { text: `Substitute: Ep = ${fmt(v.m)} × ${fmt(v.g)} × ${fmt(v.h)}` },
          { text: `Ep = ${fmt(ep)} J`, vars: { m: v.m, g: v.g, h: v.h, Ep: fmt(ep) } },
        ],
        output: `Ep = ${fmt(ep)} J`, value: ep,
      };
    },
    workedExample: {
      title: 'A 2 kg book on a 3 m shelf',
      steps: ['Formula: Ep = m g h', 'Substitute: Ep = 2 × 9.81 × 3', 'Ep = 58.86 J'],
      result: 'Potential energy ≈ 58.9 J',
    },
    challenge: { mode: 'numeric', question: 'A 5 kg object sits 4 m high (g = 9.81 m/s²). Its potential energy in joules?', answer: '196.2', unit: 'J', tolerance: 0.1, explanation: 'Ep = 5 × 9.81 × 4 = 196.2 J.' },
    related: ['weight-calculator', 'kinetic-energy', 'free-fall'],
  }),

  formulaExperience({
    slug: 'power-calculator',
    title: 'Power Calculator',
    category: 'physics', difficulty: 'Beginner', duration: 10,
    description: 'Rate of doing work — the bridge between energy and time.',
    keywords: ['power', 'work', 'time', 'watt', 'P = W / t'],
    concept: [
      'Both a crane and a person can lift the same load to the same height — they do the same work. The crane just does it vastly faster. Power is the rate of doing work.',
      'One watt is one joule per second. A 60 W light bulb converts 60 joules of electrical energy every second.',
    ],
    formula: 'P = W / t',
    variables: [
      { symbol: 'P', meaning: 'Power', unit: 'W (J/s)' },
      { symbol: 'W', meaning: 'Work done (energy transferred)', unit: 'J' },
      { symbol: 't', meaning: 'Time taken', unit: 's' },
    ],
    assumptions: ['Time is strictly positive.', 'Work here means total energy transferred.'],
    inputDefs: [
      { id: 'W', label: 'Work', unit: 'J', type: 'number', default: '9000' },
      { id: 't', label: 'Time', unit: 's', type: 'number', default: '60' },
    ],
    inputLabel: 'Read work, time', validateLabel: 't > 0?', computeLabel: 'P = W ÷ t', outputLabel: 'Display power',
    validate: v => (v.t > 0 ? null : 'Time must be greater than zero.'),
    solve: v => ({
      steps: [
        { text: `Substitute: P = ${fmt(v.W)} J ÷ ${fmt(v.t)} s` },
        { text: `P = ${fmt(v.W / v.t)} W`, vars: { W: v.W, t: v.t, P: fmt(v.W / v.t) } },
      ],
      output: `P = ${fmt(v.W / v.t)} W`, value: v.W / v.t,
    }),
    workedExample: {
      title: 'Lifting a load: 9000 J of work in 60 s',
      steps: ['Formula: P = W ÷ t', 'Substitute: P = 9000 ÷ 60', 'Compute: P = 150 W'],
      result: 'Power = 150 W',
    },
    challenge: { mode: 'numeric', question: 'An engine does 5000 J of work in 25 s. What is its power?', answer: '200', unit: 'W', tolerance: 0.5, explanation: 'P = 5000 ÷ 25 = 200 W.' },
    related: ['work-calculator', 'electrical-power', 'kinetic-energy'],
  }),

  formulaExperience({
    slug: 'momentum-calculator',
    title: 'Momentum Calculator',
    category: 'physics', difficulty: 'Beginner', duration: 10,
    description: 'Quantity of motion — the conserved currency of collisions.',
    keywords: ['momentum', 'mass', 'velocity', 'p = mv', 'collision', 'conservation'],
    concept: [
      'Momentum is “how much motion” an object has: mass × velocity. A heavy slow truck and a light fast car can carry the same momentum.',
      'Momentum is a vector and is conserved in isolated collisions — it transfers between bodies but is never created or destroyed. This is why airbags and crumple zones work.',
    ],
    formula: 'p = m × v',
    variables: [
      { symbol: 'p', meaning: 'Momentum', unit: 'kg·m/s' },
      { symbol: 'm', meaning: 'Mass', unit: 'kg' },
      { symbol: 'v', meaning: 'Velocity (signed)', unit: 'm/s' },
    ],
    assumptions: ['Momentum is signed — direction matters.', 'Classical mechanics.', 'Mass is constant.'],
    inputDefs: [
      { id: 'm', label: 'Mass', unit: 'kg', type: 'number', default: '1200' },
      { id: 'v', label: 'Velocity', unit: 'm/s', type: 'number', default: '15' },
    ],
    inputLabel: 'Read mass, velocity', validateLabel: 'mass ≥ 0?', computeLabel: 'p = m × v', outputLabel: 'Display momentum',
    validate: v => (v.m >= 0 ? null : 'Mass cannot be negative.'),
    solve: v => ({
      steps: [
        { text: `Substitute: p = ${fmt(v.m)} kg × ${fmt(v.v)} m/s` },
        { text: `p = ${fmt(v.m * v.v)} kg·m/s`, vars: { m: v.m, v: v.v, p: fmt(v.m * v.v) } },
      ],
      output: `p = ${fmt(v.m * v.v)} kg·m/s`, value: v.m * v.v,
    }),
    workedExample: {
      title: 'A 1200 kg car at 15 m/s',
      steps: ['Formula: p = m v', 'Substitute: p = 1200 × 15', 'p = 18,000 kg·m/s'],
      result: 'Momentum = 18,000 kg·m/s',
    },
    challenge: { mode: 'numeric', question: 'A 80 kg runner sprints at 9 m/s. What is her momentum?', answer: '720', unit: 'kg·m/s', tolerance: 0.5, explanation: 'p = 80 × 9 = 720 kg·m/s.' },
    related: ['impulse-calculator', 'kinetic-energy', 'newtons-second-law'],
  }),

  formulaExperience({
    slug: 'impulse-calculator',
    title: 'Impulse Calculator',
    category: 'physics', difficulty: 'Intermediate', duration: 12,
    description: 'Force applied over time changes momentum — the physics of safety design.',
    keywords: ['impulse', 'force', 'time', 'momentum', 'J = F Δt', 'airbag'],
    concept: [
      'Impulse is what a force delivers over a period of time. A long gentle push and a sudden hard hit can deliver the same impulse — and the same change in momentum.',
      'This is the engineering principle behind airbags and seatbelts: extend the stopping time, reduce the peak force, keep the impulse (momentum change) fixed.',
    ],
    formula: 'J = F × Δt',
    variables: [
      { symbol: 'J', meaning: 'Impulse', unit: 'N·s (= kg·m/s)' },
      { symbol: 'F', meaning: 'Average force', unit: 'N' },
      { symbol: 'Δt', meaning: 'Time the force acts', unit: 's' },
    ],
    assumptions: ['F is the average force if it varies.', 'Impulse equals the change in momentum: J = Δp.', 'Δt must not be negative.'],
    inputDefs: [
      { id: 'F', label: 'Force', unit: 'N', type: 'number', default: '6000' },
      { id: 'dt', label: 'Time interval Δt', unit: 's', type: 'number', default: '0.08' },
    ],
    inputLabel: 'Read force, Δt', validateLabel: 'Δt ≥ 0?', computeLabel: 'J = F × Δt', outputLabel: 'Display impulse',
    validate: v => (v.dt >= 0 ? null : 'Time interval cannot be negative.'),
    solve: v => ({
      steps: [
        { text: `Substitute: J = ${fmt(v.F)} N × ${fmt(v.dt)} s` },
        { text: `J = ${fmt(v.F * v.dt)} N·s`, vars: { F: v.F, dt: v.dt, J: fmt(v.F * v.dt) } },
      ],
      output: `J = ${fmt(v.F * v.dt)} N·s`, value: v.F * v.dt,
    }),
    workedExample: {
      title: 'Airbag inflates over 0.08 s with average 6000 N',
      steps: ['Formula: J = F × Δt', 'Substitute: J = 6000 × 0.08', 'J = 480 N·s'],
      result: 'Impulse = 480 N·s',
    },
    challenge: { mode: 'numeric', question: 'A 200 N force acts for 0.5 s. What impulse does it deliver?', answer: '100', unit: 'N·s', tolerance: 0.5, explanation: 'J = 200 × 0.5 = 100 N·s.' },
    related: ['momentum-calculator', 'newtons-second-law', 'work-calculator'],
  }),

  formulaExperience({
    slug: 'friction-force',
    title: 'Friction Force',
    category: 'physics', difficulty: 'Intermediate', duration: 12,
    description: 'Estimate the resistive force between two surfaces from the friction coefficient and the normal force.',
    keywords: ['friction', 'coefficient', 'normal', 'Ff = μN', 'resistance', 'surfaces'],
    concept: [
      'Whenever two surfaces touch, friction opposes their relative motion. Its size depends on two things: how rough the surfaces are (the coefficient μ) and how hard they are pressed together (the normal force N).',
      'Notice what friction does NOT depend on: apparent contact area (for rigid dry surfaces) and sliding speed (approximately). Rubber on dry asphalt has μ ≈ 0.7; ice on ice is about 0.03.',
    ],
    formula: 'Ff = μ × N',
    variables: [
      { symbol: 'Ff', meaning: 'Friction force', unit: 'N' },
      { symbol: 'μ', meaning: 'Coefficient of friction (dimensionless)', unit: '—' },
      { symbol: 'N', meaning: 'Normal force', unit: 'N' },
    ],
    assumptions: ['μ ≥ 0. Typical values: steel on steel ≈ 0.6, rubber on asphalt ≈ 0.7–0.9, ice ≈ 0.03.', 'Applies to dry sliding or impending motion (static μs, kinetic μk).', 'Lubricated or rolling contact follow different rules.'],
    inputDefs: [
      { id: 'mu', label: 'Coefficient μ', unit: '—', type: 'number', default: '0.6' },
      { id: 'N', label: 'Normal force', unit: 'N', type: 'number', default: '150' },
    ],
    inputLabel: 'Read μ, normal force', validateLabel: 'μ ≥ 0 and N ≥ 0?', computeLabel: 'Ff = μ × N', outputLabel: 'Display friction force',
    validate: v => (v.mu >= 0 && v.N >= 0 ? null : 'Coefficient and normal force must be ≥ 0.'),
    solve: v => ({
      steps: [
        { text: `Substitute: Ff = ${fmt(v.mu)} × ${fmt(v.N)} N` },
        { text: `Ff = ${fmt(v.mu * v.N)} N`, vars: { mu: v.mu, N: v.N, Ff: fmt(v.mu * v.N) } },
      ],
      output: `Ff = ${fmt(v.mu * v.N)} N`, value: v.mu * v.N,
    }),
    workedExample: {
      title: 'Steel box on steel floor: μ = 0.6, N = 150 N',
      steps: ['Formula: Ff = μ N', 'Substitute: Ff = 0.6 × 150', 'Ff = 90 N'],
      result: 'Friction force = 90 N',
    },
    challenge: { mode: 'numeric', question: 'Rubber on asphalt, μ = 0.8, normal force 500 N. Friction force?', answer: '400', unit: 'N', tolerance: 0.5, explanation: 'Ff = 0.8 × 500 = 400 N.' },
    related: ['newtons-second-law', 'work-calculator', 'pressure-calculator'],
  }),

  formulaExperience({
    slug: 'hookes-law',
    title: "Hooke's Law",
    category: 'physics', difficulty: 'Intermediate', duration: 14, featured: true,
    description: 'Springs obey a beautifully simple linear law — within their elastic limit.',
    keywords: ['hooke', 'spring', 'force', 'elastic', 'stiffness', 'F = kx', 'oscillation'],
    concept: [
      'Stretch or compress a spring and it pushes back, exactly in proportion to how far you moved it: F = k x. The constant k — the spring constant — measures stiffness, in newtons per metre.',
      'Hooke’s Law holds only within the elastic limit. Stretch too far and the spring deforms permanently — the straight line becomes a curve and eventually a break.',
    ],
    formula: 'F = k × x',
    formulaNote: 'Often written with a minus sign, F = −k x, to show the force opposes displacement. Here we report the magnitude.',
    variables: [
      { symbol: 'F', meaning: 'Restoring force (magnitude)', unit: 'N' },
      { symbol: 'k', meaning: 'Spring constant', unit: 'N/m' },
      { symbol: 'x', meaning: 'Extension or compression from equilibrium', unit: 'm' },
    ],
    assumptions: ['Displacement x is measured from the unstretched equilibrium position.', 'The spring stays within its elastic limit.', 'Mass of the spring itself is ignored.'],
    inputDefs: [
      { id: 'k', label: 'Spring constant k', unit: 'N/m', type: 'number', default: '50' },
      { id: 'x', label: 'Displacement x', unit: 'm', type: 'number', default: '0.2' },
    ],
    inputLabel: 'Read k, displacement', validateLabel: 'k > 0?', computeLabel: 'F = k × |x|', outputLabel: 'Display spring force',
    validate: v => (v.k > 0 ? null : 'Spring constant must be greater than 0.'),
    solve: v => {
      const f = v.k * Math.abs(v.x);
      return {
        steps: [
          { text: `Restoring force magnitude: F = k × |x| = ${fmt(v.k)} × ${fmt(Math.abs(v.x))}` },
          { text: `F = ${fmt(f)} N (direction opposes displacement)`, vars: { k: v.k, x: v.x, F: fmt(f) } },
        ],
        output: `F = ${fmt(f)} N`, value: f,
      };
    },
    workedExample: {
      title: 'A 50 N/m spring stretched 20 cm',
      steps: ['Formula: F = k x', 'Convert: x = 0.20 m', 'F = 50 × 0.20', 'F = 10 N'],
      result: 'Restoring force = 10 N',
    },
    challenge: { mode: 'numeric', question: 'A spring with k = 200 N/m is compressed 5 cm. What is the force magnitude?', answer: '10', unit: 'N', tolerance: 0.05, explanation: 'x = 0.05 m; F = 200 × 0.05 = 10 N.' },
    related: ['newtons-second-law', 'work-calculator', 'pressure-calculator'],
  }),

  formulaExperience({
    slug: 'ohms-law',
    title: "Ohm's Law",
    category: 'physics', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'The V = I × R relationship that governs simple electric circuits.',
    keywords: ['ohm', 'voltage', 'current', 'resistance', 'V = IR', 'circuit', 'electricity'],
    concept: [
      'Ohm’s Law describes how voltage, current and resistance relate in ohmic conductors: voltage equals current times resistance. Double the resistance and the same current needs double the voltage.',
      'Resistance is the opposition to current — measured in ohms (Ω). A thick copper wire has low resistance; a nichrome heating element, high resistance.',
    ],
    formula: 'V = I × R',
    variables: [
      { symbol: 'V', meaning: 'Voltage (potential difference)', unit: 'V' },
      { symbol: 'I', meaning: 'Current', unit: 'A' },
      { symbol: 'R', meaning: 'Resistance', unit: 'Ω' },
    ],
    assumptions: ['Applies to ohmic conductors at constant temperature.', 'R must be ≥ 0 — a short circuit (R = 0) gives V = 0 for any finite current.', 'Real components like diodes and filaments are non-ohmic.'],
    inputDefs: [
      { id: 'I', label: 'Current', unit: 'A', type: 'number', default: '0.5' },
      { id: 'R', label: 'Resistance', unit: 'Ω', type: 'number', default: '24' },
    ],
    inputLabel: 'Read current, resistance', validateLabel: 'R ≥ 0?', computeLabel: 'V = I × R', outputLabel: 'Display voltage',
    validate: v => (v.R >= 0 ? null : 'Resistance cannot be negative.'),
    solve: v => ({
      steps: [
        { text: `Substitute: V = ${fmt(v.I)} A × ${fmt(v.R)} Ω` },
        { text: `V = ${fmt(v.I * v.R)} V`, vars: { I: v.I, R: v.R, V: fmt(v.I * v.R) } },
      ],
      output: `V = ${fmt(v.I * v.R)} V`, value: v.I * v.R,
    }),
    workedExample: {
      title: 'A 24 Ω heater draws 0.5 A',
      steps: ['Formula: V = I R', 'Substitute: V = 0.5 × 24', 'V = 12 V'],
      result: 'Voltage = 12 V',
    },
    challenge: { mode: 'numeric', question: 'A 100 Ω resistor carries 0.2 A. What is the voltage across it?', answer: '20', unit: 'V', tolerance: 0.05, explanation: 'V = 0.2 × 100 = 20 V.' },
    related: ['electrical-power', 'resistance-series', 'resistance-parallel'],
  }),

  formulaExperience({
    slug: 'electrical-power',
    title: 'Electrical Power',
    category: 'physics', difficulty: 'Beginner', duration: 10,
    description: 'How much electrical energy a device converts per second.',
    keywords: ['power', 'voltage', 'current', 'watt', 'P = VI', 'electricity', 'appliance'],
    concept: [
      'An appliance’s wattage tells you how fast it converts electrical energy into other forms — heat, light, motion. A 2000 W kettle boils water far faster than a 500 W one.',
      'Power equals voltage times current: P = V × I. It also equals V²/R and I²R — three faces of the same law.',
    ],
    formula: 'P = V × I',
    variables: [
      { symbol: 'P', meaning: 'Electrical power', unit: 'W' },
      { symbol: 'V', meaning: 'Voltage', unit: 'V' },
      { symbol: 'I', meaning: 'Current', unit: 'A' },
    ],
    assumptions: ['DC circuits, or AC resistive (power-factor = 1) loads.', 'Sign convention: negative P means the device delivers power to the circuit.'],
    inputDefs: [
      { id: 'V', label: 'Voltage', unit: 'V', type: 'number', default: '230' },
      { id: 'I', label: 'Current', unit: 'A', type: 'number', default: '2' },
    ],
    inputLabel: 'Read voltage, current', validateLabel: 'values finite?', computeLabel: 'P = V × I', outputLabel: 'Display power',
    solve: v => ({
      steps: [
        { text: `Substitute: P = ${fmt(v.V)} V × ${fmt(v.I)} A` },
        { text: `P = ${fmt(v.V * v.I)} W`, vars: { V: v.V, I: v.I, P: fmt(v.V * v.I) } },
      ],
      output: `P = ${fmt(v.V * v.I)} W`, value: v.V * v.I,
    }),
    workedExample: {
      title: 'A 230 V kettle draws 8.7 A',
      steps: ['Formula: P = V I', 'Substitute: P = 230 × 8.7', 'P ≈ 2000 W'],
      result: 'Power ≈ 2000 W (2 kW)',
    },
    challenge: { mode: 'numeric', question: 'A 12 V circuit carries 5 A. What power is dissipated?', answer: '60', unit: 'W', tolerance: 0.05, explanation: 'P = 12 × 5 = 60 W.' },
    related: ['ohms-law', 'power-calculator', 'resistance-series'],
  }),

  formulaExperience({
    slug: 'resistance-series',
    title: 'Resistance in Series',
    category: 'physics', difficulty: 'Intermediate', duration: 12,
    description: 'Add resistances in series — current has only one path, so resistances simply add.',
    keywords: ['resistance', 'series', 'circuit', 'ohms', 'Req = R1 + R2'],
    concept: [
      'In a series circuit there is a single path for current, and every charge carrier must push through every resistor in turn. The equivalent resistance is just the sum.',
      'Series connections increase total resistance. Adding more bulbs in series makes all of them dimmer, because the same voltage is now shared across more opposition.',
    ],
    formula: 'Req = R₁ + R₂ + … + Rₙ',
    variables: [
      { symbol: 'Req', meaning: 'Equivalent resistance', unit: 'Ω' },
      { symbol: 'R₁…Rₙ', meaning: 'Individual resistances', unit: 'Ω' },
    ],
    assumptions: ['Enter all resistances as a comma-separated list, e.g. 10, 20, 30.', 'Every value must be ≥ 0.', 'At least one resistance is required.'],
    inputDefs: [
      { id: 'list', label: 'Resistances (comma-separated)', unit: 'Ω', type: 'text', default: '10, 20, 30', placeholder: 'e.g. 10, 20, 30' },
    ],
    inputLabel: 'Read R₁, R₂, …, Rₙ', validateLabel: 'all values ≥ 0?', computeLabel: 'Req = R₁ + R₂ + … + Rₙ', outputLabel: 'Display equivalent resistance',
    validate: (_v, raw) => {
      const parts = (raw.list ?? '').split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length === 0) return 'Enter at least one resistance.';
      for (const p of parts) { const n = parseFloat(p); if (!Number.isFinite(n)) return `“${p}” is not a number.`; if (n < 0) return 'Resistances cannot be negative.'; }
      return null;
    },
    solve: (_v, raw) => {
      const list = (raw.list ?? '').split(',').map(s => parseFloat(s.trim()));
      let sum = 0;
      for (const r of list) sum += r;
      return {
        steps: [
          { text: `Values: [${list.map(r => fmt(r)).join(', ')}] Ω` },
          { text: `Req = ${list.map(r => fmt(r)).join(' + ')} = ${fmt(sum)} Ω`, vars: { Count: list.length, Req: `${fmt(sum)} Ω` } },
        ],
        output: `Req = ${fmt(sum)} Ω`, value: sum,
      };
    },
    workedExample: {
      title: 'Series chain of 10 Ω, 20 Ω, 30 Ω',
      steps: ['Formula: Req = R₁ + R₂ + R₃', 'Req = 10 + 20 + 30', 'Req = 60 Ω'],
      result: 'Equivalent resistance = 60 Ω',
    },
    challenge: { mode: 'numeric', question: 'Three series resistors: 5 Ω, 15 Ω and 100 Ω. Equivalent resistance?', answer: '120', unit: 'Ω', tolerance: 0.05, explanation: 'Req = 5 + 15 + 100 = 120 Ω.' },
    related: ['resistance-parallel', 'ohms-law', 'electrical-power'],
  }),

  formulaExperience({
    slug: 'resistance-parallel',
    title: 'Resistance in Parallel',
    category: 'physics', difficulty: 'Intermediate', duration: 14,
    description: 'Parallel branches divide current — reciprocals add, and Req is always smaller than any branch.',
    keywords: ['resistance', 'parallel', 'circuit', 'ohms', 'reciprocal', 'Req'],
    concept: [
      'Parallel paths each carry part of the current. Adding more paths never restricts the flow, so the equivalent resistance always drops below the smallest branch resistance.',
      'Reciprocals add: 1/Req = 1/R₁ + 1/R₂ + … + 1/Rₙ. Two equal 10 Ω resistors in parallel give 5 Ω. Ten 10 Ω resistors in parallel give 1 Ω.',
    ],
    formula: '1/Req = 1/R₁ + 1/R₂ + … + 1/Rₙ',
    variables: [
      { symbol: 'Req', meaning: 'Equivalent resistance', unit: 'Ω' },
      { symbol: 'R₁…Rₙ', meaning: 'Branch resistances', unit: 'Ω' },
    ],
    assumptions: ['Enter resistances comma-separated, e.g. 10, 20, 30.', 'Each resistance must be strictly greater than 0 (a short branch makes Req = 0).', 'At least one resistance is required.'],
    inputDefs: [
      { id: 'list', label: 'Resistances (comma-separated)', unit: 'Ω', type: 'text', default: '10, 20, 30', placeholder: 'e.g. 10, 20, 30' },
    ],
    inputLabel: 'Read R₁, R₂, …, Rₙ', validateLabel: 'all values > 0?', computeLabel: '1/Req = Σ 1/Rᵢ', outputLabel: 'Display equivalent resistance',
    validate: (_v, raw) => {
      const parts = (raw.list ?? '').split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length === 0) return 'Enter at least one resistance.';
      for (const p of parts) { const n = parseFloat(p); if (!Number.isFinite(n)) return `“${p}” is not a number.`; if (n <= 0) return 'Parallel resistances must be greater than 0.'; }
      return null;
    },
    solve: (_v, raw) => {
      const list = (raw.list ?? '').split(',').map(s => parseFloat(s.trim()));
      const inv = list.reduce((acc, r) => acc + 1 / r, 0);
      const req = 1 / inv;
      return {
        steps: [
          { text: `Sum of reciprocals: ${list.map(r => `1/${fmt(r)}`).join(' + ')} = ${fmt(inv, 4)}` },
          { text: `Req = 1 ÷ ${fmt(inv, 4)} = ${fmt(req)} Ω`, vars: { Count: list.length, Req: `${fmt(req)} Ω` } },
        ],
        output: `Req = ${fmt(req)} Ω`, value: req,
      };
    },
    workedExample: {
      title: 'Parallel pair: 10 Ω and 10 Ω',
      steps: ['Formula: 1/Req = 1/10 + 1/10 = 0.2', 'Req = 1 ÷ 0.2', 'Req = 5 Ω'],
      result: 'Equivalent resistance = 5 Ω',
    },
    challenge: { mode: 'numeric', question: 'Two 20 Ω resistors in parallel. Equivalent resistance in ohms?', answer: '10', unit: 'Ω', tolerance: 0.05, explanation: '1/Req = 0.05 + 0.05 = 0.1 → Req = 10 Ω.' },
    related: ['resistance-series', 'ohms-law', 'electrical-power'],
  }),

  formulaExperience({
    slug: 'circular-motion',
    title: 'Circular Motion',
    category: 'physics', difficulty: 'Intermediate', duration: 14,
    description: 'Angular velocity from the period — the speed of rotation.',
    keywords: ['circular', 'angular', 'velocity', 'period', 'omega', 'ω = 2π / T', 'rotation'],
    concept: [
      'A point on a spinning wheel covers one full revolution — 2π radians — every period T. Angular velocity ω measures that turning rate in radians per second.',
      'Linear and angular speed are linked by the radius: v = ωr. A point twice as far from the axis moves twice as fast along the circumference, but both turn through the same angle per second.',
    ],
    formula: 'ω = 2π / T',
    variables: [
      { symbol: 'ω', meaning: 'Angular velocity (omega)', unit: 'rad/s' },
      { symbol: 'T', meaning: 'Period (time per revolution)', unit: 's' },
      { symbol: '2π', meaning: 'Angle of one full revolution', unit: 'rad ≈ 6.2832' },
    ],
    assumptions: ['T is strictly positive.', 'Uniform (constant-rate) rotation.', 'Frequency f = 1/T, so ω = 2πf.'],
    inputDefs: [
      { id: 'T', label: 'Period', unit: 's', type: 'number', default: '2' },
    ],
    inputLabel: 'Read period', validateLabel: 'T > 0?', computeLabel: 'ω = 2π ÷ T', outputLabel: 'Display angular velocity',
    validate: v => (v.T > 0 ? null : 'Period must be greater than zero.'),
    solve: v => {
      const w = (2 * PI) / v.T;
      return {
        steps: [
          { text: `One revolution = 2π ≈ 6.2832 rad` },
          { text: `ω = 6.2832 ÷ ${fmt(v.T)} = ${fmt(w)} rad/s`, vars: { T: v.T, omega: `${fmt(w)} rad/s`, frequency: `${fmt(1 / v.T)} Hz` } },
        ],
        output: `ω = ${fmt(w)} rad/s`, value: w,
      };
    },
    workedExample: {
      title: 'A wheel completes one turn every 2 s',
      steps: ['Formula: ω = 2π ÷ T', 'Substitute: ω = 6.2832 ÷ 2', 'ω ≈ 3.14 rad/s'],
      result: 'Angular velocity ≈ 3.14 rad/s',
    },
    challenge: { mode: 'numeric', question: 'A disc rotates with period 0.5 s. What is ω in rad/s? (Use 2π ≈ 6.2832)', answer: '12.5664', unit: 'rad/s', tolerance: 0.01, explanation: 'ω = 6.2832 ÷ 0.5 ≈ 12.57 rad/s.' },
    related: ['uniform-linear-motion', 'acceleration-calculator', 'hookes-law'],
  }),

  formulaExperience({
    slug: 'free-fall',
    title: 'Free Fall',
    category: 'physics', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'How far does an object fall from rest? The t² law of gravity.',
    keywords: ['free', 'fall', 'gravity', 'drop', 'h = 1/2 gt2', 'vertical'],
    concept: [
      'Drop a stone and it accelerates downward at g everywhere near Earth’s surface. Starting from rest, the distance fallen after time t is h = ½ g t² — it grows with the square of time.',
      'Fall for 1 s: 4.9 m. Fall for 2 s: 19.6 m — four times as far. This simple law lets engineers time elevators, design safety nets and measure g itself.',
    ],
    formula: 'h = ½ × g × t²',
    formulaNote: 'Object starts from rest; air resistance is ignored. Not valid near terminal velocity.',
    variables: [
      { symbol: 'h', meaning: 'Distance fallen', unit: 'm' },
      { symbol: 'g', meaning: 'Gravitational acceleration', unit: 'm/s²' },
      { symbol: 't', meaning: 'Time since release', unit: 's' },
    ],
    assumptions: ['Initial velocity is zero.', 'Air resistance is ignored (vacuum / dense object).', 'g is constant: 9.81 m/s² near Earth’s surface.', 'Valid only before hitting the ground or reaching terminal velocity.'],
    inputDefs: [
      { id: 't', label: 'Time', unit: 's', type: 'number', default: '3' },
      { id: 'g', label: 'Gravitational g', unit: 'm/s²', type: 'number', default: '9.81' },
    ],
    inputLabel: 'Read time, g', validateLabel: 't ≥ 0 and g > 0?', computeLabel: 'h = ½ g t²', outputLabel: 'Display distance fallen',
    validate: v => (v.t >= 0 && v.g > 0 ? null : 'Time must be ≥ 0 and g must be greater than 0.'),
    solve: v => {
      const h = 0.5 * v.g * v.t * v.t;
      return {
        steps: [
          { text: `t² = ${fmt(v.t)}² = ${fmt(v.t * v.t)}` },
          { text: `h = ½ × ${fmt(v.g)} × ${fmt(v.t * v.t)} = ${fmt(h)} m`, vars: { t: v.t, g: v.g, h: fmt(h) } },
        ],
        output: `h = ${fmt(h)} m`, value: h,
      };
    },
    workedExample: {
      title: 'An apple falls for 2 s',
      steps: ['Formula: h = ½ g t²', 't² = 4', 'h = 0.5 × 9.81 × 4', 'h = 19.62 m'],
      result: 'Distance fallen = 19.62 m',
    },
    challenge: { mode: 'numeric', question: 'From rest, how far does an object fall in 4 s? (g = 9.81 m/s²)', answer: '78.48', unit: 'm', tolerance: 0.01, explanation: 'h = ½ × 9.81 × 16 = 78.48 m.' },
    related: ['uniform-linear-motion', 'gravitational-potential-energy', 'acceleration-calculator'],
  }),
];
