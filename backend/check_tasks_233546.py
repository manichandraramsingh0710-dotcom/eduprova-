import urllib.request
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
data = json.dumps({"username": "233546", "password": "pass"}).encode("utf-8")
try:
    req = urllib.request.Request("http://localhost:8000/api/auth/login", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as res:
        res_data = json.loads(res.read().decode())
        token = res_data["token"]
        print("TOKEN:", token)

        req2 = urllib.request.Request("http://localhost:8000/api/tasks/me", headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req2) as res2:
            tasks = json.loads(res2.read().decode())
            print("TASKS:", tasks)
except Exception as e:
    print("ERR:", e)
