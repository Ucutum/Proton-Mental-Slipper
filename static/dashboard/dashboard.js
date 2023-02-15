/* globals Chart:false, feather:false */

var select = document.getElementById("load_data_select")
var chard_container = document.getElementById("chart-container")

const data_url = "http://127.0.0.1:5000/api/get_data/"

var is_working = true

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function loadData (con=true) {
  var select_value = select.value
  console.log(select_value)

  var xhr = new XMLHttpRequest()
  xhr.open("GET", data_url + select_value.toString(), false)

  xhr.onload = function() {
      console.log(`Загружено: ${xhr.status}`);
      var cont = JSON.parse(xhr.response)
      console.log(cont)
      drawGraph(cont)
      drawTable(cont)
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

    if (is_working && con){
        setTimeout(loadData, 10 * 1000)
    }
}

window.onbeforeunload = function() {
    is_working = false
}

var last_chart = false

function drawGraph (graph_data) {
  chard_container.setAttribute("style", "position: relative;" + "width:" + (graph_data["times"].length * 30).toString() + "px" + "; height: 300px");

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
    bw = 4
    if (graph_data["headers"][i].slice(-3) == "med")
    {
      bw = 8
    }
    datasets.push({
      label: graph_data["headers"][i],
      data: graph_data["data"][i],
      lineTension: 0.6,
      borderColor: rgbToHex(r, g, b),
      borderWidth: bw,
      pointBackgroundColor: rgbToHex(r, g, b)
    })

    b += 10
    b %= 256
    g += 40
    g %= 256
    r += 2
    r %= 256
  }

  if (last_chart)
  {
    last_chart.data = {
      labels: graph_data["times"],
      datasets: datasets
    }
    last_chart.options.animation = false
    last_chart.update()
    return
  }

  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: graph_data["times"],
      datasets: datasets
    },
    options: {
      // responsive: false,
      // maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: true,
        position: "left"
      },
      animation: {duration: 1000},
      // hover: {mode: null},
      // responsiveAnimationDuration: 0,
      tooltips: {enabled: false}
    }
  })

  last_chart = myChart

}


function drawTable(data)
{
  datahead = ""
  datahead += `<th scope='col'>time</th>`
  for (var i = 0; i < data["headers"].length; i++)
  {
    datahead += `<th scope='col'>${ data["headers"][i] }</th>`
  }
  datadata = ""
  for (var i = 0; i < data["times"].length; i++)
  {
    s = "<tr>"
    s += `<th>${data["times"][i]}</th>`
    for (var j = 0; j < data["headers"].length; j++)
    {
      s += `<th>${data["data"][j][i]}</th>`
    }
    s += "</tr>"
    datadata += s
  }
  s = `<thead>
    <tr>
    ${datahead}
    </tr>
    </thead>
    ${datadata}
    `
  document.getElementById("datatable").innerHTML = s
}


setTimeout(loadData, 3000)