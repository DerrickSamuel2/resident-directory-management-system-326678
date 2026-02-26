import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse residents, message neighbors, and manage profiles with privacy controls.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/directory"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open Directory
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">What’s inside</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Search and filter residents</li>
          <li>Resident profile details with privacy-aware fields</li>
          <li>In-app messaging and notifications</li>
          <li>Admin tools for managing residents</li>
        </ul>
      </section>
    </div>
  );
}
