import { FiCpu, FiGlobe } from 'react-icons/fi';
import { TbTriangle } from 'react-icons/tb';
import { SierpinskiDemo } from '../demos/SierpinskiDemo';
import { RobotMLDemo } from '../demos/RobotMLDemo';
import { AntsOnSphereDemo } from '../demos/AntsOnSphereDemo';
import '../demos/Demos.css';

const demos = [
  {
    id: 'robot-ml',
    title: 'Robot Collision Predictor',
    description: 'Walled arena, 5 distance sensors, collected CSV samples, crash markers, and a Test button that trains a small collision model on the data you generate.',
    component: RobotMLDemo,
    icon: FiCpu,
  },
  {
    id: 'sierpinski',
    title: "Sierpinski's Triangle",
    description: 'Click to place the first point. Walkthrough auto-plays each midpoint construction; use Keep going / Pause anytime.',
    component: SierpinskiDemo,
    icon: TbTriangle,
  },
  {
    id: 'ants-sphere',
    title: 'Ants on a Sphere',
    description: 'Textured moon in space with mouse rotation and random-walking ants. Adjust the walk, move the mouse to turn the sphere, and press SEED to add walkers.',
    component: AntsOnSphereDemo,
    icon: FiGlobe,
  },
];

export function DemosPage() {
  return (
    <div className="page-header page-content container demos-page">
      <p className="section-label">Interactive</p>
      <h1>Demos</h1>
      <p className="page-lead">Small visualizations from coursework and creative coding. Click in and try them.</p>

      {demos.map(({ id, title, description, component: Demo, icon: Icon }) => (
        <section key={id} id={id} className="demo-section">
          <div className="demo-heading">
            <span className="demo-icon"><Icon /></span>
            <div>
              <h2>{title}</h2>
              <p className="demo-desc">{description}</p>
            </div>
          </div>
          <div className="demo-body">
            <Demo />
          </div>
        </section>
      ))}
    </div>
  );
}
