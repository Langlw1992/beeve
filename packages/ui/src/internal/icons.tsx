import {splitProps, type Component, type JSX} from 'solid-js'

export type IconProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: number | string
  strokeWidth?: number | string
}

function createIcon(paths: () => JSX.Element): Component<IconProps> {
  return (props) => {
    const [local, rest] = splitProps(props, ['size', 'strokeWidth'])
    const size = local.size ?? 24
    const strokeWidth = local.strokeWidth ?? 1.75

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        {...rest}
      >
        {paths()}
      </svg>
    )
  }
}

export const AlertTriangle = createIcon(() => (
  <>
    <path d="M10.3 3.9 2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
))

export const Calendar = createIcon(() => (
  <>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
  </>
))

export const Check = createIcon(() => <path d="m5 12 4 4L19 6" />)

export const CheckCircle2 = createIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5L16 9.5" />
  </>
))

export const ChevronDown = createIcon(() => <path d="m6 9 6 6 6-6" />)

export const ChevronLeft = createIcon(() => <path d="m15 18-6-6 6-6" />)

export const ChevronRight = createIcon(() => <path d="m9 18 6-6-6-6" />)

export const ChevronUp = createIcon(() => <path d="m18 15-6-6-6 6" />)

export const ChevronsLeft = createIcon(() => (
  <>
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </>
))

export const ChevronsRight = createIcon(() => (
  <>
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </>
))

export const ChevronsUpDown = createIcon(() => (
  <>
    <path d="m7 10 5-5 5 5" />
    <path d="m7 14 5 5 5-5" />
  </>
))

export const Eye = createIcon(() => (
  <>
    <path d="M2.6 12s3.4-6 9.4-6 9.4 6 9.4 6-3.4 6-9.4 6-9.4-6-9.4-6Z" />
    <circle cx="12" cy="12" r="2.5" />
  </>
))

export const EyeOff = createIcon(() => (
  <>
    <path d="M3 3 21 21" />
    <path d="M10.6 6.3A10.8 10.8 0 0 1 12 6c6 0 9.4 6 9.4 6a17 17 0 0 1-4.2 4.7" />
    <path d="M6.4 6.4A17.3 17.3 0 0 0 2.6 12s3.4 6 9.4 6c1.4 0 2.7-.3 3.9-.8" />
    <path d="M10.9 10.9A2.5 2.5 0 0 0 14 14" />
  </>
))

export const Info = createIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v5" />
    <path d="M12 7h.01" />
  </>
))

export const Loader2 = createIcon(() => (
  <>
    <path d="M12 3a9 9 0 1 0 9 9" />
    <path d="M12 3v4" />
  </>
))

export const LoaderCircle = createIcon(() => (
  <>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </>
))

export const Minus = createIcon(() => <path d="M5 12h14" />)

export const PanelLeft = createIcon(() => (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </>
))

export const PanelLeftClose = createIcon(() => (
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="m15 10-3 2 3 2" />
  </>
))

export const Plus = createIcon(() => (
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
))

export const Search = createIcon(() => (
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>
))

export const X = createIcon(() => (
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
))

export const XCircle = createIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9 9 15" />
    <path d="m9 9 6 6" />
  </>
))
