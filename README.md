# AI-rapportvurderings-tool

Vejledende AI-baseret feedback på praktikrapporter, bygget som skoleopgave på datamatikeruddannelsen.

## Arkitektur

```
backend/   Java 21 + Spring Boot 3.4 (REST API)
frontend/  React 18 + Vite (SPA)
```

---

## Kom i gang lokalt

### Krav

- Java 21+ (`java -version`)
- Maven 3.9+ (`mvn -version`)
- Node 18+ + npm (`node -version`)

### 1. Sæt API-nøglen som miljøvariabel

```bash
export SECRETAPIKEY=din-openai-api-nøgle
```

### 2. Start backend og frontend (separat)

```bash
# Terminal 1 — backend (port 8080)
npm run backend

# Terminal 2 — frontend (port 5173)
npm run frontend
```

Eller start begge på én gang:

```bash
npm install        # installer concurrently (kun første gang)
npm run dev
```

Åbn <http://localhost:5173> i browseren.

---

## API-endpoint

### `POST /api/evaluations`

**Request:**
```json
{ "text": "Hele rapportteksten her..." }
```

**Response (200):**
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

**Fejlresponser:**
- `400` — tom opgavetekst
- `500` — fejl i OpenAI-kald

### Test med curl

```bash
curl -X POST http://localhost:8080/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"text": "Her indsættes rapportteksten..."}'
```

---

## Sæt SECRETAPIKEY

### Lokalt (macOS/Linux)
```bash
export SECRETAPIKEY=sk-...
```

Tilføj til `~/.zshrc` eller `~/.bash_profile` for permanent adgang.

### GitHub Secret (til deployment)
1. Gå til dit repo → **Settings → Secrets and variables → Actions**
2. Klik **New repository secret**
3. Navn: `SECRETAPIKEY`, Værdi: din API-nøgle

---

## Deployment

### Frontend → GitHub Pages

Byg frontend:
```bash
cd frontend && npm run build
```

Deploy `frontend/dist/` til GitHub Pages. Med GitHub Actions:
- Trigger: push til `main`
- Job: `npm run build` i `frontend/`
- Deploy `dist/` med `actions/deploy-pages`

**Vigtigt:** Frontend skal pege på backend-URL i produktion. Sæt `VITE_API_URL` som env var og brug den i `fetch`-kaldene (i stedet for relativ `/api`).

### Backend → Render

1. Opret nyt **Web Service** på [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `mvn package -DskipTests`
4. Start command: `java -jar target/vurdering-0.0.1-SNAPSHOT.jar`
5. Tilføj Environment Variable: `SECRETAPIKEY` = din nøgle

---

## Projektstruktur

```
AI-vurderings-tool/
├── package.json              # root-scripts: frontend / backend / dev
├── data/
│   ├── dare-share-care.md    # vurderingsgrundlag
│   ├── krav-til-rapport.md   # vurderingsgrundlag
│   └── laeringsmaal.md       # vurderingsgrundlag
├── prompts/
│   ├── rubric.md             # rubric (Step 1)
│   ├── system-prompt.md      # systemprompt (Step 2)
│   └── user-prompt-template.md
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/dk/ek/vurdering/
│       │   ├── VurderingApplication.java
│       │   ├── config/WebConfig.java        (CORS)
│       │   ├── controller/EvaluationController.java
│       │   ├── service/OpenAIService.java
│       │   └── dto/  (EvaluationRequest, EvaluationResponse, CriteriaFeedback)
│       └── resources/
│           ├── application.properties
│           └── prompts/system-prompt.txt    (indlæses ved opstart)
└── frontend/
    ├── package.json
    ├── vite.config.js        (proxy /api → localhost:8080)
    └── src/
        ├── App.jsx
        ├── App.css
        └── components/
            ├── EvaluationForm.jsx
            └── EvaluationResult.jsx
```

---

## Refleksion

### Hvad virker godt
- Rubricen er tæt knyttet til de tre kildefiler (krav, læringsmål, DARE/SHARE/CARE)
- Struktureret JSON-output giver konkret, sektionsopdelt feedback
- Systemprompten beder modellen om at pege på specifikke passager frem for generiske kommentarer
- Vite-proxyen gør at frontend og backend kan køre lokalt uden CORS-problemer

### Begrænsninger
- Modellen kan ikke verificere formalia (fx om kvitteringen reelt er vedhæftet)
- Vurderingen er ikke-deterministisk — to kald kan give lidt forskellige svar
- `gpt-4.1-nano` er en lille model; komplekse rapporter kan give overfladisk analyse
- Ingen autentifikation — endpointet er åbent (acceptabelt for skoleprojekt)
