import type { Layout } from '../core/buttons'

const BODY =
  'M92 40c-30 0-52 18-62 52L8 190c-6 30 10 50 34 50 18 0 30-10 42-28l22-32c6-8 12-12 22-12h144c10 0 16 4 22 12l22 32c12 18 24 28 42 28 24 0 40-20 34-50L370 92c-10-34-32-52-62-52-22 0-34 10-52 10H144c-18 0-30-10-52-10z'

/** Simplified drawing of a PlayStation or Xbox pad. Not an official image. */
export function ControllerArt({ layout }: { layout: Layout }) {
  const ps = layout === 'playstation'
  const face = ps
    ? [
        { x: 318, y: 78, el: <path d="M-6 3.5l6-10 6 10z" fill="none" stroke="#5fc9a8" strokeWidth="2.5" strokeLinejoin="round" /> },
        { x: 346, y: 104, el: <circle r="6" fill="none" stroke="#e86a6a" strokeWidth="2.5" /> },
        { x: 318, y: 130, el: <path d="M-5-5l10 10M5-5L-5 5" stroke="#7aa7e8" strokeWidth="2.5" strokeLinecap="round" /> },
        { x: 290, y: 104, el: <rect x="-5.5" y="-5.5" width="11" height="11" fill="none" stroke="#d98cc4" strokeWidth="2.5" /> },
      ]
    : [
        { x: 318, y: 78, el: <text y="5" textAnchor="middle" fontSize="15" fontWeight="700" fill="#e8b731">Y</text> },
        { x: 346, y: 104, el: <text y="5" textAnchor="middle" fontSize="15" fontWeight="700" fill="#d9453b">B</text> },
        { x: 318, y: 130, el: <text y="5" textAnchor="middle" fontSize="15" fontWeight="700" fill="#5bb04a">A</text> },
        { x: 290, y: 104, el: <text y="5" textAnchor="middle" fontSize="15" fontWeight="700" fill="#3f7fd9">X</text> },
      ]
  const leftStick = ps ? { x: 146, y: 150 } : { x: 88, y: 104 }
  const dpad = ps ? { x: 88, y: 104 } : { x: 146, y: 146 }
  return (
    <svg className="controller-art" viewBox="0 0 400 260" role="img" aria-hidden="true">
      <path d="M70 44c8-18 28-26 52-24l14 20H72zM330 44c-8-18-28-26-52-24l-14 20h64z" className="art-shoulder" />
      <path d={BODY} className="art-body" />
      {ps && <rect x="150" y="54" width="100" height="56" rx="10" className="art-panel" />}
      {!ps && <circle cx="200" cy="72" r="14" className="art-panel" />}
      <g transform={`translate(${dpad.x} ${dpad.y}) scale(0.8)`}>
        <path d="M-8-26h16v18h18v16H8v18H-8V8h-18V-8h18z" className="art-detail" />
      </g>
      <circle cx={leftStick.x} cy={leftStick.y} r="22" className="art-stick-well" />
      <circle cx={leftStick.x} cy={leftStick.y} r="15" className="art-stick" />
      <circle cx="254" cy="150" r="22" className="art-stick-well" />
      <circle cx="254" cy="150" r="15" className="art-stick" />
      {face.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          <circle r="13" className="art-face" />
          {f.el}
        </g>
      ))}
      <rect x={ps ? 132 : 170} y={ps ? 58 : 100} width="12" height="7" rx="3.5" className="art-detail" />
      <rect x={ps ? 256 : 218} y={ps ? 58 : 100} width="12" height="7" rx="3.5" className="art-detail" />
    </svg>
  )
}
