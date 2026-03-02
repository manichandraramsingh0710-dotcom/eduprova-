import urllib.request
import json

data = json.dumps({"username": "2026999", "password": "pass"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/auth/login", data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as res:
        print(res.status)
except Exception as e:
    print("ERROR:", e)
