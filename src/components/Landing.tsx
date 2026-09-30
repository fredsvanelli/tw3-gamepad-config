import type { Layout } from '../core/buttons'
import type { Strings } from '../i18n/strings'
import playstationPhoto from '../assets/controller-playstation.webp'
import xboxPhoto from '../assets/controller-xbox.webp'

const PHOTOS: Record<Layout, string> = { playstation: playstationPhoto, xbox: xboxPhoto }

export function Landing({ t, onPick }: { t: Strings; onPick: (layout: Layout) => void }) {
  return (
    <main className="landing">
      <h1 className="landing-title">{t.pickLayout}</h1>
      <div className="landing-choices">
        {(['playstation', 'xbox'] as const).map((layout) => (
          <button key={layout} type="button" className="landing-choice" onClick={() => onPick(layout)}>
            <span className="controller-stage">
              <img className="controller-photo" src={PHOTOS[layout]} alt="" width="840" height="580" />
            </span>
            <span className="landing-choice-label">{t[layout]}</span>
          </button>
        ))}
      </div>
      <p className="landing-hint">{t.pickLayoutHint}</p>
    </main>
  )
}
