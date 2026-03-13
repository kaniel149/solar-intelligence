import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
} from 'framer-motion'
import {
  Sun,
  Zap,
  Shield,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  Phone,
  Building2,
  Home,
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { useLanguage } from '../i18n/LanguageContext'
import { SEOHead } from '../components/seo/SEOHead'
import { breadcrumbSchema, homeBreadcrumb } from '../components/seo/schemas'

// ─── Image paths (served from /public) ───────────────────────────────────────
const aerialImg = '/assets/images/strategy-01-aerial.png'
const longiImg = '/assets/images/longi-panel.png'
const huaweiImg = '/assets/images/huawei-inverter.png'
const villaImg = '/assets/images/bizplan-05-villa.png'
const resortImg = '/assets/images/strategy-03-resort.png'

// ─── Shared animation variants ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, started = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    let frame: number

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [started, target, duration])

  return value
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  children,
  className = '',
  id,
  style,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  style?: React.CSSProperties
}) {
  return (
    <section id={id} className={className} style={style}>
      {children}
    </section>
  )
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  const { t } = useTranslation()
  const { langPath } = useLanguage()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(14,77,115,0.55) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(232,168,32,0.08) 0%, transparent 60%), var(--color-dark)',
        }}
      />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating panel image */}
      <motion.div
        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-64 md:w-80 lg:w-[420px] opacity-20 md:opacity-30 lg:opacity-40 pointer-events-none"
        animate={{ y: [-12, 12, -12], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={longiImg}
          alt="Solar panel"
          className="w-full h-auto drop-shadow-2xl"
          loading="lazy"
        />
      </motion.div>

      {/* Hero content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-4">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(232,168,32,0.12)',
              border: '1px solid rgba(232,168,32,0.3)',
              color: 'var(--color-gold)',
            }}
          >
            <Sun size={14} />
            {t.home.hero.badge}
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-[48px] md:text-[64px] lg:text-[80px] leading-none tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t.home.hero.title}
          <br />
          <span style={{ color: 'var(--color-gold)' }}>{t.home.hero.titleAccent}</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t.home.hero.subtitle}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to={langPath('/contact')}>
            <motion.span
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold cursor-pointer select-none"
              style={{
                background: 'var(--color-gold)',
                color: 'var(--color-dark)',
                boxShadow: '0 0 0 0 rgba(232,168,32,0)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 28px 6px rgba(232,168,32,0.30)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {t.home.hero.ctaPrimary}
              <ArrowRight size={18} />
            </motion.span>
          </Link>

          <a href="#work">
            <motion.span
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium cursor-pointer select-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
                color: 'white',
              }}
              whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.36)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {t.home.hero.ctaSecondary}
            </motion.span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── 2. STATS BAR ─────────────────────────────────────────────────────────────
function StatItem({
  target,
  suffix,
  label,
  started,
}: {
  target: number
  suffix: string
  label: string
  started: boolean
}) {
  const value = useCountUp(target, 1800, started)
  return (
    <div className="flex flex-col items-center gap-1 px-8 py-6">
      <span
        className="text-4xl md:text-5xl font-bold tabular-nums"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold)' }}
      >
        {value}
        {suffix}
      </span>
      <span className="text-sm text-white/50 text-center">{label}</span>
    </div>
  )
}

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  const { t } = useTranslation()

  const stats = [
    t.home.stats.installations,
    t.home.stats.installed,
    t.home.stats.savings,
    t.home.stats.experience,
  ]

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
        {stats.map((stat) => (
          <StatItem key={stat.label} target={stat.value} suffix={stat.suffix} label={stat.label} started={inView} />
        ))}
      </div>
    </div>
  )
}

// ─── 3. SERVICES ──────────────────────────────────────────────────────────────
function ServicesPreview() {
  const { t } = useTranslation()
  const { langPath } = useLanguage()

  const services = [
    {
      icon: <Home size={28} />,
      title: t.home.services.residential.title,
      description: t.home.services.residential.description,
      cta: t.home.services.residential.cta,
      href: langPath('/services#residential'),
    },
    {
      icon: <Building2 size={28} />,
      title: t.home.services.commercial.title,
      description: t.home.services.commercial.description,
      cta: t.home.services.commercial.cta,
      href: langPath('/services#commercial'),
    },
    {
      icon: <Sun size={28} />,
      title: t.home.services.solarFarm.title,
      description: t.home.services.solarFarm.description,
      cta: t.home.services.solarFarm.cta,
      href: langPath('/services#farm'),
    },
  ]

  return (
    <Section className="py-24 px-6" id="services">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.home.services.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t.home.services.title}
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {services.map((svc) => (
            <motion.div
              key={svc.title}
              variants={fadeUp}
              className="group relative flex flex-col p-8 rounded-2xl cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
              }}
              whileHover={{
                y: -6,
                borderColor: 'rgba(232,168,32,0.35)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(232,168,32,0.15)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[rgba(232,168,32,0.2)]"
                style={{
                  background: 'rgba(232,168,32,0.10)',
                  color: 'var(--color-gold)',
                }}
              >
                {svc.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{svc.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed flex-1">
                {svc.description}
              </p>
              <Link
                to={svc.href}
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium transition-colors duration-200"
                style={{ color: 'var(--color-gold)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {svc.cta}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// ─── 4. WHY TM ENERGY ─────────────────────────────────────────────────────────
const featureIcons = [
  <Sun size={24} />,
  <Shield size={24} />,
  <Zap size={24} />,
  <TrendingUp size={24} />,
]

function WhySection() {
  const { t } = useTranslation()

  return (
    <Section
      className="py-24 px-6"
      style={{
        background:
          'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(14,77,115,0.18) 0%, transparent 70%)',
      } as React.CSSProperties}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.home.why.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t.home.why.title}
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {t.home.why.items.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={fadeUp}
              className="flex gap-5 p-7 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
                style={{
                  background: 'rgba(10,61,92,0.6)',
                  color: 'var(--color-gold)',
                  border: '1px solid rgba(232,168,32,0.2)',
                }}
              >
                {featureIcons[i]}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// ─── 5. PROCESS ───────────────────────────────────────────────────────────────
const stepNums = ['01', '02', '03', '04']

function ProcessSection() {
  const { t } = useTranslation()
  const { langPath } = useLanguage()

  return (
    <Section className="py-24 px-6" id="process">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.home.process.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t.home.process.title}
          </h2>
          <p className="text-white/50 text-base">{t.home.process.subtitle}</p>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-0 relative"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-[34px] left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(232,168,32,0.3) 20%, rgba(232,168,32,0.3) 80%, transparent)' }}
          />

          {t.home.process.steps.map((step, i) => (
            <motion.div
              key={stepNums[i]}
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: i * 0.14 },
                },
              }}
              className="flex flex-col items-center text-center px-6 pb-8 md:pb-0 relative"
            >
              {/* Vertical connector — mobile only */}
              {i < t.home.process.steps.length - 1 && (
                <div
                  className="md:hidden absolute left-1/2 -translate-x-1/2 top-[68px] w-px h-full"
                  style={{ background: 'linear-gradient(180deg, rgba(232,168,32,0.3), transparent)' }}
                />
              )}

              <div
                className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-xl font-bold mb-5 relative z-10"
                style={{
                  background: 'rgba(14,77,115,0.6)',
                  border: '2px solid rgba(232,168,32,0.45)',
                  color: 'var(--color-gold)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {stepNums[i]}
              </div>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 flex justify-center">
          <Link to={langPath('/contact')}>
            <motion.span
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold cursor-pointer select-none"
              style={{
                background: 'var(--color-gold)',
                color: 'var(--color-dark)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 28px 6px rgba(232,168,32,0.30)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {t.home.process.cta}
              <ArrowRight size={18} />
            </motion.span>
          </Link>
        </div>
      </div>
    </Section>
  )
}

// ─── 6. FEATURED PROJECTS ─────────────────────────────────────────────────────
const projectImages = [villaImg, resortImg, aerialImg]

function ProjectsSection() {
  const { t } = useTranslation()

  return (
    <Section className="py-24 px-6" id="work">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.home.projects.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t.home.projects.title}
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {t.home.projects.items.map((proj, i) => (
            <motion.div
              key={proj.name}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={projectImages[i]}
                  alt={proj.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(13,17,23,0.1) 0%, rgba(13,17,23,0.75) 100%)',
                  }}
                />
                {/* Savings badge */}
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(232,168,32,0.9)',
                    color: 'var(--color-dark)',
                  }}
                >
                  Saves {proj.savings}
                </div>
              </div>

              {/* Details overlay */}
              <div
                className="px-6 py-5"
                style={{ background: 'rgba(13,33,55,0.85)', backdropFilter: 'blur(12px)' }}
              >
                <h3 className="text-lg font-semibold mb-1">{proj.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{proj.location}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {proj.size} System
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// ─── 7. CTA SECTION ───────────────────────────────────────────────────────────
function CTASection() {
  const { t } = useTranslation()
  const { langPath } = useLanguage()

  return (
    <Section className="py-28 px-6" id="contact">
      <div
        className="max-w-3xl mx-auto rounded-3xl text-center px-8 py-16 relative overflow-hidden"
        style={{
          background: 'rgba(14,77,115,0.25)',
          border: '1px solid rgba(232,168,32,0.20)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Gold glow blob */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(232,168,32,0.14) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-4"
            style={{ color: 'var(--color-gold)' }}
          >
            {t.home.cta.sectionTag}
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t.home.cta.title}
          </h2>
          <p className="text-white/55 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {t.home.cta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={langPath('/contact')}>
              <motion.span
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold cursor-pointer select-none"
                style={{
                  background: 'var(--color-gold)',
                  color: 'var(--color-dark)',
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 28px 6px rgba(232,168,32,0.32)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {t.home.cta.ctaPrimary}
                <ArrowRight size={18} />
              </motion.span>
            </Link>

            <a href="tel:+66000000000">
              <motion.span
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium cursor-pointer select-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  backdropFilter: 'blur(12px)',
                  color: 'white',
                }}
                whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.38)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Phone size={16} />
                {t.home.cta.ctaSecondary}
              </motion.span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── 8. PARTNERS BAR ──────────────────────────────────────────────────────────
const partnerImages = [longiImg, huaweiImg, null]

function PartnersBar() {
  const { t } = useTranslation()

  return (
    <Section
      className="py-14 px-6"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
      } as React.CSSProperties}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-medium tracking-widest uppercase text-white/30 mb-10">
          {t.home.partners.title}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
          {t.home.partners.items.map((p, i) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-3 opacity-40 hover:opacity-70 transition-opacity duration-300"
            >
              {partnerImages[i] ? (
                <img
                  src={partnerImages[i]!}
                  alt={p.name}
                  loading="lazy"
                  className="h-10 w-auto object-contain grayscale brightness-200"
                />
              ) : (
                <div className="h-10 flex items-center">
                  <span className="text-2xl font-bold tracking-tight text-white">PEA</span>
                </div>
              )}
              <div className="text-center">
                <p className="text-xs font-semibold text-white/80">{p.name}</p>
                <p className="text-[11px] text-white/40">{p.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const { t } = useTranslation()

  return (
    <footer
      className="py-10 px-6 text-center"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-white/25 text-sm">
        {t.footer.copyright}
      </p>
    </footer>
  )
}

// ─── PAGE ASSEMBLY ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, lang } = useTranslation()

  return (
    <>
      <SEOHead
        title={t.seo.home.title}
        description={t.seo.home.description}
        path="/"
        lang={lang}
        schema={breadcrumbSchema(homeBreadcrumb(lang))}
      />
      <div className="min-h-screen" style={{ background: 'var(--color-dark)', color: 'white' }}>
        <HeroSection />
        <StatsBar />
        <ServicesPreview />
        <WhySection />
        <ProcessSection />
        <ProjectsSection />
        <CTASection />
        <PartnersBar />
        <Footer />
      </div>
    </>
  )
}
