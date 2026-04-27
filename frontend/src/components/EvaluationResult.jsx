const LEVEL_LABELS = { low: 'Lav', medium: 'Middel', high: 'Høj' };
const LEVEL_CLASSES = { low: 'level-low', medium: 'level-medium', high: 'level-high' };
const CARD_CLASSES  = { low: 'level-low-card', medium: 'level-medium-card', high: 'level-high-card' };

function Section({ accent, heading, children }) {
  return (
    <section className={`result-section accent-${accent}`}>
      <div className="section-heading">
        <h3>{heading}</h3>
      </div>
      {children}
    </section>
  );
}

function EvaluationResult({ result }) {
  return (
    <div className="result">
      <div className="result-title-row">
        <h2 className="result-title">Vejledende vurdering</h2>
        <span className="result-disclaimer">genereret af AI — ikke en endelig bedømmelse</span>
      </div>

      <Section accent="overall" heading="Samlet vurdering">
        <p>{result.overallAssessment}</p>
      </Section>

      <section className="result-section">
        <div className="section-heading">
          <h3>Kriteriefeedback</h3>
        </div>
        <div className="criteria-list">
          {result.criteriaFeedback.map((item, i) => (
            <div key={i} className={`criterion-card ${CARD_CLASSES[item.level] ?? ''}`}>
              <div className="criterion-header">
                <span className="criterion-name">{item.criterion}</span>
                <span className={`criterion-level ${LEVEL_CLASSES[item.level] ?? ''}`}>
                  {LEVEL_LABELS[item.level] ?? item.level}
                </span>
              </div>
              <p className="criterion-feedback">{item.feedback}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="result-columns">
        <Section accent="strengths" heading="Styrker">
          <ul>
            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>

        <Section accent="weaknesses" heading="Svagheder">
          <ul>
            {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </Section>
      </div>

      <Section accent="improvements" heading="Forbedringsforslag">
        <ul>
          {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
        </ul>
      </Section>

      <Section accent="questions" heading="Spørgsmål til videre dialog">
        <ol>
          {result.questions.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </Section>
    </div>
  );
}

export default EvaluationResult;
