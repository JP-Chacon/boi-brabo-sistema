(function () {
  /**
   * Base da API: mesma origem quando o painel é servido pelo Express.
   * Em servidor estático (ex.: Live Server :5500), aponta para a API em :3000 no mesmo host.
   * Sobrescreva com window.__API_BASE_URL__ ou <meta name="api-base-url" content="http://...">.
   */
  function resolveApiBaseUrl() {
    if (typeof window.__API_BASE_URL__ === "string" && window.__API_BASE_URL__.trim()) {
      return window.__API_BASE_URL__.trim().replace(/\/$/, "");
    }
    const meta = document.querySelector('meta[name="api-base-url"]');
    const fromMeta = meta?.getAttribute("content")?.trim();
    if (fromMeta) return fromMeta.replace(/\/$/, "");

    const o = window.location.origin;
    if (!o || o === "null") return "http://localhost:3000";

    const port = window.location.port;
    const host = (window.location.hostname || "").toLowerCase();
    if (port && (host === "localhost" || host === "127.0.0.1")) {
      if (port === "5500" || port === "8080") {
        return `${window.location.protocol}//${host}:3000`;
      }
    }
    return o;
  }

  window.resolveApiBaseUrl = resolveApiBaseUrl;
})();
