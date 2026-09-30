import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Editor } from './components/Editor'
import { LOCALES, STRINGS } from './i18n/strings'
import { useAppState } from './state'
import hero960 from './assets/hero-960.webp'
import hero1920 from './assets/hero-1920.webp'
import hero3840 from './assets/hero-3840.webp'
import type { Locale } from './data/commands'

export function App() {
  const { state, dispatch, derived } = useAppState()
  const t = STRINGS[state.locale]
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    document.documentElement.lang = state.locale
  }, [state.locale])

  return (
    <>
      <header className="hero">
        <img
          className="hero-image"
          src={hero1920}
          srcSet={`${hero960} 960w, ${hero1920} 1920w, ${hero3840} 3840w`}
          // Cover on the full viewport: the drawn width follows the height on most screens (the image is 3.1:1).
          sizes="max(100vw, 310vh)"
          alt=""
        />
        <div className="hero-inner">
          <div>
            <h1 className="brand">{t.appTitle}</h1>
            <p className="tagline">{t.platformHint}</p>
          </div>
          <label className="language">
            <span className="visually-hidden">{t.language}</span>
            <select value={state.locale} onChange={(e) => dispatch({ type: 'setLocale', locale: e.target.value as Locale })}>
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="app">
        <Editor state={state} dispatch={dispatch} derived={derived} t={t} />

        {needRefresh && (
          <div className="update-toast" role="status">
            <span>{t.updateAvailable}</span>
            <button type="button" className="btn btn-primary btn-small" onClick={() => void updateServiceWorker(true)}>
              {t.reload}
            </button>
            <button type="button" className="btn btn-small" onClick={() => setNeedRefresh(false)}>
              {t.dismiss}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
