# AI Praktikrapportvurdering

Vejledende AI-baseret feedback på praktikrapporter fra datamatikeruddannelsen på Erhvervsakademi København.

Brugeren indsætter eller uploader en praktikrapport (tekst, .md eller .pdf) og modtager struktureret feedback baseret på en rubric udledt af EK's egne vurderingskriterier.

## Arkitektur

```
frontend/   React 18 + Vite → GitHub Pages
backend/    Java 21 + Spring Boot 3.4 → Render (Docker)
```

Frontend kalder backend via REST. Backend kalder OpenAI Responses API med `gpt-4.1-nano`.

---

## Projektstruktur

```
├── .github/workflows/
│   └── deploy-frontend.yml     # GitHub Actions → GitHub Pages
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/dk/ek/vurdering/
│       │   ├── VurderingApplication.java
│       │   ├── config/WebConfig.java           # CORS
│       │   ├── controller/EvaluationController.java
│       │   ├── service/OpenAIService.java       # OpenAI-kald
│       │   └── dto/                             # Request/Response/CriteriaFeedback
│       └── resources/
│           ├── application.properties
│           └── prompts/system-prompt.txt        # Indlæses ved opstart
├── frontend/
│   ├── vite.config.js                          # Proxy /api → localhost:8080
│   └── src/
│       ├── App.jsx / App.css
│       └── components/
│           ├── EvaluationForm.jsx
│           └── EvaluationResult.jsx
├── data/                                        # Vurderingsgrundlag (kilde for rubric)
│   ├── dare-share-care.md
│   ├── krav-til-rapport.md
│   └── laeringsmaal.md
├── prompts/                                     # Dokumentation af Step 1-2
│   ├── rubric.md
│   ├── system-prompt.md
│   └── user-prompt-template.md
├── package.json                                 # npm run frontend / backend / dev
└── render.yaml                                  # Render deployment-konfiguration
```

---

## Kør lokalt

### Krav

- Java 21+ og Maven 3.9+
- Node 18+ og npm

### Opsætning

```bash
# Sæt API-nøgle (kræves af backenden)
export SECRETAPIKEY=sk-...

# Terminal 1 — backend på port 8080
npm run backend

# Terminal 2 — frontend på port 5173
npm run frontend
```

Eller start begge på én gang:

```bash
npm install   # kun første gang
npm run dev
```

Åbn <http://localhost:5173>.

---

## API

### `POST /api/evaluations`

Modtager rapporttekst som JSON.

**Request**
```json
{ "text": "Rapporttekst her..." }
```

### `POST /api/evaluations/file`

Modtager en fil via multipart/form-data (`.md`, `.txt` eller `.pdf`).

### Response (200)

```json
{
  "overallAssessment": "...",
  "criteriaFeedback": [
    { "criterion": "Formalia og omfang", "level": "high", "feedback": "..." }
  ],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "questions": ["...", "...", "...", "..."]
}
```

**Fejlkoder:** `400` ved tomt input · `500` ved fejl i OpenAI-kald

### Test med curl

```bash
curl -X POST http://localhost:8080/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"text": "Rapporttekst her..."}'
```

---

## Deployment

### Frontend → GitHub Pages

GitHub Actions bygger og deployer automatisk ved push til `main`.

Kræver to ting i repo-indstillingerne:
1. **Settings → Pages → Source:** GitHub Actions
2. **Settings → Secrets → Actions:** `VITE_API_URL` = din Render-backend-URL

### Backend → Render

Backenden er konfigureret via `render.yaml` og bygges med Docker.

Manuelt setup i Render-dashboardet:

| Felt | Værdi |
|------|-------|
| Environment | Docker |
| Dockerfile Path | `backend/Dockerfile` |
| Environment Variable | `SECRETAPIKEY` = din OpenAI-nøgle |

### API-nøgle lokalt

```bash
# Midlertidigt (kun denne session)
export SECRETAPIKEY=sk-...

# Permanent
echo 'export SECRETAPIKEY=sk-...' >> ~/.zshrc && source ~/.zshrc
```

---

## Refleksion

### Hvad virker godt
- Rubricen er tæt knyttet til EK's egne vurderingsdokumenter (krav, læringsmål, DARE/SHARE/CARE)
- Struktureret JSON-output giver konkret, sektionsopdelt feedback frem for løs tekst
- Systemprompten instruerer modellen i at pege på specifikke passager frem for at give generiske svar
- Fil-upload understøtter både .md (browser-side) og .pdf (server-side med PDFBox)

### Begrænsninger
- Modellen kan ikke verificere formalia den ikke kan læse (fx om en kvittering reelt er vedhæftet som bilag)
- Vurderingen er ikke-deterministisk — to kald på samme rapport giver ikke nødvendigvis identisk output
- `gpt-4.1-nano` er en kompakt model; meget lange eller komplekse rapporter kan give overfladisk analyse
- Endpointet har ingen autentifikation (acceptabelt for et skoleprojekt)
