"""Authenticated, scale-to-zero DeepSeek V4 Pro server for the allocation agent.

Deploy:
    pip install modal
    modal setup
    modal deploy infra/modal/deepseek_v4.py

The endpoint is authenticated by Modal proxy tokens because `unauthenticated=True`
is intentionally not enabled. Configure the TypeScript agent with the endpoint's `/v1`
base URL and the combined `<token-id>.<token-secret>` proxy credential.
"""

from __future__ import annotations

import os
import subprocess
import time
from pathlib import Path

import modal

HERE = Path(__file__).parent
REPO_ID = os.environ.get("DEEPSEEK_V4_REPO_ID", "deepseek-ai/DeepSeek-V4-Pro")
SGLANG_PORT = 8000
GPU_TYPE = "B200"
GPU_COUNT = 8
MINUTES = 60
HOURS = 60 * MINUTES

image = modal.Image.from_registry(
    "lmsysorg/sglang:deepseek-v4-blackwell",
).entrypoint([])

hf_cache_volume = modal.Volume.from_name(
    "agentic-rwa-huggingface-cache",
    create_if_missing=True,
)

image = image.env(
    {
        "HF_XET_HIGH_PERFORMANCE": "1",
        "CUDA_VISIBLE_DEVICES": "0,1,2,3,4,5,6,7",
        "SGLANG_ENABLE_SPEC_V2": "1",
        "SGLANG_ENABLE_THINKING": "1",
        "SGLANG_JIT_DEEPGEMM_PRECOMPILE": "0",
    }
)


def download_model(repo_id: str) -> None:
    from huggingface_hub import snapshot_download

    snapshot_download(repo_id=repo_id)


image = image.run_function(
    download_model,
    args=(REPO_ID,),
    volumes={"/root/.cache/huggingface": hf_cache_volume},
)
image = image.add_local_file(
    HERE / "config_deepseek_v4.yaml",
    "/root/config.yaml",
)

app = modal.App("agentic-rwa-deepseek-v4", image=image)


def start_server() -> subprocess.Popen[str]:
    command = [
        "python",
        "-m",
        "sglang.launch_server",
        "--host",
        "0.0.0.0",
        "--port",
        str(SGLANG_PORT),
        "--model-path",
        REPO_ID,
        "--tp-size",
        str(GPU_COUNT),
        "--config",
        "/root/config.yaml",
    ]
    print("Starting SGLang:", " ".join(command), flush=True)
    return subprocess.Popen(command, start_new_session=True, text=True)


def wait_until_ready(timeout_seconds: int = 3 * HOURS) -> None:
    import requests

    deadline = time.monotonic() + timeout_seconds
    url = f"http://127.0.0.1:{SGLANG_PORT}/health"
    while time.monotonic() < deadline:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("SGLang is ready.", flush=True)
                return
        except requests.RequestException:
            pass
        time.sleep(5)
    raise TimeoutError("SGLang did not become healthy before startup timeout.")


@app.server(
    image=image,
    gpu=f"{GPU_TYPE}:{GPU_COUNT}",
    min_containers=0,
    scaledown_window=20 * MINUTES,
    startup_timeout=3 * HOURS,
    volumes={"/root/.cache/huggingface": hf_cache_volume},
    compute_region="us",
    routing_region="us-east",
    port=SGLANG_PORT,
    exit_grace_period=25,
    target_concurrency=10,
)
class Server:
    process: subprocess.Popen[str]

    @modal.enter()
    def enter(self) -> None:
        self.process = start_server()
        wait_until_ready()

    @modal.exit()
    def exit(self) -> None:
        if self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=20)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait(timeout=10)
