const device_data = {
    "window": ["открыть", "закрыть", "Форточка открыта", "Форточка закрыта"],
    "humidification": ["включить", "выключить", "Увлажнение включень", "Увлажнение выключено"],
    "watering_1": ["полить", "перестать поливать", "Поливается", "Не поливается"],
    "watering_2": ["полить", "перестать поливать", "Поливается", "Не поливается"],
    "watering_3": ["полить", "перестать поливать", "Поливается", "Не поливается"],
    "watering_4": ["полить", "перестать поливать", "Поливается", "Не поливается"],
    "watering_5": ["полить", "перестать поливать", "Поливается", "Не поливается"],
    "watering_6": ["полить", "перестать поливать", "Поливается", "Не поливается"]
}


const device_values_url = "/api/device_values/"


async function updateDevice(device_name, update=true)
{
    var devise = document.getElementsByName(device_name)[0]
    var devise_title = document.getElementsByName(device_name + "_state")[0]
    var on_state = device_data[device_name][1]
    var ton_state = device_data[device_name][2]
    var off_state = device_data[device_name][0]
    var toff_state = device_data[device_name][3]

    console.log(devise)

    var xhr = new XMLHttpRequest()
    xhr.open("POST", "/greenhouse", false)

    xhr.onload = function() {
        console.log(`Загружено: ${xhr.status} ${xhr.response}`);
        var cont = JSON.parse(xhr.response)
        var state = cont["state"]
        if (state)
        {
            devise.innerHTML = on_state
            devise_title.innerHTML = ton_state
        }
        else
        {
            devise.innerHTML = off_state
            devise_title.innerHTML = toff_state
        }
    };
    
    xhr.onerror = function() { // происходит, только когда запрос совсем не получилось выполнить
    console.log(`Ошибка соединения. Status: ${xhr.status}`);
    };
    
    xhr.onprogress = function(event) { // запускается периодически
        // event.loaded - количество загруженных байт
        // event.lengthComputable = равно true, если сервер присылает заголовок Content-Length
        // event.total - количество байт всего (только если lengthComputable равно true)
        console.log(`Загружено ${event.loaded} из ${event.total}`);
    };

    xhr.send(JSON.stringify({"devise": device_name, "update": update}))
}

var is_working = true

var data = {
    "temp_1": 0,
    "temp_2": 0,
    "temp_3": 0,
    "temp_4": 0,
    "air_1": 0,
    "air_2": 0,
    "air_3": 0,
    "air_4": 0,
    "soil_1": 0,
    "soil_2": 0,
    "soil_3": 0,
    "soil_4": 0,
    "soil_5": 0,
    "soil_6": 0
}

function updateSensord()
{
    document.getElementsByName("window_par")[0].innerHTML = Math.round((
        data["temp_1"] + data["temp_2"] + data["temp_3"] + data["temp_4"]
    ) / 4 * 100) / 100
    document.getElementsByName("humidification_par")[0].innerHTML = Math.round((
        data["air_1"] + data["air_2"] + data["air_3"] + data["air_4"]
    ) / 4 * 100) / 100
    document.getElementsByName("watering_1_par")[0].innerHTML = Math.round((
        data["soil_1"]) * 100) / 100
    document.getElementsByName("watering_2_par")[0].innerHTML = Math.round((
        data["soil_2"]) * 100) / 100
    document.getElementsByName("watering_3_par")[0].innerHTML = Math.round((
        data["soil_3"]) * 100) / 100
    document.getElementsByName("watering_4_par")[0].innerHTML = Math.round((
        data["soil_4"]) * 100) / 100
    document.getElementsByName("watering_5_par")[0].innerHTML = Math.round((
        data["soil_5"]) * 100) / 100
    document.getElementsByName("watering_6_par")[0].innerHTML = Math.round((
        data["soil_6"]) * 100) / 100
}

var n = Object.keys(data)[0]

function updateData () {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", device_values_url + n, false)

    xhr.onload = function() {
        console.log(`Загружено: ${xhr.status} ${xhr.response}`);
        var cont = JSON.parse(xhr.response)["val"]
        data[n] = cont
    };
        
    xhr.onerror = function() { // происходит, только когда запрос совсем не получилось выполнить
        console.log(`Ошибка соединения. Status: ${xhr.status}`);
    };
        
    xhr.onprogress = function(event) { // запускается периодически
        // event.loaded - количество загруженных байт
        // event.lengthComputable = равно true, если сервер присылает заголовок Content-Length
        // event.total - количество байт всего (только если lengthComputable равно true)
        console.log(`Загружено ${event.loaded} из ${event.total}`);
    };

    xhr.send( null )

    if (["temp_4", "air_4", "soil_1", "soil_2", "soil_3", "soil_4", "soil_5", "soil_6"].indexOf(n) != -1)
    {
        updateSensord()
    }

    n = Object.keys(data)[
        (Object.keys(data).indexOf(n) + 1) % (Object.keys(data).length)]

    if (is_working){
        setTimeout(updateData, 500)
    }
}

window.onbeforeunload = function() {
    is_working = false
}


updateDevice('window', update=false)
updateDevice('humidification', update=false)
for (let i = 1; i <= 6; i++)
{
    updateDevice('watering_' + i.toString(), update=false)
}

setTimeout(updateData, 10)