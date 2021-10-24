var lineSvg;
var sliderSvg
var width;
var height;
var innerHeight;
var innerWidth;
var margin = { top: 20, right: 60, bottom: 20, left: 100 },
                  width = 840 - margin.left - margin.right,
                  height = 600 - margin.top - margin.bottom;
var startDate;
var endDate;
var startYear;
var endYear;
var formatDate = d3.timeFormat("%Y %b");
var index = 0
var timeData;
var playButton;

function step() {
  update();
  currentValue = index + parseInt(startYear);
  if (currentValue > parseInt(endYear)-1) {
    moving = false;
    currentValue = 0;
    index = 0
    clearInterval(timer);
    // timer = 0;
    playButton.text("Play");
    console.log("Slider moving: " + moving);
  }
}

function update() {
  // update position and text of label according to slider scale
  index += 1;

  drawSlider();
  drawPlot("Morocco");
}

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  lineSvg = d3.select('#linechart');

  // Load both files before doing anything else
  Promise.all([d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    timeData = values[0];
    startYear = timeData[0]['Year'];
    endYear = timeData[timeData.length-1]['Year'];
    startDate = new Date(startYear + '-01-01T00:00:00');
    endDate = new Date(endYear + '-01-01T00:00:00');
    drawPlot("Morocco");
  })
  setTimeout(() => { drawSlider(); }, 100);

  playButton = d3.select("#play-button");
  console.log(playButton);
  playButton.on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      clearInterval(timer);
      // timer = 0;
      button.text("Play");
    }
    else {
      moving = true;
      timer = setInterval(step, 200);
      button.text("Pause");
    }
    console.log("Slider moving: " + moving);
  })
});

function drawSlider() {
  d3.select('div#slider-time').selectAll('svg').remove();
  var dataTime = []

  timeData.forEach((item, i) => {
    dataTime.push(new Date(item['Year'] + '-01-01T00:00:00'));
  });

  console.log(index);
  var sliderTime = d3.sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(.005)
    .width(1000)
    .tickFormat(d3.timeFormat('%Y'))
    .default(new Date(parseInt(startYear)+index, 10, 3))
    .on('onchange', val => {
      d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
      index = (startYear - d3.timeFormat('%Y')(val))*-1;
      drawPlot("Morocco");
    });

  var gTime = d3.select('div#slider-time')
    .append('svg')
    .attr('width', (endYear-startYear)*21)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

  d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
}

// Draw the line chart in the #linechart lineSvg for
// the country argument (e.g., `Algeria').
function drawPlot(country) {
  lineSvg.selectAll("g").remove()
  lineSvg.selectAll("path").remove()
  lineSvg.selectAll("text").remove()
  lineSvg.selectAll("body").remove()

  var countryData = timeData.map(x => x[country]);

  var i;
  var max = -1;
  for (i = 0; i < countryData.length; i++) {
    if(countryData[i] == "") {
      countryData[i] = "0";
    }

    var value = countryData[i];
    if (parseInt(value) > parseInt(max)) {
      max = value;
    }
  }

  var added = margin.left + width;

  var y = d3.scaleLinear()
    .domain([0, max])
    .range([height, margin.top])
  lineSvg.append('g')
    .attr("transform", "translate(" + added + ", 0)")
    .call(d3.axisLeft(y)
      .tickSize(width))
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
      .attr("stroke-opacity", "0.5")
      .attr("stroke-dasharray", "5,10"));

  var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, width])
  lineSvg.append('g')
    .attr("transform", "translate(" + margin.left + ", " + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeYear.every(5)));

  var ticks = lineSvg.selectAll(".tick text");
    ticks.each(function(_,i) {
      if(i%2 !== 0) d3.select(this).remove();
    });

  lineSvg.select("path")
    .style("opacity", "0.0")

  lineSvg.selectAll("line")
    .style("stroke", "Gray");

  lineSvg.selectAll("path")
    .style("stroke", "Gray");

  lineSvg.selectAll("text")
    .style("opacity", "0.8")
    .style("stroke", "Gray");

  var focus = lineSvg.append('g')
    .append('circle')
      .attr("transform", "translate(" + margin.left + ", 0)")
      .style('fill', 'none')
      .attr('stroke', 'Black')
      .attr('r', 10)
      .attr('cx', x(new Date(index+1960, 0, 1, 0)))
      .attr('cy', y(countryData[index]))
      .style('opacity', 1);

  var focusText = lineSvg.append('g')
    .append('rect')
      .attr("transform", "translate(" + margin.left + ", 0)")
      .style('fill', 'none')
      .attr('stroke', 'Black')
      .attr('width', 105)
      .attr('height', 40)
      .attr('x', x(new Date(index+1960, 0, 1, 0))-115)
      .attr('y', y(countryData[index])-15)
      .style('opacity', 1);

  var text1 = lineSvg.append('text')
    .attr('x', x(new Date(index+1960, 0, 1, 0))-10)
    .attr('y', y(countryData[index]))
    .html("Year: " + (index+1960));

  var text2 = lineSvg.append('text')
    .attr('x', x(new Date(index+1960, 0, 1, 0))-10)
    .attr('y', y(countryData[index]) + 17)
    .html("GDP: " + countryData[index]);

  var focusText = d3.select('div#sideText')
      .attr('x', x(new Date(index+1960, 0, 1, 0))+15)
      .attr('y', y(countryData[index]))
      .html("Year: " + (index+1960) + "<br>" + "GDP: " + countryData[index])
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style('position','absolute');

  var line = d3.line()
    .x(function(d, i) { return x(new Date(i+1960, 0, 1, 0)); })
    .y(function(d, i) { return(y(countryData[i]))});

  lineSvg.append('path')
    .attr("transform", "translate(" + margin.left + ", 0)")
    .datum(countryData)
    .attr("fill", "none")
    .attr("stroke", "Black")
    .attr("stroke-width", 2)
    .attr("d", line);

  // lineSvg.append('rect')
  // .attr("transform", "translate(" + margin.left + ", 0)")
  // .style("fill", "none")
  // .style("pointer-events", "all")
  // .attr('width', width)
  // .attr('height', height)
  // .on('mouseover', mouseover)
  // .on('mousemove', mousemove)
  // .on('mouseout', mouseout);
  //
  // function mouseover() {
  //   focus.style('opacity', 1)
  //   focusText.style('opacity', 1);
  // }
  //
  // function mousemove() {
  //   var x0 = x.invert(d3.mouse(this)[0]+10).getYear()+1900;
  //   var i = x0-1960
  //   focus
  //     .attr('cx', x(new Date(i+1960, 0, 1, 0)))
  //     .attr('cy', y(countryData[i]));
  //   focusText
  //     .html("Year: " + (i+1960) + "<br>" + "GDP: " + countryData[i])
  //     .style("left", (d3.event.pageX + 10) + "px")
  //     .style("top", (d3.event.pageY - 15) + "px");
  //     // .attr('x', x(new Date(i+1960, 0, 1, 0))+15)
  //     // .attr('y', y(countryData[i]));
  // }
  //
  // function mouseout() {
  //   focus.style('opacity', 0)
  //   focusText.style('opacity', 0);
  // }

  lineSvg.append("text")
    .attr("x", width/2 + margin.left)
    .attr("y", height + 40)
    .text("Year")
    .style("fill", "Gray")
    .attr("font-size", 15);

  lineSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -425)
    .attr("y", margin.left-50)
    .text("GDP for " + country + " (based on current USD)")
    .style("fill", "Gray")
    .attr("font-size", 15);

}
