# MomTo private backend deployment

The private backend is the system of record for the MomTo case. GitHub Pages is a public-safe dashboard/cache only.

## Required runtime secrets

Set these on the private host:

- `MOMTO_API_TOKEN`: long random bearer token used by the private client and worker.
- `MOMTO_VAULT_KEY`: Fernet key for encrypted CaseVault records. Generate with `python -c "from momto.case_vault import generate_key; print(generate_key())"`.
- `MOMTO_OPENAI_API_KEY`: optional; enables the research agent's model-backed planning.
- `MOMTO_RESEARCH_MODEL`: optional, defaults to `gpt-5.6`.
- `CORS_ORIGINS`: `https://gymwhaleysspot-dot.github.io`.

The private host must provide persistent storage mounted at `/data`. Never put genealogy, DNA, API keys, or vault keys in GitHub Pages or committed files.

## Render

The repository includes `render.yaml`. Create the service from the repository, attach the persistent disk, and fill the secret values above. The service exposes:

- `GET /healthz`
- authenticated `GET /api/momto/private/status`
- authenticated `POST /api/momto/ancestry/import`
- authenticated `GET /api/momto/private/graph`
- authenticated `POST /api/momto/private/research/enqueue`
- authenticated `POST /api/momto/private/research/run`
- authenticated `GET /api/momto/private/research/status`

## GitHub Actions

After the backend has a stable HTTPS URL, add these GitHub repository Actions secrets:

- `MOMTO_PRIVATE_API_URL`
- `MOMTO_API_TOKEN`

The existing always-on worker will then:

1. authenticate to the private backend;
2. verify the private graph/status;
3. enqueue a research job;
4. execute the research cycle against the persistent backend database;
5. publish only aggregate/private-safe state into `momto-live.json`.

If the secrets are absent, the workflow continues in public-safe local mode and does **not** pretend the private tree is connected.

## Verification

A deployment is considered connected only after the worker successfully writes `private_worker_scope: persistent-private-backend` to the public-safe snapshot. A green GitHub Actions run alone does not prove that a hosting provider is configured.
