import React, { Component } from "react";
import * as d3scale from 'd3-scale-chromatic';
import * as d3 from "d3";
import "./index.css"

export default class Cir extends Component {
  state = {
    colors : d3scale.schemeBlues[7],
    thresholds : [10, 20, 30, 40, 50, 60]
  }

  componentDidMount() {
    this.drawChart();
  }

  // componentDidUpdate(){
  //   this.drawChart();
  // }

  fetchColor = (index) => {
    return (_, i) => {
      const {colors, thresholds} = this.state;
      const {flow_data} = this.props;
      var  min=9999999;
      var  max =-1;
      for (var row=0;row<7;row++){
        for(var j=0;j<24;j++){
            if (flow_data[row][j]<min){
              min=flow_data[row][j];
            }
            if (flow_data[row][j]>max){
              max=flow_data[row][j];
            }
        }
      }
      console.log("in it");
      console.log(min);
      console.log(max);
     
     for (var k =0;k<7;k++){
thresholds[k]=(max-min)*(k+1)/6
     }
     console.log(thresholds)
      var throughput = flow_data[i][index];
      var color;
      console.log("this is ooo");
      console.log(thresholds)
      if (throughput < thresholds[0]) 
        color = colors[0];
      else if (throughput < thresholds[1]) 
        color = colors[1];
      else if (throughput < thresholds[2]) 
        color = colors[2];
      else if (throughput < thresholds[3]) 
        color = colors[3];
      else if (throughput < thresholds[4]) 
        color = colors[4];
      else if (throughput < thresholds[5]) 
        color = colors[5];
      else 
        color = colors[6];

      return color;
    };
  };

  drawChart() {
    var data = [1, 1, 1, 1, 1, 1, 1];
    console.log("oy");
    var svg = d3.select(".circle"),
      width = svg.attr("width"),
      height = svg.attr("height"),
      radius = Math.min(width, height) / 3,
      g = svg
        .append("g")
        .attr("transform", "translate (" + 150 + "," +150 + ")");

    var pie = d3.pie();
    var arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius / 25);
  var arc2 = d3
    .arc()
    .innerRadius(radius / 25)
    .outerRadius((radius * 2) / 25);
  var arc3 = d3
    .arc()
    .innerRadius((radius * 2) / 25)
    .outerRadius((radius * 3) /25);
  var arc4 = d3
    .arc()
    .innerRadius((radius * 3) / 25)
    .outerRadius((radius * 4) / 25);
  var arc5 = d3
    .arc()
    .innerRadius((radius * 4) / 25)
    .outerRadius((radius * 5) / 25);
  var arc6 = d3
    .arc()
    .innerRadius((radius * 5) / 25)
    .outerRadius((radius*6)/25);
  var arc7 = d3
    .arc()
    .innerRadius((radius * 6) / 25)
    .outerRadius((radius*7)/25);
    var arc8 = d3
    .arc()
    .innerRadius((radius * 7) / 25)
    .outerRadius((radius*8)/25);
    var arc8_cut=d3
    .arc()
    .innerRadius((radius *7.8) / 25)
    .outerRadius((radius*8)/25);
    var arcs8_cut = g
    .selectAll("arc8_cut")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc8_cut");
    arcs8_cut.append("path").attr("fill", "red").attr("d", arc8_cut);

    var arc9 = d3
    .arc()
    .innerRadius((radius * 8) / 25)
    .outerRadius((radius*9)/25);
    var arc10 = d3
    .arc()
    .innerRadius((radius * 9) / 25)
    .outerRadius((radius*10)/25);
    var arc11 = d3
    .arc()
    .innerRadius((radius * 10) / 25)
    .outerRadius((radius*11)/25);
  var arc12 = d3
    .arc()
    .innerRadius((radius * 11) / 25)
    .outerRadius((radius*12)/25);
    var arc13 = d3
    .arc()
    .innerRadius((radius * 12) / 25)
    .outerRadius((radius*13)/25);
    var arc14 = d3
    .arc()
    .innerRadius((radius * 13) / 25)
    .outerRadius((radius*14)/25);
    var arc15 = d3
    .arc()
    .innerRadius((radius * 14) / 25)
    .outerRadius((radius*15)/25);
    var arc16 = d3
    .arc()
    .innerRadius((radius * 15) / 25)
    .outerRadius((radius*16)/25);
    var arc17 = d3
    .arc()
    .innerRadius((radius * 16) / 25)
    .outerRadius((radius*17)/25);
    var arc18 = d3
    .arc()
    .innerRadius((radius * 17) / 25)
    .outerRadius((radius*18)/25);
    var arc19 = d3
    .arc()
    .innerRadius((radius * 18) / 25)
    .outerRadius((radius*19)/25);
    var arc20 = d3
    .arc()
    .innerRadius((radius * 19) / 25)
    .outerRadius((radius*20)/25);
    var arc21 = d3
    .arc()
    .innerRadius((radius * 20) / 25)
    .outerRadius((radius*21)/25);
    var arc22 = d3
    .arc()
    .innerRadius((radius * 21) / 25)
    .outerRadius((radius*22)/25);
    var arc23 = d3
    .arc()
    .innerRadius((radius * 22) / 25)
    .outerRadius((radius*23)/25);
    var arc24 = d3
    .arc()
    .innerRadius((radius * 23) / 25)
    .outerRadius((radius*24)/25);
    var arc25 = d3
    .arc()
    .innerRadius((radius * 27) / 25)
    .outerRadius((radius*28)/25);
  var arcs = g
    .selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");
  arcs.append("path").attr("fill", this.fetchColor(0)).attr("d", arc);

  var arcs2 = g
    .selectAll("arc2")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc2");
  arcs2.append("path").attr("fill", this.fetchColor(1)).attr("d", arc2);

  var arcs3 = g
    .selectAll("arc3")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc3");
  arcs3.append("path").attr("fill", this.fetchColor(2)).attr("d", arc3);
  
  var arcs4 = g
    .selectAll("arc4")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc4");
  arcs4.append("path").attr("fill", this.fetchColor(3)).attr("d", arc4);

  var arcs5 = g
    .selectAll("arc5")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc5");
  arcs5.append("path").attr("fill", this.fetchColor(4)).attr("d", arc5);


  var arcs6 = g
    .selectAll("arc6")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc6");
  arcs6.append("path").attr("fill", this.fetchColor(5)).attr("d", arc6);

  var arcs7 = g
    .selectAll("arc7")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc7");
  arcs7.append("path").attr("fill", this.fetchColor(6)).attr("d", arc7);

  var arcs8 = g
    .selectAll("arc8")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc8");
  arcs8.append("path").attr("fill", this.fetchColor(7)).attr("d", arc8).attr("stroke","red");


  var arcs9 = g
    .selectAll("arc9")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc9");
  arcs9.append("path").attr("fill", this.fetchColor(8)).attr("d", arc9);
  
  var arcs10 = g
    .selectAll("arc10")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc10");
  arcs10.append("path").attr("fill", this.fetchColor(9)).attr("d", arc10);

  var arcs11 = g
    .selectAll("arc11")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc11");
  arcs11.append("path").attr("fill", this.fetchColor(10)).attr("d", arc11);


  var arcs12 = g
    .selectAll("arc12")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc12");
  arcs12.append("path").attr("fill", this.fetchColor(11)).attr("d", arc12);
  var arcs13 = g
    .selectAll("arc13")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc13");
  arcs13.append("path").attr("fill", this.fetchColor(12)).attr("d", arc13);

  var arcs14 = g
    .selectAll("arc14")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc14");
  arcs14.append("path").attr("fill", this.fetchColor(13)).attr("d", arc14);

  var arcs15 = g
    .selectAll("arc15")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc15");
  arcs15.append("path").attr("fill", this.fetchColor(14)).attr("d", arc15);
  
  var arcs16 = g
    .selectAll("arc16")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc16");
  arcs16.append("path").attr("fill", this.fetchColor(15)).attr("d", arc16).attr("stroke","black");

  var arcs17 = g
    .selectAll("arc17")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc17");
  arcs17.append("path").attr("fill", this.fetchColor(16)).attr("d", arc17);


  var arcs18 = g
    .selectAll("arc18")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc18");
  arcs18.append("path").attr("fill", this.fetchColor(17)).attr("d", arc18);
  var arcs19 = g
    .selectAll("arc19")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc19");
  arcs19.append("path").attr("fill", this.fetchColor(18)).attr("d", arc19);

  var arcs20 = g
    .selectAll("arc20")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc20");
  arcs20.append("path").attr("fill", this.fetchColor(19)).attr("d", arc20);

  var arcs21 = g
    .selectAll("arc21")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc21");
  arcs21.append("path").attr("fill", this.fetchColor(20)).attr("d", arc21);
  
  var arcs22 = g
    .selectAll("arc22")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc22");
  arcs22.append("path").attr("fill", this.fetchColor(21)).attr("d", arc22);

  var arcs23 = g
    .selectAll("arc23")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc23");
  arcs23.append("path").attr("fill", this.fetchColor(22)).attr("d", arc23);


  var arcs24 = g
    .selectAll("arc24")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc24");
  arcs24.append("path").attr("fill", this.fetchColor(23)).attr("d", arc24);
  
  var arcs25 = g
  .selectAll("arc25")
  .data(pie(data))
  .enter()
  .append("g")
  .attr("class", "arc25");
  var date_week = ["Mon", "Tue", "Wen", "Thu", "Fri", "Sat", "Sun"];
  var date_count=-1;
  arcs25.append("text").attr("transform", function (d) {
    console.log(d);
    return "translate("+arc25.centroid(d)+")";
}).attr("text-anchor","start").text(function (d) {
date_count+=1;
    return date_week[date_count];
}).style("fill","white");


 
  }

  render() {
    console.log("@")
    return (
    <div>
      <svg 
      className="circle"
      height="370" 
      width="370"
      >
      </svg>
    </div>);
  }
}
