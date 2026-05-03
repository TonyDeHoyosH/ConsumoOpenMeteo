import { LOCATIONS } from '@/lib/locations';

interface LocationSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function LocationSelector({ selected, onChange }: LocationSelectorProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-900 border border-slate-700 text-cyan-400 px-4 py-2 focus:outline-none focus:border-cyan-400 font-mono text-sm cursor-pointer w-full sm:w-auto"
    >
      {LOCATIONS.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}
