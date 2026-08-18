# Modal DeepSeek V4 provider

This optional deployment exposes DeepSeek V4 Pro through SGLang's OpenAI-compatible API. It follows the current Blackwell/MXFP4 serving shape: eight B200 GPUs, tensor parallelism of eight, the Blackwell SGLang image, the DeepSeek V4 tool/reasoning parsers, and EAGLE speculative decoding.

The endpoint scales to zero. Cold start includes model/container startup and may be long; hosted DeepSeek remains the recommended provider for the scheduled hackathon epochs. Modal demonstrates provider portability and open-weight self-hosting.

## Deploy

```bash
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install modal
modal setup
modal deploy infra/modal/deepseek_v4.py
```

The first build downloads weights into the persistent `agentic-rwa-huggingface-cache` volume.

## Authenticate

The server does not opt into unauthenticated access. Create a Modal proxy token for the deployed environment. Combine the token ID and secret as:

```text
wk-<token-id>.ws-<token-secret>
```

Configure `apps/agent/.env`:

```env
AGENT_PROVIDER=modal
AGENT_MODEL=deepseek-v4-pro
MODAL_BASE_URL=https://<workspace>--agentic-rwa-deepseek-v4.modal.run/v1
MODAL_API_KEY=wk-<token-id>.ws-<token-secret>
```

The OpenAI client sends the combined proxy token as `Authorization: Bearer ...`.

## Smoke test

```bash
npm run agent:smoke
```

A successful smoke test proves endpoint availability and structured tool-call compatibility. It does not remove Zod, evidence, policy, IPFS readback, simulation, or contract checks from the epoch pipeline.

## Cost controls

- `min_containers=0` avoids an always-warm eight-GPU replica.
- `scaledown_window=20 minutes` permits one warm follow-up while shutting down after inactivity.
- Run the main epoch schedule with hosted DeepSeek unless self-hosting is a judging requirement.
- Do not expose the endpoint without proxy authentication.
