import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PortfolioHome } from './pages/PortfolioHome';
import { ExperiencePage } from './pages/ExperiencePage';
import { EducationPage } from './pages/EducationPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DemosPage } from './pages/DemosPage';
import { LearningPage } from './pages/LearningPage';
import { ContactPage } from './pages/ContactPage';
import { CloudflareAnalytics } from './components/CloudflareAnalytics';
import './pages/EducationPage.css';
import './pages/ProjectsPage.css';
import './components/ProjectVisual.css';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <CloudflareAnalytics />
      <Layout>
        <Routes>
          <Route path="/" element={<PortfolioHome />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/explore" element={
            <section className="container page-header">
              <h1>Explore</h1>
              <Link className="btn btn-ghost" to="/learning">Ideas and notes</Link>{' '}
              <Link className="btn btn-ghost" to="/demos">Interactive experiments</Link>
            </section>
          } />
          <Route path="/demos" element={<DemosPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
