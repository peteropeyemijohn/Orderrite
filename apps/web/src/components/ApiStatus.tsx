"use client";

import { useEffect, useState } from "react";
import { en } from "shared";
import { API_URL } from "@/lib/api";

type Status = "checking" | "connected" | "error";

/** Asks the API's /health endpoint whether everything is running. */
async function fetchHealth(): Promise<Status> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    const body = (await res.json()) as { status?: string };
    return res.ok && body.status === "ok" ? "connected" : "error";
  } catch {
    return "error";
  }
}

/** Calls GET /health on the API and shows whether it answered. */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    void fetchHealth().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const retry = () => {
    setStatus("checking");
    void fetchHealth().then(setStatus);
  };

  if (status === "checking") {
    return <p className="text-neutral-500">{en.hello.apiChecking}</p>;
  }
  if (status === "connected") {
    return <p className="font-semibold text-emerald-700">{en.hello.apiConnected}</p>;
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-red-700">{en.hello.apiError}</p>
      <button
        type="button"
        onClick={retry}
        className="rounded-2xl bg-neutral-900 px-5 py-2 font-semibold text-white"
      >
        {en.hello.retry}
      </button>
    </div>
  );
}
