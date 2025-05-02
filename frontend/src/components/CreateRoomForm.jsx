import React, { useState } from "react";

export default function CreateRoomForm({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl]   = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("mp4"); // "mp4" ou "youtube"

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type !== "video/mp4") {
      return alert("Seuls les fichiers MP4 sont supportés");
    }
    setFile(f);
    setUrl(URL.createObjectURL(f));
  };

  const submit = () => {
    if (!name || !url) return alert("Nom et vidéo requis");
    if (mode === "youtube") {
      if (!/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/.test(url)) {
        return alert("URL YouTube invalide");
      }
      onCreate({ name, desc, url, source: "youtube" });
    } else {
      if (!file) return alert("Fichier MP4 requis");
      // En prod, uploader le fichier et récupérer l'URL publique ici.
      onCreate({ name, desc, url, source: "mp4" });
    }
  };

  return (
    <div className="create-panel">
      <h2>Créer un salon</h2>
      <input placeholder="Nom du salon" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />

      <div className="mode-switch">
        <button onClick={() => setMode("mp4")} className={mode === "mp4" ? "active" : ""}>
          Charger MP4
        </button>
        <button onClick={() => setMode("youtube")} className={mode === "youtube" ? "active" : ""}>
          URL YouTube
        </button>
      </div>

      {mode === "mp4" ? (
        <>
          <input type="file" accept="video/mp4" onChange={handleFileChange} />
          {file && <p>Fichier: <i>{file.name}</i></p>}
        </>
      ) : (
        <input
          placeholder="URL YouTube (https://www.youtube.com/watch?v=XYZ)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      )}

      <div className="form-actions">
        <button onClick={submit}>Créer</button>
        <button onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}
