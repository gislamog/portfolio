import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PortfolioHome } from './pages/PortfolioHome';
import { ExperiencePage } from './pages/ExperiencePage';
import { EducationPage } from './pages/EducationPage';
import { ProjectsPage, ProjectStudyPage } from './pages/ProjectsPage';
import { ExplorePage, ExploreLegacyRedirect } from './pages/ExplorePage';
import { ContactPage } from './pages/ContactPage';
import { CloudflareAnalytics } from './components/CloudflareAnalytics';
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
          <Route path="/projects/:projectId" element={<ProjectStudyPage />} />
          <Route path="/explore/*" element={<ExplorePage />} />
          <Route path="/demos" element={<ExploreLegacyRedirect section="demos" />} />
          <Route path="/learning" element={<ExploreLegacyRedirect section="learning" />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
