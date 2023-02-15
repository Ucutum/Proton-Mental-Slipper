/* globals Chart:false, feather:false */

var select = document.getElementById("load_data_select")

const data_url = "http://127.0.0.1:5000/api/get_data/"

var is_working = true

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function loadData () {
  console.log(select.value)

  var xhr = new XMLHttpRequest()
  xhr.open("GET", data_url + select.value.toString(), false)

  xhr.onload = function() {
      console.log(`Загружено: ${xhr.status} ${xhr.response}`);
      var cont = JSON.parse(xhr.response)
      console.log(cont)
      drawGraph(cont)
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

    if (is_working){
        setTimeout(loadData, 10000)
    }
}

window.onbeforeunload = function() {
    is_working = false
}


var animate = {duration: 1000}

function drawGraph (graph_data) {
  feather.replace({ 'aria-hidden': 'true' })

  // Графики
  var ctx = document.getElementById('myChart')
  // eslint-disable-next-line no-unused-vars

  var datasets = []
  var r = 57
  var g = 100
  var b = 198

  for (var i = 0; i < graph_data["data"].length; i++)
  {
    datasets.push({
      data: graph_data["data"][i],
      lineTension: 0,
      borderColor: rgbToHex(r, g, b),
      borderWidth: 4,
      pointBackgroundColor: rgbToHex(r, g, b)
    })

    b += 10
    b %= 256
    g += 40
    g %= 256
    r += 2
    r %= 256
  }

  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: graph_data["times"],
      datasets: datasets
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false
      },
      animation: animate
    }
  })

  if (animate) {
    animate = false
  }
  else {
  }

}


setTimeout(loadData, 3000)