"use client";

import { useCallback, useEffect, useState } from "react";

type ClusterRecord = {
  id: string;
  ventureKey: string;
  source: "manual" | "atlas";
  status: "active" | "provisioning" | "failed";
  mongoUri?: string;
  mongoUriMasked?: string;
  clusterName?: string;
  lastError?: string;
  notes?: string;
};

export function VentureClusterRegistry() {
  const [items, setItems] = useState<ClusterRecord[]>([]);
  const [ventureKey, setVentureKey] = useState("");
  const [mongoUri, setMongoUri] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/platform/venture-clusters");
    const data = (await res.json()) as { items?: ClusterRecord[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load registry.");
      return;
    }
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      const res = await fetch("/api/platform/venture-clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { record?: ClusterRecord; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }
      if (data.record?.mongoUri) {
        setInfo(`Saved. URI for ${data.record.ventureKey}: copy below for CRM / next venture.`);
      } else if (data.record?.status === "provisioning") {
        setInfo(`Atlas cluster provisioning for ${data.record.ventureKey}. Refresh in a few minutes.`);
      }
      await load();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-medium">Venture MongoDB registry</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Central admin DB (from server <code className="text-xs">MONGODB_URI</code>) tracks each venture&apos;s
          cluster. Link an existing URI or request a new Atlas cluster — use the URI in CRM for the next
          application.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Venture key
            <input
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm"
              placeholder="rofyt"
              value={ventureKey}
              onChange={(e) => setVentureKey(e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            MongoDB URI (link existing cluster)
            <input
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs"
              placeholder="mongodb+srv://..."
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            Notes
            <input
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !ventureKey.trim() || !mongoUri.trim()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
            onClick={() =>
              void post({
                mode: "manual",
                ventureKey: ventureKey.trim().toLowerCase(),
                mongoUri: mongoUri.trim(),
                notes: notes.trim() || undefined,
              })
            }
          >
            Test and save URI
          </button>
          <button
            type="button"
            disabled={pending || !ventureKey.trim()}
            className="rounded-md border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
            onClick={() =>
              void post({
                mode: "atlas",
                ventureKey: ventureKey.trim().toLowerCase(),
                notes: notes.trim() || undefined,
              })
            }
          >
            Create Atlas cluster
          </button>
        </div>

        {info ? <p className="mt-3 text-sm text-emerald-400">{info}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="font-medium">All ventures</h3>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No venture clusters registered yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((row) => (
              <li key={row.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-medium text-zinc-100">{row.ventureKey}</span>
                  <span className="text-xs text-zinc-500">
                    {row.source} · {row.status}
                    {row.clusterName ? ` · ${row.clusterName}` : ""}
                  </span>
                </div>
                {row.mongoUri ? (
                  <code className="mt-2 block break-all text-xs text-emerald-300/90">{row.mongoUri}</code>
                ) : row.mongoUriMasked ? (
                  <p className="mt-2 text-xs text-zinc-500">{row.mongoUriMasked}</p>
                ) : null}
                {row.lastError ? <p className="mt-2 text-xs text-amber-400">{row.lastError}</p> : null}
                {row.source === "atlas" && row.status !== "active" ? (
                  <button
                    type="button"
                    className="mt-2 text-xs text-zinc-400 underline hover:text-zinc-200"
                    disabled={pending}
                    onClick={() => void post({ mode: "refresh", ventureKey: row.ventureKey })}
                  >
                    Refresh from Atlas
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
