import { useTeam } from '../../contexts/TeamContext'
import Avatar from './Avatar'

interface AssigneeSelectProps {
  value: string | null
  onChange: (id: string | null) => void
  label?: string
}

export default function AssigneeSelect({ value, onChange, label = 'Responsable' }: AssigneeSelectProps) {
  const { members, memberById } = useTeam()
  const selected = memberById(value)

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <Avatar profile={selected} size="md" />
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Non assignée</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.full_name}{m.job_title ? ` — ${m.job_title}` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
