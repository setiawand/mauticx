from sqlalchemy.sql import text

# Supported ops: eq | contains (tags) | attr path eq

def compile_segment(defn: dict) -> tuple[str, dict]:
    clauses = []
    params = {}

    def walk(node, idx=[0]):
        t = node.get("op", "AND").upper()
        if "filters" in node:
            parts = [walk(n) for n in node["filters"]]
            return f" (" + f" {t} ".join(parts) + ") "
        field, op, value = node.get("field"), node.get("op"), node.get("value")
        key = f"p{idx[0]}"; idx[0]+=1
        if field == "tags" and op == "contains":
            params[key] = value
            return f" tags::jsonb ? :{key} "
        if field.startswith("attributes.") and op == "eq":
            col = field.split(".",1)[1]
            params[key] = value
            return f" (attributes->>:col_{key}) = :{key} ".replace(":col_"+key, f"'{col}'")
        if field == "email" and op == "eq":
            params[key] = value
            return f" email = :{key} "
        raise ValueError("unsupported filter")

    where = walk(defn)
    sql = f"SELECT id FROM contact WHERE status='subscribed' AND ({where})"
    return sql, params
