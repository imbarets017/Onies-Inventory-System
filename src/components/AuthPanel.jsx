import { useState } from 'react';

export default function AuthPanel({ setupRequired, onSubmit, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit({ name, email, password, password_confirmation: passwordConfirmation, remember });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-800">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Onies Inventory</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{setupRequired ? 'Create your administrator account' : 'Sign in to inventory'}</h1>
        <p className="mt-2 text-sm text-slate-600">{setupRequired ? 'This first account will manage users and inventory access.' : 'Use your account credentials to continue.'}</p>
        {error ? <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {setupRequired ? <label className="block text-sm font-medium">Name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label> : null}
          <label className="block text-sm font-medium">Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="block text-sm font-medium">Password<input required type="password" minLength={setupRequired ? 10 : 1} autoComplete={setupRequired ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          {setupRequired ? <label className="block text-sm font-medium">Confirm password<input required type="password" minLength="10" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label> : <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Remember me</label>}
          <button disabled={busy} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Please wait…' : setupRequired ? 'Create administrator' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
