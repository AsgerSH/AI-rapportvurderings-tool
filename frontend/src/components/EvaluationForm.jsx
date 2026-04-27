import { useState, useRef } from 'react';

function EvaluationForm({ onEvaluate, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [textareaValue, setTextareaValue] = useState('');
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTextareaValue(ev.target.result);
        setSelectedFile(null);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      setSelectedFile(file);
      setTextareaValue('');
    } else {
      alert('Kun .pdf, .md og .txt filer er understøttet');
      e.target.value = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (selectedFile) {
      onEvaluate({ file: selectedFile });
    } else if (textareaValue.trim()) {
      onEvaluate({ text: textareaValue.trim() });
    }
  }

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const canSubmit = !loading && (selectedFile || textareaValue.trim());

  return (
    <form className="eval-form" onSubmit={handleSubmit}>
      <div className="form-top-row">
        <label className="form-label">Indsæt praktikrapport</label>
        <label className="file-button">
          &#128196; Vælg fil (.md / .pdf)
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.pdf"
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>

      {selectedFile ? (
        <div className="file-selected">
          <span>&#128196; {selectedFile.name}</span>
          <button type="button" className="file-clear" onClick={clearFile} title="Fjern fil">&#10005;</button>
        </div>
      ) : (
        <textarea
          className="form-textarea"
          placeholder="Sæt rapportteksten ind her, eller vælg en fil ovenfor..."
          rows={16}
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
        />
      )}

      <button type="submit" className="eval-button" disabled={!canSubmit}>
        {loading
          ? <><span className="spinner" />Vurderer...</>
          : 'Evaluér rapport'}
      </button>
    </form>
  );
}

export default EvaluationForm;
