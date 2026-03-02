import urllib.request
import json

data = json.dumps({"username": "E001", "password": "pass"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/auth/login", data=data, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as res:
    res_data = json.loads(res.read().decode())
    token = res_data["token"]
    print("TOKEN:", token)

req2 = urllib.request.Request("http://localhost:8000/api/tasks/me", headers={"Authorization": f"Bearer {token}"})
with urllib.request.urlopen(req2) as res:
    tasks = json.loads(res.read().decode())
    print("TASKS:", tasks)
