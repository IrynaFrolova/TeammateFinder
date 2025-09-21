import { useRef } from 'react'

export default function ImportExport({ onImport, onExport }) {
  const fileRef = useRef()
  const clickImport = () => fileRef.current?.click()
  const handleFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try{
      const text = await f.text()
      const data = JSON.parse(text)
      onImport(data)
    }catch(err){
      alert('Invalid JSON')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <>
      <input type="file" accept="application/json" ref={fileRef} className="hidden" onChange={handleFile}/>
      <button className="btn" type="button" onClick={clickImport}>Import</button>
      <button className="btn" type="button" onClick={onExport}>Export</button>
    </>
  )
}
