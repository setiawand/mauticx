# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

import importlib
import pkgutil
from typing import Any

# -------- App setup --------
app = FastAPI(title="MauticX API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

# -------- Auto register all routers in app.routes.* --------
def include_all_routers(app: FastAPI) -> None:
    """
    Discover and include every module in app.routes.* that exposes a `router` (APIRouter).
    """
    from . import routes  # ensure package is importable

    pkg_name = routes.__name__  # 'app.routes'
    for finder, module_name, ispkg in pkgutil.iter_modules(routes.__path__):
        if ispkg:
            # skip subpackages; if you need, you can recurse here
            continue
        mod = importlib.import_module(f"{pkg_name}.{module_name}")
        router: Any = getattr(mod, "router", None)
        if router is not None:
            app.include_router(router)
            # Optional: log to stdout so we know what's loaded
            print(f"[routers] mounted: {pkg_name}.{module_name}")

include_all_routers(app)
