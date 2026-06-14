export function parseErrorBody(data, status) {
  return (
    data.error ||
    (Array.isArray(data.errors) && data.errors.length
      ? data.errors.map((e) => e.msg || e).join(' ')
      : null) ||
    (Array.isArray(data.errores) && data.errores.length ? data.errores.join(' ') : null) ||
    `Error ${status}`
  );
}

export async function readResponseText(res) {
  return res.text();
}

export function parseErrorResponse(res, text) {
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  return parseErrorBody(data, res.status);
}

export function throwIfNotOk(res, text) {
  if (res.ok) {
    return;
  }
  const msg = parseErrorResponse(res, text);
  const err = new Error(msg);
  err.status = res.status;
  throw err;
}

export function extractFilename(contentDisposition) {
  if (!contentDisposition) {
    return null;
  }

  const match = /filename="([^"]+)"/i.exec(contentDisposition);
  return match ? match[1] : null;
}
