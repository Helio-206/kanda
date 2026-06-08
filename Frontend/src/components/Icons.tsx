interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export function IconReporte({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M30 12H18C16.8954 12 16 12.8954 16 14V34C16 35.1046 16.8954 36 18 36H30C31.1046 36 32 35.1046 32 34V14C32 12.8954 31.1046 12 30 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 32C24.5523 32 25 31.5523 25 31C25 30.4477 24.5523 30 24 30C23.4477 30 23 30.4477 23 31C23 31.5523 23.4477 32 24 32Z" fill={color}/>
      <path d="M24 16L24 16.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 16H28" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="23" r="4" stroke={color} strokeWidth="1.5"/>
      <path d="M22 23L24 21L26 23" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 21V25" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconAnalise({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 16C24 16 24 20 20 22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="2" stroke={color} strokeWidth="1.5"/>
      <circle cx="18" cy="20" r="1.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="30" cy="20" r="1.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="20" cy="30" r="1.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="28" cy="30" r="1.5" stroke={color} strokeWidth="1.5"/>
      <path d="M18 20L24 24L30 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 24L20 30" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 24L28 30" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M35 15L38 18L42 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconEncaminhamento({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 12H26C27.1046 12 28 12.8954 28 14V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 12H26C27.1046 12 28 12.8954 28 14V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 6)"/>
      <path d="M10 18H20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 22H18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M34 18V30" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 26L34 30L38 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 34H38V38H30V34Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 34V31C32 30.4477 32.4477 30 33 30H35C35.5523 30 36 30.4477 36 31V34" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconFotografia({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="14" width="32" height="24" rx="3" stroke={color} strokeWidth="1.5"/>
      <circle cx="24" cy="26" r="7" stroke={color} strokeWidth="1.5"/>
      <circle cx="24" cy="26" r="4" stroke={color} strokeWidth="1.5"/>
      <circle cx="24" cy="26" r="1.5" fill={color}/>
      <path d="M18 14L20 10H28L30 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="34" cy="18" r="1.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function IconProcessing({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="3" stroke={color} strokeWidth="1.5"/>
      <circle cx="14" cy="16" r="2" stroke={color} strokeWidth="1.5"/>
      <circle cx="34" cy="16" r="2" stroke={color} strokeWidth="1.5"/>
      <circle cx="14" cy="32" r="2" stroke={color} strokeWidth="1.5"/>
      <circle cx="34" cy="32" r="2" stroke={color} strokeWidth="1.5"/>
      <path d="M16 17L22 22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 17L26 22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 31L22 26" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 31L26 26" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 8V12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 36V40" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 24H12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M36 24H40" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLocalizacao({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M24 10C18.477 10 14 14.477 14 20C14 28 24 38 24 38C24 38 34 28 34 20C34 14.477 29.523 10 24 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="20" r="4" stroke={color} strokeWidth="1.5"/>
      <path d="M24 4V7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M38 20H41" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 20H10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M33.5 10.5L35.5 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14.5 10.5L12.5 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconEntidade({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 18H38V40H10V18Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 18V12L24 6L32 12V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 40V30H28V40" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 24H18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M23 24H25" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 24H32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 28H18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M23 28H25" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 28H32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconResolucao({ size = 48, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1.5"/>
      <path d="M18 24L22 28L30 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
