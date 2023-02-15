import requests


def get_all_temp_hum(token: str) -> dict:
    ans = {}
    for i in range(1, 5):
        ans[i] = requests.get(f'https://dt.miet.ru/ppo_it/api/temp_hum/{i}', params={"X-Auth-Token": token}).json()
    return ans


def fork_manipulate(token: str, value: int) -> None:
    req = {"X-Auth-Token": token, 'state': value}
    requests.patch('https://dt.miet.ru/ppo_it/api/fork_drive/', params=req)


def watering_manipulate(token: str, device_id: int, state_value: int) -> None:
    req = dict()
    req["X-Auth-Token"] = token
    req['id'] = device_id
    req['state'] = state_value
    requests.patch('https://dt.miet.ru/ppo_it/api/watering', params=req)


def total_hum_manipulate(token: str, value: int) -> None:
    req = {"X-Auth-Token": token, 'state': value}
    requests.patch('https://dt.miet.ru/ppo_it/api/total_hum', params=req)
