import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import { LanguageProvider } from './i18n/LanguageContext'

const HomePage = lazy(() => import('./pages/HomePage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PlatformPage = lazy(() => import('./pages/PlatformPage'))
const CRMPage = lazy(() => import('./pages/CRMPage'))
const CRMDashboard = lazy(() => import('./components/CRM/Dashboard'))
const CRMPipeline = lazy(() => import('./components/CRM/Pipeline'))
const LeadDetail = lazy(() => import('./components/CRM/LeadDetail'))

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-dark)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        <span className="text-white/40 text-sm">Loading...</span>
      </div>
    </div>
  )
}

/** Shared page routes — used under both /  and /th */
function PageRoutes() {
  return (
    <>
      <Route index element={<HomePage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="how-it-works" element={<HowItWorksPage />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="contact" element={<ContactPage />} />
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* LanguageProvider must be inside BrowserRouter so it can read useLocation */}
        <LanguageProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* CRM routes */}
              <Route path="/crm" element={<CRMPage />}>
                <Route index element={<CRMDashboard />} />
                <Route path="pipeline" element={<CRMPipeline />} />
                <Route path="leads/:id" element={<LeadDetail />} />
              </Route>

              {/* Internal platform — no language, no marketing layout */}
              <Route path="/platform" element={<PlatformPage />} />

              {/* Thai routes */}
              <Route path="/th" element={<Layout />}>
                {PageRoutes()}
              </Route>

              {/* English routes (default) */}
              <Route path="/" element={<Layout />}>
                {PageRoutes()}
              </Route>
            </Routes>
          </Suspense>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
