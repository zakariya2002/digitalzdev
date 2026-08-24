import { useState, useEffect, useCallback, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useTeam } from '../../contexts/TeamContext'
import Avatar from './Avatar'
import type { ProjectFile } from '../../types/database'

const BUCKET = 'project-files'
const MAX_BYTES = 25 * 1024 * 1024

const LINK_TYPES = [
  { value: 'link', label: 'Lien' },
  { value: 'figma', label: 'Figma' },
  { value: 'drive', label: 'Google Drive' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: 'Autre' },
]

function humanSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

interface ProjectFilesPanelProps {
  projectId: string
}

/** Documents du projet : vrais fichiers déposés, et liens vers les outils externes. */
export default function ProjectFilesPanel({ projectId }: ProjectFilesPanelProps) {
  const { memberById } = useTeam()
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [fileType, setFileType] = useState('link')
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('project_files').select('*').eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (e) { setError('Impossible de charger les documents.'); return }
    setFiles((data || []) as ProjectFile[])
  }, [projectId])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const handleUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      setError(`« ${file.name} » dépasse 25 Mo. Passe par un lien Drive pour les fichiers lourds.`)
      return
    }
    setUploading(true)
    setError(null)

    const safeName = file.name.replace(/[^\w.\-]+/g, '_')
    const path = `${projectId}/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
    if (uploadError) {
      setError("Le fichier n'a pas pu être envoyé.")
      setUploading(false)
      return
    }

    const { data: profile } = await supabase.auth.getUser()
    const { error: rowError } = await supabase.from('project_files').insert({
      project_id: projectId,
      name: file.name,
      url: path,
      storage_path: path,
      file_type: 'upload',
      size_bytes: file.size,
      mime_type: file.type || null,
      uploaded_by: profile.user?.id ?? null,
    })
    if (rowError) {
      await supabase.storage.from(BUCKET).remove([path])
      setError("Le fichier a été envoyé mais n'a pas pu être référencé.")
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
    fetchFiles()
  }

  const openFile = async (file: ProjectFile) => {
    if (file.file_type !== 'upload' || !file.storage_path) {
      window.open(file.url, '_blank', 'noopener')
      return
    }
    const { data, error: e } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 120)
    if (e || !data) { setError("Le fichier n'a pas pu être ouvert."); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  const addLink = async () => {
    if (!name.trim() || !url.trim()) return
    const { error: e } = await supabase.from('project_files').insert({
      project_id: projectId, name: name.trim(), url: url.trim(), file_type: fileType,
    })
    if (e) { setError("Le lien n'a pas pu être ajouté."); return }
    setName(''); setUrl(''); setError(null)
    fetchFiles()
  }

  const remove = async (file: ProjectFile) => {
    if (file.storage_path) await supabase.storage.from(BUCKET).remove([file.storage_path])
    await supabase.from('project_files').delete().eq('id', file.id)
    fetchFiles()
  }

  const inputClass = 'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500'

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Déposer un fichier</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
            className="text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
          />
          {uploading && <span className="text-xs text-gray-400">Envoi en cours…</span>}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Maquettes, contrats signés, contenus client. 25 Mo par fichier.
        </p>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Ajouter un lien</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="Maquettes Figma" className={`${inputClass} flex-1`} />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                 placeholder="https://…" className={`${inputClass} flex-1`} />
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className={inputClass}>
            {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={addLink} disabled={!name.trim() || !url.trim()}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors">
            Ajouter
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Aucun document pour ce projet.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 px-4 py-3 group">
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${
                file.file_type === 'upload' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'
              }`}>
                {file.file_type === 'upload' ? 'Fichier' : LINK_TYPES.find(t => t.value === file.file_type)?.label || 'Lien'}
              </span>
              <button onClick={() => openFile(file)} className="flex-1 min-w-0 text-left">
                <p className="text-sm text-white truncate hover:text-blue-400 transition-colors">{file.name}</p>
                <p className="text-[11px] text-gray-500">
                  {humanSize(file.size_bytes)}
                  {file.size_bytes ? ' · ' : ''}
                  {format(parseISO(file.created_at), 'd MMM yyyy', { locale: fr })}
                </p>
              </button>
              {file.uploaded_by && <Avatar profile={memberById(file.uploaded_by)} size="sm" />}
              <button onClick={() => remove(file)}
                      className="text-xs text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
