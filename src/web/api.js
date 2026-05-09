export async function apiGet(path) {
  const res = await fetch(path, { headers: { accept: "application/json" } });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON
  }
  if (!res.ok || !body || body.ok !== true) {
    const code = body && body.error && body.error.code ? body.error.code : `HTTP_${res.status}`;
    const message = body && body.error && body.error.message ? body.error.message : `Request failed: ${path}`;
    const err = new Error(message);
    err.code = code;
    err.hint = body && body.error ? body.error.hint || null : null;
    throw err;
  }
  return body.data;
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  let envelope = null;
  try {
    envelope = await res.json();
  } catch {
    // non-JSON
  }
  if (!res.ok || !envelope || envelope.ok !== true) {
    const errInfo = envelope && envelope.error ? envelope.error : {};
    const code = errInfo.code || `HTTP_${res.status}`;
    const message = errInfo.message || `Request failed: ${path}`;
    const err = new Error(message);
    err.code = code;
    err.hint = errInfo.hint || null;
    throw err;
  }
  return envelope.data;
}
