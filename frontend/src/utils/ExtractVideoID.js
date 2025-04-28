export function extractVideoID(url) {
    try {
      const parsed = new URL(url);                                   // utilise l’API URL du navigateur :contentReference[oaicite:0]{index=0}
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.slice(1);
      }
      return parsed.searchParams.get('v');                            // get() renvoie la valeur du paramètre v :contentReference[oaicite:1]{index=1}
    } catch {
      return null;
    }
}
