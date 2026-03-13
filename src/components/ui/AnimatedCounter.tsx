import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  label?: string
  decimals?: number
}

export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2,
  label,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [displayValue, setDisplayValue] = useState('0')
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayValue(
          decimals > 0
            ? value.toFixed(decimals)
            : Math.round(value).toLocaleString()
        )
      },
    })

    return () => controls.stop()
  }, [isInView, target, duration, decimals])

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <span
        className="font-serif text-gold leading-none"
        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </span>
      {label && (
        <span className="text-white/60 text-sm font-sans font-medium tracking-wide mt-1">
          {label}
        </span>
      )}
    </div>
  )
}
