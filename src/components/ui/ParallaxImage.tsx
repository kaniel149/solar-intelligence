import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  /** 0 = no parallax, 1 = moves as fast as scroll. Default: 0.3 */
  speed?: number
  /** Extra class applied to the outer wrapper (controls clipping/sizing) */
  wrapperClassName?: string
}

export function ParallaxImage({
  src,
  alt,
  className = '',
  speed = 0.3,
  wrapperClassName = '',
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Track scroll progress within this element's viewport window
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Map 0→1 scroll progress to a translateY offset.
  // Negative speed moves image up (classic parallax feel).
  const translateY = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * 100}%`, `-${speed * 100}%`]
  )

  return (
    <div
      ref={ref}
      className={['overflow-hidden', wrapperClassName].filter(Boolean).join(' ')}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{ translateY }}
        className={[
          'w-full h-full object-cover',
          // Scale up slightly so parallax movement doesn't reveal edges
          'scale-[1.25]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
