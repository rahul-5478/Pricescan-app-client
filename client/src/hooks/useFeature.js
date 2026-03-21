import { useState } from "react";

export function useFeature(apiFn) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const run = async (payload) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await apiFn(payload);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || "Request failed");
    } finally { setLoading(false); }
  };

  return { result, loading, error, run };
}
