import React, { Component } from "react";
import FlowMap, {
  DiffColorsLegend,
  LegendBox,
} from "@flowmap.gl/react";
import {
  FieldTimeOutlined,
  ShrinkOutlined,
  RightSquareOutlined,
  LeftSquareOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { Slider, Radio, DatePicker, TimePicker, InputNumber } from "antd";
import axios from "axios";
import moment from "moment";
import "antd/dist/antd.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";

export default class Compare extends Component {
  state = {
    allStation: [],
    stations: [],
    flows: [],
    flowSize: 22,
    preStartDate: "2019-01-01",
    preEndDate: "2019-01-31",
    subStartDate: "2020-01-01",
    subEndDate: "2020-01-31",
    startTime: "00:00",
    endTime: "23:59",
    flowLBP: 0.3,
    flowUBP: 0,
    flowLBN: 150,
    flowUBN: 0,
    flowOrder: -1,
    flowBound: 1,
    err: "",
    colors: {
      darkMode: true,
      locationAreas: {
        normal: "#334"
      },
      outlineColor: "#000"
    }
  };

  fetchAllStation() {
    axios.get("http://localhost:3000/search/all_station").then(
      (response) => {
        const allStation = response.data.data
        this.setState({ allStation: allStation });
      },
      (error) => {
        this.setState({ err: error.message });
      }
    );
  }

  fetchCompareFlows(preStartDate, preEndDate, subStartDate, subEndDate, startTime, endTime) {
    const { search } = this.props.location;
    const selectStr = search.slice(1);
    const request = (selectStr === null || selectStr.length === 0) 
      ? `http://localhost:3000/search/compare_flow?pre_start=${preStartDate}&pre_end=${preEndDate}&sub_start=${subStartDate}&sub_end=${subEndDate}&start_time=${startTime}&end_time=${endTime}`
      : `http://localhost:3000/search/compare_flow?pre_start=${preStartDate}&pre_end=${preEndDate}&sub_start=${subStartDate}&sub_end=${subEndDate}&start_time=${startTime}&end_time=${endTime}&${selectStr}`;
    axios.get(request).then(
      (response) => {
        let flows = response.data.data.sort((flow1, flow2) => Math.abs(flow1.count) - Math.abs(flow2.count));
        const { allStation } = this.state;

        let stationsId = [];
        let stations = [];
    
        flows.forEach((flow) => {
          stationsId.push(flow.origin);
          stationsId.push(flow.dest);
        });
    
        stationsId = [...new Set(stationsId)];
        stations = allStation.filter((station) => stationsId.includes(station.id));

        this.setState({ 
          flows: flows,
          flowSize: flows.length,
          stations: stations,
          preStartDate: preStartDate, 
          preEndDate: preEndDate, 
          subStartDate: subStartDate,
          subEndDate: subEndDate,
          startTime: startTime,
          endTime: endTime
        });
      },
      (error) => {
        this.setState({ err: error.message });
      }
    );
  }

  refreshBoundValue = (value) => {
    const { flowBound } = this.state;
    if (flowBound > 0) {
      this.setState({ flowUBP: value[0], flowLBP: value[1] });
    } else {
      this.setState({ flowUBN: value[0], flowLBN: value[1] });
    }
  };

  refreshFlowLeftBound = (value) => {
    const { flowBound, flowLBP, flowLBN } = this.state;
    if (flowBound > 0 && 0 <= value && value <= flowLBP) {
      this.setState({ flowUBP: value });
    } else if (0 <= value && value <= flowLBN) {
      this.setState({ flowUBN: value });
    }
  }

  refreshFlowRightBound = (value) => {
    const { flowBound, flowUBP, flowUBN, flowSize } = this.state;
    if (flowBound > 0 && flowUBP <= value && value <= flowSize) {
      this.setState({ flowLBP: value });
    } else if (flowUBN <= value && value <= flowSize) {
      this.setState({ flowLBN: value });
    }
  }

  componentDidMount() {
    this.fetchAllStation();
    const { preStartDate, preEndDate, subStartDate, subEndDate, startTime, endTime } = this.state;
    this.fetchCompareFlows(preStartDate, preEndDate, subStartDate, subEndDate, startTime, endTime);
  }

  render() {
    // Debug
    // console.log(this.state);
    const {
      flowSize,
      allStation,
      colors,
      flows,
      flowLBP,
      flowUBP,
      flowLBN,
      flowUBN,
      flowOrder,
      flowBound
    } = this.state;

    let fitSizeFlow;
    if (flowBound > 0) {
      const left_idx = Math.round((flowUBP / 100) * flowSize);
      const right_idx = Math.round((flowLBP / 100) * flowSize);
      if (flowOrder > 0) fitSizeFlow = flows.slice(left_idx, right_idx);
      else
        fitSizeFlow =
          left_idx === 0
            ? flows.slice(-right_idx)
            : flows.slice(-right_idx, -left_idx);
    } else {
      if (flowOrder > 0) fitSizeFlow = flows.slice(flowUBN, flowLBN);
      else
        fitSizeFlow =
          flowUBN === 0
            ? flows.slice(-flowLBN)
            : flows.slice(-flowLBN, -flowUBN);
    }

    let relevantId = [];
    fitSizeFlow.forEach((flow) => {
      relevantId.push(flow.origin);
      relevantId.push(flow.dest);
    });
    relevantId = [...new Set(relevantId)];
    let relevantStation = allStation.filter((station) =>
      relevantId.includes(station.id)
    );
    return (
      <div>
        <FlowMap
          flows={fitSizeFlow}
          locations={relevantStation}
          colors={colors}
          showTotals={true}
          showLocationAreas={false}
          pickable={true}
          diffMode={true}
          opacity={0.5}
          maxLocationCircleSize={5}
          maxFlowThickness={2}
          mixBlendMode={"screen"}
          initialViewState={{
            latitude: 40.74,
            longitude: -73.92,
            zoom: 11
          }}
          mapStyle={"mapbox://styles/mapbox/dark-v10"}
          mapboxAccessToken={
            "pk.eyJ1IjoibGtlZWV5IiwiYSI6ImNrdnRtdXo3MjI0cmEydnFoaTFidXpqYmIifQ.GrcM2kjDF4x4wMuPrKT4eA"
          }
          getLocationId={(loc) => loc.id}
          getFlowMagnitude={(flow) => flow.count || 0}
          getFlowOriginId={(flow) => flow.origin}
          getFlowDestId={(flow) => flow.dest}
          getLocationCentroid={(loc) => [loc.longitude, loc.latitude]}
        ></FlowMap>

        <LegendBox
          bottom={35}
          left={10}
          style={{
            backgroundColor: "rgb(41, 36, 33)",
            color: "white",
            borderWidth: 0,
            fontSize: 14
          }}
        >
          <DiffColorsLegend positiveText="increase flow" negativeText="decrease flow" />

        </LegendBox>

        <LegendBox
          top={5}
          right={5}
          style={{ fontSize: 15 }}
        >
          <div style={{ padding: "3px" }}>
            <legend>
              <FieldTimeOutlined className="icon" /> Time Periods
            </legend>
            <div className="temporal">
              <label>
                <LeftSquareOutlined className="icon" />
                Previous Period
              </label>
              <br />
              <DatePicker.RangePicker
                className="date"
                allowClear={false}
                defaultValue={[
                  moment("2019-01-01", "YYYY-MM-DD"),
                  moment("2019-01-31", "YYYY-MM-DD")
                ]}
                onChange={(_, dateStrings) => {
                  const preStartDate = dateStrings[0];
                  const preEndDate = dateStrings[1];
                  const { subStartDate, subEndDate ,startTime, endTime } = this.state;
                  this.fetchCompareFlows(
                    preStartDate,
                    preEndDate,
                    subStartDate,
                    subEndDate,
                    startTime,
                    endTime
                  );
                }}
                disabledDate={(date) => {
                  const {subStartDate} = this.state;
                  return (
                    (date &&
                      date <
                        moment("2019-01-01", "YYYY-MM-DD").startOf("day")) ||
                    (date &&
                      date >= moment(subStartDate, "YYYY-MM-DD").startOf("day"))
                  );
                }}
              />
            </div>

            <div className="temporal">
              <label className="temporal">
                <RightSquareOutlined className="icon" />
                Subsequent Period
              </label>
              <br />
              <DatePicker.RangePicker
                className="date"
                allowClear={false}
                defaultValue={[
                  moment("2020-01-01", "YYYY-MM-DD"),
                  moment("2020-01-31", "YYYY-MM-DD")
                ]}
                onChange={(_, dateStrings) => {
                  const subStartDate = dateStrings[0];
                  const subEndDate = dateStrings[1];
                  const { preStartDate, preEndDate, startTime, endTime } = this.state;
                  this.fetchCompareFlows(
                    preStartDate,
                    preEndDate,
                    subStartDate,
                    subEndDate,
                    startTime,
                    endTime
                  );
                }}
                disabledDate={(date) => {
                  const {preEndDate} =this.state;
                  return (
                    (date &&
                      date <=
                        moment(preEndDate, "YYYY-MM-DD").startOf("day")) ||
                    (date &&
                      date > moment("2021-08-31", "YYYY-MM-DD").endOf("day"))
                  );
                }}
              />
            </div>
            
            <div className="temporal">
              <label className="temporal">
                <ClockCircleOutlined className="icon" />
                Time Range
              </label>
              <br />
              <TimePicker.RangePicker
                className="time"
                allowClear={false}
                format={"HH:mm"}
                defaultValue={[
                  moment("00:00", "HH:mm"),
                  moment("23:59", "HH:mm")
                ]}
                onChange={(_, timeStrings) => {
                  const startTime = timeStrings[0];
                  const endTime = timeStrings[1];
                  const { preStartDate, preEndDate } = this.state;
                  this.fetchCompareFlows(
                    preStartDate,
                    preEndDate,
                    startTime,
                    endTime
                  );
                }}
              />
            </div>
          </div>
          <br />

          <div style={{ padding: "3px" }}>
            <legend>
              <ShrinkOutlined className="icon" />
              Flow Constraint
            </legend>
            <table>
              <tbody>
                <tr>
                  <td>
                    <label>Rank Order</label>
                  </td>
                  <td>
                    <Radio.Group
                      value={flowOrder}
                      onChange={(evt) => {
                        this.setState({ flowOrder: evt.target.value });
                      }}
                    >
                      <Radio.Button className="ratio" value={1}>
                        Ascend
                      </Radio.Button>
                      <Radio.Button className="ratio" value={-1}>
                        Descend
                      </Radio.Button>
                    </Radio.Group>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Bound Method</label>
                  </td>
                  <td>
                    <Radio.Group
                      value={flowBound}
                      onChange={(evt) => {
                        this.setState({ flowBound: evt.target.value });
                      }}
                    >
                      <Radio.Button className="ratio" value={1}>
                        Percent
                      </Radio.Button>
                      <Radio.Button className="ratio" value={-1}>
                        Number
                      </Radio.Button>
                    </Radio.Group>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Display Range</label>
                  </td>
                  <td>
                    <Slider
                      className="slider"
                      range
                      step={flowBound > 0 ? 0.01 : 1}
                      min={0}
                      max={flowBound > 0 ? 100 : flowSize}
                      value={
                        flowBound > 0 ? [flowUBP, flowLBP] : [flowUBN, flowLBN]
                      }
                      onChange={this.refreshBoundValue}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Bound Value</label>
                  </td>
                  <td>
                    <InputNumber
                      className="num"
                      step={flowBound > 0 ? 0.01 : 1}
                      min={0}
                      max={flowBound > 0 ? 100 : flowSize}
                      value={flowBound > 0 ? flowUBP : flowUBN}
                      style={{ width: '75px' }}
                      onChange={this.refreshFlowLeftBound}
                    />
                    <InputNumber
                      className="num"
                      step={flowBound > 0 ? 0.01 : 1}
                      min={0}
                      max={flowBound > 0 ? 100 : flowSize}
                      value={flowBound > 0 ? flowLBP : flowLBN}
                      style={{ width: '75px' }}
                      onChange={this.refreshFlowRightBound}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </LegendBox>
      </div>
    );
  }
}
