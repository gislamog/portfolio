import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ExperiencePage } from './pages/ExperiencePage';
import { EducationPage } from './pages/EducationPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DemosPage } from './pages/DemosPage';
import { ContactPage } from './pages/ContactPage';
import './pages/EducationPage.css';
import './pages/ProjectsPage.css';
import './components/ProjectVisual.css';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/demos" element={<DemosPage />} />
          {/* Hidden until the reading list is recruiter-ready. */}
          {/* <Route path="/learning" element={<LearningPage />} /> */}
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
