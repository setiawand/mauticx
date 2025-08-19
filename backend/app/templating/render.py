import subprocess, tempfile, json

# Requires node "mjml" CLI in the web image or mount; in dev you can swap with server-side mjml2html over HTTP.

def render_mjml(mjml: str, vars: dict[str, str]) -> str:
    # naive {{var}} replacement
    for k, v in vars.items():
        mjml = mjml.replace(f"{{{{{k}}}}}", str(v))
    with tempfile.NamedTemporaryFile(suffix=".mjml", delete=False, mode="w") as f:
        f.write(mjml)
        path = f.name
    out = subprocess.run(["npx", "mjml", path, "-s"], capture_output=True, text=True, check=True)
    return out.stdout