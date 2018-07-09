var MESES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var XMIN = 1753;
var XMAX = 2015;

// Mike Bostock, Let’s Make a Bar Chart, III https://bost.ocks.org/mike/
var margin = { top: 80, right: 50, left: 150, bottom: 100 };
var width = 1100 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

svg.style("box-shadow", "1px 1px 1px 1px");

var RECTWIDTH = (width - margin.left) / (XMAX - XMIN);
var RECTHEIGHT = (height - margin.top) / MESES.length;

var COLORES = ["blue", "lightblue", "yellow", "orange", "red"];

var MAXTEMP = 13;

/* Adaptado de http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html */
var div = d3.select("body").append("div").attr("id", "tooltip").style("opacity", 0);
/* * */

d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(function (data) {
  var dataset = data.monthlyVariance;
  render(dataset);
}).catch(function (error) {
  return console.error(error);
});

function render(data) {
  svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Título y descripción
  svg.append("text").attr("id", "title").text("Monthly Global Land-Surface Temperature").attr("x", width / 2).attr("y", margin.top / 2);

  svg.append("text").attr("id", "description").text("1753-2015: base temperature 8.66ºC").attr("x", width / 2).attr("y", margin.top / 2 + 30);

  // Escalas y ejes
  var xScale = d3.scaleTime(); // años
  var yScale = d3.scaleBand(); // meses
  var parseTime = d3.timeParse("%Y");
  yScale.range([margin.top, height]).domain(MESES);
  xScale.range([margin.left, width]).domain([parseTime(XMIN), parseTime(XMAX)]);

  svg.append("g").attr("id", "x-axis").attr("transform", "translate(" + 0 + "," + height + ")").call(d3.axisBottom(xScale));

  svg.append("g").attr("transform", "translate(" + width / 2 + "," + (height + 40) + ")").append("text").attr("id", "x-label").text("Years");

  svg.append("g").attr("id", "y-axis").attr("transform", "translate(" + margin.left + ",0)").call(d3.axisLeft(yScale));

  svg.append("g").attr("transform", "translate(" + margin.left / 2 + "," + (height / 2 + margin.top) + ")").append("text").attr("transform", "rotate(-90)").attr("id", "y-label").text("Months");

  // Rectángulos
  svg.selectAll("rect").data(data).enter().append("rect").attr("class", "cell").attr("data-month", function (d) {
    return d.month - 1;
  }).attr("data-year", function (d) {
    return d.year;
  }).attr("data-temp", function (d) {
    return varianzaATemperatura(8.66, d.variance);
  }).attr("width", RECTWIDTH).attr("height", RECTHEIGHT).attr("y", function (d) {
    return yScale(MESES[d.month - 1]);
  } /*RECTHEIGHT * (d.month - 1) + margin.top + margin.top*/).attr("x", function (d) {
    return RECTWIDTH * (d.year - 1753) + margin.left + 1;
  }).attr("fill", function (d) {
    return COLORES[escalaColores(varianzaATemperatura(8.66, d.variance))];
  }).on("mouseover", function (d) {
    div.attr("data-year", d.year);
    div.transition().duration(200).style("opacity", .9);
    div.html(MESES[d.month - 1] + "<br/>" + d.year + "<br/>" + varianzaATemperatura(8.66, d.variance) + " ºC").style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
  }).on("mouseout", function (d) {
    div.transition().duration(500).style("opacity", 0);
  });
  /* Arriba, el código de .on("mouseover" ... ) adaptado de http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html */

  leyenda();
}

function leyenda() {
  var legendScale = d3.scaleLinear().domain([0, 13]).range([0, 100]);
  var legend = svg.append("g").attr("id", "legend").attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");

  legend.selectAll("rect").data(COLORES).enter().append("rect").attr("fill", function (d) {
    return d;
  }).attr("stroke", "black").attr("stroke-width", "1px").attr("width", 20).attr("height", 20).attr("x", function (d, i) {
    return i * 20;
  }).attr("y", 0);

  legend.append("g").attr("transform", "translate(" + 0 + "," + 20 + ")").attr("id", "legend-axis").call(d3.axisBottom(legendScale).tickValues([0, 2.6, 5.2, 7.8, 10.4, 13]));

  legend.append("g").attr("transform", "translate(" + 50 + "," + 55 + ")").attr("id", "legend-title").append("text").text("ºC");
}

function escalaColores(temp) {
  // Devuelve el índice de COLORES que corresponde a la temperatura dada
  if (temp < 2.6) {
    return 0;
  } else if (temp >= 2.6 && temp < 2.6 * 2) {
    return 1;
  } else if (temp >= 2.6 * 2 && temp < 2.6 * 3) {
    return 2;
  } else if (temp >= 2.6 * 3 && temp < 2.6 * 4) {
    return 3;
  } else if (temp >= 2.6 * 4) {
    return 4;
  }
}

function varianzaATemperatura(tempBase, varianza) {
  return hastaDosDecimales(tempBase + varianza);
}

function hastaDosDecimales(x) {
  // Input : un float 
  // Output: un float con hasta 2 decimales
  // 1) multiplico por 100 para correr la coma dos lugares hacia la derecha
  // 2) me quedo con la parte entera
  // 3) vuelvo a dividir por 100 para correr la coma dos lugares hacia la izquierda
  var res = x * 100;
  res = Math.floor(res);
  res = res / 100;
  return res;
}