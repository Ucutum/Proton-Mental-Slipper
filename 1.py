import json
import requests

print(json.loads(
    requests.get(
        "https://dt.miet.ru/ppo_it/api/temp_hum/" + str(1),
        headers={"X-Auth-Token": "nnn"}).content
        ))