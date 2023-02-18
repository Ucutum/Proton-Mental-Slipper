/* globals Chart:false, feather:false */

var datatype = "temp"

function defineDatatype()
{
  if (document.getElementById("datatype_temp")) {
    datatype = "temp"
  }
  else if (document.getElementById("datatype_air")) {
    datatype = "air"
  }
  else if (document.getElementById("datatype_soil")) {
    datatype = "soil"
  }

  console.log(datatype)
}

defineDatatype()

var select = document.getElementById("load_data_select")
var chard_container = document.getElementById("chart-container")

const data_url = "http://127.0.0.1:5000/api/get_data/" + datatype + "/"

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
      drawTable(cont)
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

    if (is_working && con){
        setTimeout(loadData, 1 * 1000)
    }
}

window.onbeforeunload = function() {
    is_working = false
}

var last_chart = false

const replace_dict = {
  "temp_1": "Датчик 1",
  "temp_2": "Датчик 2",
  "temp_3": "Датчик 3",
  "temp_4": "Датчик 4",
  "temp_med": "Средняя температура",
  "air_1": "Датчик 1",
  "air_2": "Датчик 2",
  "air_3": "Датчик 3",
  "air_4": "Датчик 4",
  "air_med": "Средняя влажность   ",
  "soil_1": "Бороздка 1",
  "soil_2": "Бороздка 2",
  "soil_3": "Бороздка 3",
  "soil_4": "Бороздка 4",
  "soil_5": "Бороздка 5",
  "soil_6": "Бороздка 6"
}

function getReplacedElement(e)
{
  if (Object.keys(replace_dict).includes(e))
  {
    return replace_dict[e]
  }
  return e
}

function drawGraph (graph_data) {
  chard_width = 300 + Math.max(graph_data["times"].length, 50) * 25
  chard_container.setAttribute("style", "position: relative;" + "width:" + (chard_width).toString() + "px" + "; height: 300px");

  feather.replace({ 'aria-hidden': 'true' })

  // Графики
  var ctx = document.getElementById('myChart')
  // eslint-disable-next-line no-unused-vars

  var datasets = []

  if (datatype == "temp")
  {
    var r = 57
    var g = 100
    var b = 198

    var rm = 2
    var gm = 40
    var bm = 10
  }
  else if (datatype == "air")
  {
    var r = 255
    var g = 214
    var b = 72

    var rm = -2
    var gm = -40
    var bm = 10
  }
  else if (datatype == "soil")
  {
    var r = 105
    var g = 255
    var b = 72

    var rm = 2
    var gm = -40
    var bm = 10
  }

  for (var i = graph_data["data"].length - 1; i > -1; i--)
  {

    bw = 2
    if (graph_data["headers"][i].slice(-3) == "med")
    {
      bw = 8
    }
    datasets.push({
      label: getReplacedElement(graph_data["headers"][i]),
      data: graph_data["data"][i],
      lineTension: 0.6,
      borderColor: rgbToHex(r, g, b),
      borderWidth: bw,
      pointBackgroundColor: rgbToHex(r, g, b),
    })

    b += bm
    b %= 256
    g += gm
    g %= 256
    r += rm
    r %= 256
  }

  while (graph_data["times"].length < 50)
  {
    graph_data["times"].push(" ")
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
      maintainAspectRatio: false,
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
  datahead += `<th scope='col'>Время</th>`
  for (var i = 0; i < data["headers"].length; i++)
  {
    datahead += `<th scope='col'>${ getReplacedElement(data["headers"][i]) }</th>`
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


  // now data
  datahead = ""
  datahead += `<th scope='col'>Время</th>`
  for (var i = 0; i < data["headers"].length; i++)
  {
    datahead += `<th scope='col'>${ getReplacedElement(data["headers"][i]) }</th>`
  }
  datadata = ""
  var i = data["times"].length - 1
  s = "<tr>"
  s += `<th>${data["times"][i]}</th>`
  for (var j = 0; j < data["headers"].length; j++)
  {
    s += `<th>${data["data"][j][i]}</th>`
  }
  s += "</tr>"
  datadata += s

  s = `<thead>
    <tr>
    ${datahead}
    </tr>
    </thead>
    ${datadata}
    `
  document.getElementById("lastdatatable").innerHTML = s
}


setTimeout(loadData, 1000)