import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useScrollAnimation, fadeUpVariants } from '../../hooks/useScrollAnimation'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  style?: React.CSSProperties
  /** true = bg-dark (#0D1117), false = bg-navy (#0D2137). Default: false */
  dark?: boolean
  /** Skip the inner container constraint (e.g. for full-bleed hero sections) */
  fullBleed?: boolean
}

export function Section({
  children,
  className = '',
  id,
  style,
  dark = false,
  fullBleed = false,
}: SectionProps) {
  const { ref, controls } = useScrollAnimation(0.1)

  const bgClass = dark ? 'bg-dark' : 'bg-navy'

  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={['w-full', bgClass, className].filter(Boolean).join(' ')}
      style={style}
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={fadeUpVariants}
        className={fullBleed ? 'w-full' : 'max-w-7xl mx-auto px-6'}
      >
        {children}
      </motion.div>
    </section>
  )
}
