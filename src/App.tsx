import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Editor } from './components/Editor'
import { Landing } from './components/Landing'
import { LOCALES, STRINGS } from './i18n/strings'
import { useAppState } from './state'
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
    <div className="app">
      <header className="header">
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
      </header>

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
  )
}
