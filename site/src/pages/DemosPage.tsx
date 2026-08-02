import { SierpinskiDemo } from '../demos/SierpinskiDemo';
import { RobotMLDemo } from '../demos/RobotMLDemo';
import { AntsOnSphereDemo } from '../demos/AntsOnSphereDemo';
import '../demos/Demos.css';

const demos = [
  {
    id: 'robot-ml',
    title: 'Robot Collision Predictor',
    description: 'Simulated robot with 5 distance sensors navigating obstacles. A simplified rule-based model approximates the PyTorch collision predictor from CSE 571.',
    component: RobotMLDemo,
  },
  {
    id: 'sierpinski',
    title: "Sierpinski's Triangle",
    description: 'Chaos game fractal: repeatedly plot the midpoint toward a random vertex and watch the triangle emerge.',
    component: SierpinskiDemo,
  },
  {
    id: 'ants-sphere',
    title: 'Ants on a Sphere',
    description: 'Agents leaving trails as they wander a spherical surface. Inspired by swarm intelligence and the original Java visualization.',
    component: AntsOnSphereDemo,
  },
];

export function DemosPage() {
  return (
    <div className="page-header page-content container demos-page">
      <p className="section-label">Interactive</p>
      <h1>Demos & Mini Labs</h1>
      <p className="page-lead">Small interactive visualizations and simulations. A playground for projects, coursework, and curiosity.</p>

      {demos.map(({ id, title, description, component: Demo }) => (
        <section key={id} id={id} className="demo-section">
          <h2>{title}</h2>
          <p className="demo-desc">{description}</p>
          <Demo />
        </section>
      ))}
    </div>
  );
}
