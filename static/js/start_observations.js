const data_url = "/start_observations"

function reloadPage()
{
    location.reload()
}

async function startObservations ()
{
    var xhr = new XMLHttpRequest()
    xhr.open("GET", data_url, true)

    xhr.onload = function() {
        console.log(`Загружено: ${xhr.status} ${xhr.response}`);
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

    setTimeout(reloadPage, 1000)
    xhr.send( null )
}