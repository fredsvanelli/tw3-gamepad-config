import type { Layout } from '../core/buttons'
import type { Strings } from '../i18n/strings'
import { ControllerArt } from './ControllerArt'

export function Landing({ t, onPick }: { t: Strings; onPick: (layout: Layout) => void }) {
  return (
    <main className="landing">
      <h1 className="landing-title">{t.pickLayout}</h1>
      <div className="landing-choices">
        {(['playstation', 'xbox'] as const).map((layout) => (
          <button key={layout} type="button" className="landing-choice" onClick={() => onPick(layout)}>
            <ControllerArt layout={layout} />
            <span className="landing-choice-label">{t[layout]}</span>
          </button>
        ))}
      </div>
      <p className="landing-hint">{t.pickLayoutHint}</p>
    </main>
  )
}
