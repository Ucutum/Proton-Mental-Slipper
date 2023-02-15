var select = document.getElementsByClassName("temp_sensor")

const temp_url = "http://127.0.0.1:5000/api/temp/"


var is_working = true

async function updateSensors () {
    for (let i = 0; i < select.length; i++) {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", data_url + (i + 1).toString(), false)

        xhr.onload = function() {
            console.log(`Загружено: ${xhr.status} ${xhr.response}`);
            var cont = JSON.parse(xhr.response)
            var el = select[i]
            el.innerHTML = cont["temp"].toString()
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
    }

    if (is_working){
        setTimeout(updateSensors, 300)
    }
}

window.onbeforeunload = function() {
    is_working = false
}


setTimeout(updateSensors, 10)