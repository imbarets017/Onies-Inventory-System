export default function RecordModal({ title, fields, value, options = [], onChange, onClose, onSave }) {
  if (!value) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <form onSubmit={onSave} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{value.id ? `Edit ${title}` : `Add ${title}`}</h2><button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm">Close</button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => <label key={field.name} className={`block text-sm font-medium text-slate-700 ${field.wide ? 'sm:col-span-2' : ''}`}>
            {field.label}
            {field.type === 'select' ? <select required={field.required !== false} value={value[field.name] ?? ''} onChange={(event) => onChange(field.name, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Choose…</option>{(field.options || options).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input required={field.required !== false} type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 'any' : undefined} value={value[field.name] ?? ''} onChange={(event) => onChange(field.name, field.type === 'number' ? Number(event.target.value || 0) : event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />}
          </label>)}
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save record</button></div>
      </form>
    </div>
  );
}

