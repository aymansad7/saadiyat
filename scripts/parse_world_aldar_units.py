import html
import json
import sys


def parse_units(html_path: str, prefix: str) -> list[dict]:
    raw = html.unescape(open(html_path, "r", encoding="utf-8").read())
    decoded = raw.replace('\\"', '"').replace('\\\\', '\\')
    decoder = json.JSONDecoder()
    units: dict[str, dict] = {}
    cursor = 0

    while True:
        start = decoded.find('{"unitType":', cursor)
        if start == -1:
            break
        try:
            row, consumed = decoder.raw_decode(decoded[start:])
        except json.JSONDecodeError:
            cursor = start + 12
            continue
        cursor = start + consumed
        unit_number = row.get("unitNumber")
        if isinstance(unit_number, str) and unit_number.startswith(prefix):
            units[unit_number] = row

    return [units[key] for key in sorted(units)]


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("usage: parse_world_aldar_units.py INPUT_HTML UNIT_PREFIX OUTPUT_JSON")
    rows = parse_units(sys.argv[1], sys.argv[2])
    with open(sys.argv[3], "w", encoding="utf-8") as target:
        json.dump(rows, target, ensure_ascii=False, indent=2)
    print(json.dumps({"units": len(rows), "output": sys.argv[3]}))
