import requests
import json


class TemperatureSensorError(TypeError):
    pass


class HumiditySensorError(TypeError):
    pass


def save_request_get(request, error):
    if request.status_code == 404:
        raise error
    data = request.json()
    if data.get('code') != 404:
        return data
    raise error


def save_request_patch(error, group, **kwargs):
    request = requests.patch(f'https://dt.miet.ru/ppo_it/api/{group}/', data=json.dumps(kwargs))
    if request.status_code == 404:
        raise error
    data = request.json()
    if data.get('code') != 404:
        return data
    raise error


class GreenhouseAPI:
    @staticmethod
    def get_temperature_info(device_id: int) -> dict:
        request = requests.get(f'https://dt.miet.ru/ppo_it/api/temp_hum/{device_id}')
        return save_request_get(request, TemperatureSensorError)

    @staticmethod
    def get_humidity_info(device_id: int) -> dict:
        request = requests.get(f'https://dt.miet.ru/ppo_it/api/temp_hum/{device_id}')
        return save_request_get(request, HumiditySensorError)