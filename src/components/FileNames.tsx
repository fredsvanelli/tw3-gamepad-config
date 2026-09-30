const FILE_NAME = 'input.settings'

/** Shows every mention of the Settings File name in a text as code. */
export function FileNames({ text }: { text: string }) {
  const parts = text.split(FILE_NAME)
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <code className="file-name">{FILE_NAME}</code>}
        </span>
      ))}
    </>
  )
}
