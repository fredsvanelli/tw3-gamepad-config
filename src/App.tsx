import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Editor } from './components/Editor'
import { Landing } from './components/Landing'
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
          sizes="100vw"
          alt=""
        />
        <div className="hero-inner">
          <button
            type="button"
            className="brand"
            onClick={() => dispatch({ type: 'pickLayout', layout: null })}
            title={state.layout ? t.changeLayout : undefined}
          >
            {t.appTitle}
          </button>
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
        {state.layout ? (
          <Editor state={state} dispatch={dispatch} derived={derived} t={t} />
        ) : (
          <Landing t={t} onPick={(layout) => dispatch({ type: 'pickLayout', layout })} />
        )}

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
