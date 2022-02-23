import React, { Component } from "react";
import ReactEcharts from "echarts-for-react";

export default class LineChart extends Component {

  handleOption() {
    const { selected, inflow, outflow } = this.props;

    return {
      title: { text: `InFlow and OutFlow of Station: ${selected.name}` },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        x: "right",
        y: "top",
        padding: [0, 200, 0, 0],
        data: ["inflow", "outflow"]
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar"] },
          restore: { show: true },
          saveAsImage: {
            show: true,
            type: "jpg"
          }
        }
      },
      xAxis: [
        {
          type: "category",
          data: ["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"]
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "inflow",
          type: "bar",
          data: inflow,
          markPoint: {
            data: [
              { type: "max", name: "maximum" },
              { type: "min", name: "minimum" }
            ]
          },
          markLine: {
            data: [{ type: "average", name: "mean" }]
          }
        },
        {
          name: "outflow",
          type: "bar",
          data: outflow,
          markPoint: {
            data: [
              { type: "max", name: "maximum" },
              { type: "min", name: "minimum" }
            ]
          },
          markLine: {
            data: [{ type: "average", name: "min" }]
          }
        }
      ]
    };
  }

  render() {
    return (
      <div>
        <ReactEcharts
          notMerge
          option={this.handleOption()}
          style={{
            position: "absolute",
            zIndex: 1,
            width: "90%",
            height: "25%",
            left: "5%",
            top: "75%"
          }}
        />
      </div>
    );
  }
}
