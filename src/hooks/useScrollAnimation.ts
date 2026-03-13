import { useEffect } from 'react'
import { useInView } from 'framer-motion'
import { useAnimation } from 'framer-motion'
import { useRef } from 'react'

/**
 * useScrollAnimation
 *
 * Returns a ref and animation controls that trigger a fade-up entrance
 * when the element enters the viewport. Re-triggers every time the
 * element leaves and re-enters the viewport so lazy-loaded sections
 * always animate correctly.
 */
export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const controls = useAnimation()
  const isInView = useInView(ref, { amount: threshold, once: false })

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, [isInView, controls])

  return { ref, controls, isInView }
}

/**
 * Standard fade-up variants used across the site.
 * Import and spread into a motion element's `variants` prop.
 */
export const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
}

/**
 * Stagger container — wraps a group of animated children.
 * Children should use fadeUpVariants (or any variant with hidden/visible).
 */
export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}
