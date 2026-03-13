import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  target?: string
  rel?: string
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-base rounded-xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-gold text-dark font-semibold',
    'shadow-[0_0_0_0_rgba(232,168,32,0)] hover:shadow-[0_0_24px_4px_rgba(232,168,32,0.35)]',
    'border border-transparent',
  ].join(' '),
  secondary: [
    'bg-white/5 text-white font-medium',
    'border border-white/20 hover:border-white/40',
    'backdrop-blur-md',
  ].join(' '),
}

const MotionAnchor = motion.create('a')
const MotionButton = motion.create('button')

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  href,
  disabled = false,
  type = 'button',
  target,
  rel,
}: ButtonProps) {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-sans cursor-pointer select-none',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
    disabled ? 'opacity-40 pointer-events-none' : '',
    sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.03 },
    whileTap: disabled ? {} : { scale: 0.97 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  }

  if (href) {
    return (
      <MotionAnchor
        href={href}
        target={target}
        rel={rel}
        className={baseClasses}
        onClick={onClick}
        {...motionProps}
      >
        {children}
      </MotionAnchor>
    )
  }

  return (
    <MotionButton
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {children}
    </MotionButton>
  )
}
