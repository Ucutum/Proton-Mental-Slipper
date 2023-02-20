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
    if (devise.classList.contains("disable"))
    {
        return
    }

    var devise_title = document.getElementsByName(device_name + "_state")[0]
    var on_state = device_data[device_name][1]
    var ton_state = device_data[device_name][2]
    var off_state = device_data[device_name][0]
    var toff_state = device_data[device_name][3]

    var xhr = new XMLHttpRequest()
    xhr.open("POST", "/greenhouse", false)

    xhr.onload = function() {
        console.log(`Загружено: ${xhr.status} ${xhr.response}`);
        var cont = JSON.parse(xhr.response)
        var state = cont["state"]
        if (state)
        {
            devise.innerHTML = on_state
            if (devise.classList.contains("success"))
            {
                devise.classList.remove("success")
                devise.classList.add("danger")
            }
            if (devise.classList.contains("success-border"))
            {
                devise.classList.remove("success-border")
                devise.classList.add("danger-border")
            }
            devise_title.innerHTML = ton_state
        }
        else
        {
            devise.innerHTML = off_state
            if (devise.classList.contains("danger"))
            {
                devise.classList.remove("danger")
                devise.classList.add("success")
            }
            if (devise.classList.contains("danger-border"))
            {
                devise.classList.remove("danger-border")
                devise.classList.add("success-border")
            }
            devise_title.innerHTML = toff_state
            if (update)
            {
                updateVision()
            }
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
    "threshold_temp": 0,
    "temp_4": 0,
    "air_1": 0,
    "air_2": 0,
    "air_3": 0,
    "threshold_air": 0,
    "air_4": 0,
    "threshold_soil": 0,
    "soil_1": 0,
    "soil_2": 0,
    "soil_3": 0,
    "soil_4": 0,
    "soil_5": 0,
    "soil_6": 0
}


emergency_management = false


function updateEmergencyManagement()
{
    btn = document.getElementsByName("emergency")[0]
    title = document.getElementsByName("emergency_title")[0]
    emergency_management = !emergency_management
    if (emergency_management)
    {
        btn.classList.remove("warning-border")
        btn.classList.add("warning")
        title.innerHTML = "Экстренное управление включено"

        updateVision()
    }
    else
    {
        btn.classList.remove("warning")
        btn.classList.add("warning-border")
        title.innerHTML = "Экстренное управление выключено"
    }
}


function updateElementVision(el, value, threshold)
{
    if (value <= threshold && !emergency_management)
    {
        if (el.classList.contains("success"))
        {
            el.classList.add("disable")
        }
        else if (el.classList.contains("success-border"))
        {
            el.classList.add("disable")
        }
    }
    else
    {
        if (el.classList.contains("danger"))
        {
            el.classList.remove("disable")
        }
        else if (el.classList.contains("success"))
        {
            el.classList.remove("disable")
        }
        else if (el.classList.contains("danger-border"))
        {
            el.classList.remove("disable")
        }
        else if (el.classList.contains("success-border"))
        {
            el.classList.remove("disable")
        }
    }
}


function updateVision()
{
    med_temp = Math.round((
        data["temp_1"] + data["temp_2"] + data["temp_3"] + data["temp_4"]
    ) / 4 * 100) / 100
    el = document.getElementsByName("window")[0]
    updateElementVision(el, med_temp, data["threshold_temp"])
    med_air = Math.round((
        data["air_1"] + data["air_2"] + data["air_3"] + data["air_4"]
    ) / 4 * 100) / 100
    el = document.getElementsByName("humidification")[0]
    updateElementVision(el, med_air, data["threshold_air"])
    for (let i = 1; i <= 6; i++)
    {
        v = data["soil_" + i.toString()]
        el = document.getElementsByName("watering_" + i.toString())[0]
        updateElementVision(el, v, data["threshold_soil"])
    }
}


function updateSensord()
{
    med_temp = Math.round((
        data["temp_1"] + data["temp_2"] + data["temp_3"] + data["temp_4"]
    ) / 4 * 100) / 100
    document.getElementsByName("window_par")[0].innerHTML = med_temp
    el = document.getElementsByName("window")[0]
    med_air = Math.round((
        data["air_1"] + data["air_2"] + data["air_3"] + data["air_4"]
    ) / 4 * 100) / 100
    document.getElementsByName("humidification_par")[0].innerHTML = med_air
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
    updateVision()
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
updateVision()

setTimeout(updateData, 10)