import FlowMap, { LegendBox } from "@flowmap.gl/react";
import { EditableGeoJsonLayer, DrawPolygonMode } from "nebula.gl";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { DeckGL } from "deck.gl";
import React, { Component } from "react";
import PubSub from "pubsub-js";
import qs from "querystring";
import axios from "axios";
import {
  HistoryOutlined,
  ShrinkOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { Slider, Radio, DatePicker, TimePicker, Select, InputNumber } from "antd";
import moment from "moment";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css"
 import Cir from "../../components/CircularHeatmap"

export default class StarFlowMap extends Component {
  state = {
    allStation: [],
    stations: [],
    stationsId: [],
    stationSize: 0,
    flows: [],
    flowSize: 0,
    startDate: "2019-01-01",
    endDate: "2019-01-31",
    startTime: "00:00",
    endTime: "23:59",
    flowLBP: 1,
    flowUBP: 0,
    flowLBN: 150,
    flowUBN: 0,
    flowOrder: -1,
    flowBound: 1,
    stationLBP: 5,
    stationUBP: 0,
    stationLBN: 10,
    stationUBN: 0,
    stationOrder: -1,    
    stationFilter: 0,
    stationBound: 1,
    err: "",
    colors: {
      darkMode: true,
      flows: {
        scheme: [
          "rgb(0, 22, 61)",
          "rgb(0, 27, 62)",
          "rgb(0, 36, 68)",
          "rgb(0, 48, 77)",
          "rgb(3, 65, 91)",
          "rgb(48, 87, 109)",
          "rgb(85, 115, 133)",
          "rgb(129, 149, 162)",
          "rgb(179, 191, 197)",
          "rgb(240, 240, 240)"
        ]
      },
      locationAreas: {
        normal: "#334"
      },
      outlineColor: "#000"
    },
    selecting: false,
    displayingHeat: false,
    displayingCir: false,
    loading: false,
    s: [],
    selectStr: "",
    cirInfo: [],
    polygon: {
      type: "FeatureCollection",
      features: []
    },
    polygonNum: 0,
    viewState: {
      latitude: 40.74,
      longitude: -73.92,
      zoom: 11,
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

  fetchCertainFlows(startDate, endDate, startTime, endTime) {
    axios.get(`http://localhost:3000/search/certain_flow?start_date=${startDate}&end_date=${endDate}&start_time=${startTime}&end_time=${endTime}`).then(
      (response) => {
        let flows = response.data.data.sort((flow1, flow2) => flow1.count - flow2.count);
        const { allStation } = this.state;

        let counts = {};
        let stationsId = [];
        let stations = [];
    
        flows.forEach((flow) => {
          const {origin, dest, count} = flow
          if(!counts.hasOwnProperty(origin))
            counts[origin] = count;
          else
            counts[origin] += count;
    
          if(!counts.hasOwnProperty(dest))
            counts[dest] = count;
          else
            counts[dest] += count;

          stationsId.push(origin);
          stationsId.push(dest);
        });
    
        stationsId = [...new Set(stationsId)];
        stations = allStation.filter((station) => stationsId.includes(station.id))
        .sort((station1, station2) => counts[station1.id] - counts[station2.id]);

        stationsId = []
        stations.forEach((station) => stationsId.push(station.id));

        this.setState({ 
          flows: flows,
          flowSize: flows.length,
          stations: stations,
          stationsId: stationsId,
          stationSize: stations.length,          
          startDate: startDate, 
          endDate: endDate, 
          startTime: startTime,
          endTime: endTime,
          displayingCir: false,
        });
      },
      (error) => {
        this.setState({ err: error.message });
      }
    );
  }

  fetchWeekFlows() {
    const {startDate, endDate, selectStr} = this.state;
    const request = (selectStr === null || selectStr.length === 0) 
      ? `http://localhost:3000/search/station_flow_info?start_date=${startDate}&end_date=${endDate}`
      : `http://localhost:3000/search/station_flow_info?start_date=${startDate}&end_date=${endDate}&${selectStr}`;

    axios.get(request).then(
      (response) => {
        this.setState({ displayingCir: true, cirInfo: response.data.data, loading:false});
      },
      (error) => {
        this.setState({ err: error.message });
      }
    );
  }

  refreshStationBoundValue = (value) => {
    const { stationsId, stationOrder, stationSize, stationFilter, stationBound } = this.state;
    if (stationBound > 0) {
      const stationUBP = value[0];
      const stationLBP = value[1];

      if (stationFilter === 1) {
        const s = this.refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder);
        this.setState({ stationUBP: stationUBP, stationLBP: stationLBP, s: s, displayingCir:false });
      }else
        this.setState({ stationUBP: stationUBP, stationLBP: stationLBP });

    } else {
      const stationUBN = value[0];
      const stationLBN = value[1];

      if (stationFilter === 1){
        const s = this.refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder);
        this.setState({ stationUBN: stationUBN, stationLBN: stationLBN, s: s, displayingCir:false });
      }else 
        this.setState({ stationUBN: stationUBN, stationLBN: stationLBN });
    }

  };

  refreshStationLeftBound = (value) => {
    const { stationsId, stationOrder, stationSize, stationFilter, stationBound, stationLBP, stationLBN } = this.state;
    if (stationBound > 0 && 0 <= value && value <= stationLBP) {
      if (stationFilter === 1) {
        const s = this.refreshPercentSelect(stationsId, stationSize, stationLBP, value, stationOrder);
        this.setState({ stationUBP: value, s: s, displayingCir:false });
      }else
        this.setState({ stationUBP: value });
    } else if (0 <= value && value <= stationLBN) {
      if (stationFilter === 1){
        const s = this.refreshNumberSelect(stationsId, stationLBN, value, stationOrder);
        this.setState({ stationUBN: value, s: s, displayingCir:false });
      }else 
        this.setState({ stationUBN: value});
    }
  }

  refreshStationRightBound = (value) => {
    const { stationsId, stationOrder, stationSize, stationFilter, stationBound, stationUBP, stationUBN } = this.state;
    if (stationBound > 0 && stationUBP <= value && value <= 100) {
      if (stationFilter === 1) {
        const s = this.refreshPercentSelect(stationsId, stationSize, value, stationUBP, stationOrder);
        this.setState({ stationLBP: value, s: s, displayingCir:false });
      }else
        this.setState({ stationLBP: value });
    } else if (stationUBN <= value && value <= stationSize) {
      if (stationFilter === 1){
        const s = this.refreshNumberSelect(stationsId, value, stationUBN, stationOrder);
        this.setState({ stationLBN: value, s: s, displayingCir:false });
      }else 
        this.setState({ stationLBN: value });
    }
  }

  refreshStationOrder = (evt) =>{
    const stationOrder = evt.target.value;
    const { stationsId, stationSize, stationFilter, stationLBP, stationLBN, stationUBP, stationUBN, stationBound } = this.state;

    if (stationFilter === 1){
      const s = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationOrder: stationOrder, s: s, displayingCir:false });
    }else
      this.setState({ stationOrder: stationOrder })
  }

  refreshStationBound = (evt) =>{
    const stationBound = evt.target.value;
    const { stationsId, stationSize, stationFilter, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder } = this.state;

    if (stationFilter === 1){
      const s = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationBound: stationBound, s: s, displayingCir:false });
    }else
      this.setState({ stationBound: stationBound })
  }

  refreshStationFilter = (value) =>{
    const { stationsId, stationSize, stationFilter, stationOrder, stationLBP, stationLBN, stationUBP, stationUBN, stationBound } = this.state;

    if (stationFilter !== 1 && value === 1){
      const s = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationFilter: value, s: s, displayingCir:false, selecting:false });
    }else if (value === 0){
      this.setState({ stationFilter: value, displayingHeat: false, displayingCir: false});
    }else{
      this.setState({ stationFilter: value, displayingCir:false });
    }
  }

  refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder){
    let s;

    const left_idx = Math.round(stationUBP/100 * stationSize);
    const right_idx = Math.round(stationLBP/100 * stationSize);
    if (stationOrder > 0)
      s = stationsId.slice(left_idx, right_idx);
    else
      s = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);
    
    const selectStr = qs.stringify({ s: s });
    PubSub.publish("selected", selectStr);
    this.setState({selectStr: selectStr});
    return s;
  }

  refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder){
    let s;

    if (stationOrder > 0)
      s = stationsId.slice(stationUBN, stationLBN);
    else 
      s = stationUBN === 0 ? stationsId.slice(-stationLBN) : stationsId.slice(-stationLBN, -stationUBN);

    const selectStr = qs.stringify({ s: s });
    PubSub.publish("selected", selectStr);
    this.setState({selectStr: selectStr});
    return s;
  }

  refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound){
    const s = stationBound > 0 
      ? this.refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder)
      : this.refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder);

    return s;
  }

  refreshFlowBoundValue = (value) => {
    const { flowBound } = this.state;
    if (flowBound > 0) {
      this.setState({ flowUBP: value[0], flowLBP: value[1] });
    } else {
      this.setState({ flowUBN: value[0], flowLBN: value[1] });
    }
  }

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

  isinPolygon(longitude, latitude, coordinates) {
    let intersNum = 0;
    let vertex1, vertex2;
    let vertexNum = coordinates.length - 1;

    for (let i = 0; i < vertexNum; i++) {
      vertex1 = coordinates[i];
      vertex2 = coordinates[i + 1];

      if (
        longitude > Math.min(vertex1[0], vertex2[0]) &&
        longitude <= Math.max(vertex1[0], vertex2[0])
      ) {
        if (latitude <= Math.max(vertex1[1], vertex2[1])) {
          let numerator = vertex1[1] - vertex2[1];
          let denominator = vertex1[0] - vertex2[0];

          if (denominator !== 0) {
            let intersLat =
              (numerator / denominator) * (longitude - vertex1[0]) + vertex1[1];
            if (latitude <= intersLat) intersNum++;
          }
        }
      }
    }
    return intersNum % 2 === 1;
  }

  setPolygon = ({ updatedData }) => {
    const { polygonNum } = this.state;
    if (polygonNum < 1) {
      this.setState({
        polygon: updatedData,
        polygonNum: updatedData.features.length
      });
    } else
      this.setState({
        polygon: {
          type: "FeatureCollection",
          features: []
        },
        polygonNum: 0
      });
  }

  setSelectStation = () => {
    const { selecting, polygon, stations, stationFilter } = this.state;
    if (stationFilter === -1){
      if (selecting) {
        if (polygon.features.length > 0){
          const { coordinates } = polygon.features[0].geometry;

          let s = [];
          stations.forEach((station) => {
            const { id, longitude, latitude } = station;
            if (this.isinPolygon(longitude, latitude, coordinates[0])) 
              s.push(id);
          });

          const selectStr = qs.stringify({ s: s });
          PubSub.publish("selected", selectStr);
          this.setState({ selecting: !selecting, s: s, selectStr: selectStr, displayingCir:false});
        }
      } else this.setState({ selecting: !selecting });
    }

  };

  setReachInfo = () => {
    const {displayingHeat, stationFilter} = this.state;
    if (stationFilter !== 0)
      this.setState({ displayingHeat: !displayingHeat });
  }

  setCirInfo = () => {
    const { displayingCir, stationFilter} = this.state;
    if (stationFilter !== 0){
      if (!displayingCir){
        this.setState({loading : true})
        this.fetchWeekFlows();
      }else
        this.setState({ displayingCir: !displayingCir });
    }
  }

  componentDidMount() {
    this.fetchAllStation();
    const { startDate, endDate, startTime, endTime } = this.state;
    this.fetchCertainFlows(startDate, endDate, startTime, endTime);
  }

  render() {
    const { 
      stations,
      stationSize,
      flowSize, 
      colors, 
      flows, 
      flowLBP, 
      flowUBP,
      flowLBN,
      flowUBN,
      flowOrder,
      flowBound, 
      stationLBP,
      stationUBP,
      stationLBN,
      stationUBN,
      stationOrder,  
      stationFilter,
      stationBound,
      polygon,
      selecting,
      displayingHeat,
      displayingCir,
      loading,
      s,
      cirInfo,
      viewState
    } = this.state;

    // handle flow constraint on flows
    let fitSizeFlow;
    if (flowBound > 0){
      const left_idx = Math.round(flowUBP/100 * flowSize);
      const right_idx = Math.round(flowLBP/100 * flowSize);
      if (flowOrder > 0)
        fitSizeFlow = flows.slice(left_idx, right_idx)
      else
        fitSizeFlow = left_idx === 0 ? flows.slice(-right_idx) : flows.slice(-right_idx, -left_idx);

    }else{
        if (flowOrder > 0)
          fitSizeFlow = flows.slice(flowUBN, flowLBN)
        else
          fitSizeFlow = flowUBN === 0 ? flows.slice(-flowLBN) : flows.slice(-flowLBN, -flowUBN);
    } 
    
    // handle station constraint on flows
    let constrainedFlow;
    if(stationFilter !== 0 && s.length > 0){
      constrainedFlow = fitSizeFlow.filter((flow) => 
        s.includes(flow.origin) || 
        s.includes(flow.dest)
      );
    }else
      constrainedFlow = fitSizeFlow

    let constrainedId = [];
    let constrainedStation;
    constrainedFlow.forEach((flow) => {
      constrainedId.push(flow.origin); 
      constrainedId.push(flow.dest);
    });
    constrainedId = [...new Set(constrainedId)];
    constrainedStation = stations.filter((station) => constrainedId.includes(station.id));

    let reachInfo = [];

    if (stationFilter !== 0 && displayingHeat){
      let counts = {};
      let reachable = [];

      flows.forEach((flow) => {
        const {origin, dest, count} = flow
        if (s.includes(origin) || s.includes(dest)){
          if (!s.includes(origin)){
            if(!counts.hasOwnProperty(origin))
              counts[origin] = count;
            else
              counts[origin] += count;

            reachable.push(origin);
          }

          if (!s.includes(dest)){
            if(!counts.hasOwnProperty(dest))
              counts[dest] = count;
            else
              counts[dest] += count;

            reachable.push(dest);
          }
        }
      })

      reachable = [...new Set(reachable)]
      stations.forEach((station) => {
        const { longitude, latitude, id } = station

        if (reachable.includes(id))
          reachInfo.push([longitude, latitude, counts[id]]);                  
      });
    }
      
    const GJLayer = new EditableGeoJsonLayer({
      id: "geojson-layer",
      data: polygon,
      mode: DrawPolygonMode,
      selectedFeatureIndexes: [-1],
      onEdit: this.setPolygon
    });

    const HMLayers = new HeatmapLayer({
      id: "heatmap-layer",
      data: reachInfo,
      pickable: false,
      getPosition: (info) => [info[0], info[1]],
      getWeight: (info) => info[2],
      radiusPixels: 25,
      intensity: 1,
      threshold: 0.03,
      colorRange: [   
        [255, 255, 127, 220],
        [255, 255, 137, 220],
        [255, 255, 147, 220],
        [255, 255, 158, 220],
        [255, 255, 168, 220],
        [255, 255, 178, 220],
        [255, 255, 188, 220],
        [255, 255, 198, 220],
        [255, 255, 209, 220],
        [255, 255, 219, 220],
        [255, 255, 229, 220]
      ]
    });

    // Debug
    // console.log(this.state, constrainedFlow, constrainedStation);

    return (
      <>
        <FlowMap
          flows={constrainedFlow}
          locations={constrainedStation}
          colors={colors}

          showTotals={true}
          showLocationAreas={false}
          pickable={true}

          opacity={0.5}
          maxLocationCircleSize={5}
          maxFlowThickness={5}
          mixBlendMode={"screen"}

          initialViewState={viewState}
          onViewStateChange={(vs) => {
            this.setState({ viewState: vs });
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
        />

        {displayingCir && (
          <DeckGL>
            <Cir 
              className="heatmap"
              flow_data={cirInfo}
            />
          </DeckGL>
        )}       

        {displayingHeat && (
          <DeckGL
            controller={false}
            layers={[HMLayers]}
            viewState={viewState}
            onViewStateChange={(evt) => {
              this.setState({ viewState: evt.viewState });
            }}
          >
          </DeckGL>
        )}

        {selecting && (
          <DeckGL
            controller={false}
            layers={[GJLayer]}
            viewState={viewState}
            onViewStateChange={(evt) => {
              this.setState({ viewState: evt.viewState });
            }}
            getCursor={GJLayer.getCursor.bind(GJLayer)}
          ></DeckGL>
        )}
        
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <button
            className="button"
            style={{
              background: displayingCir ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setCirInfo}
          >
            Circular Heat Chart {loading && <LoadingOutlined style={{color:"white", paddingLeft:"3px"}}/>}
          </button>
          
          <button
            className="button"
            style={{
              background: displayingHeat ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setReachInfo}          
          >
            Reachable Domain View
          </button>
          
          <button
            className="button"
            style={{
              background: selecting ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setSelectStation}
          >
            Select Target Stations
          </button>
        </div>

        <LegendBox top={5} right={5} style={{ fontSize: 15}}>
          <div style={{ padding: "3px" }}>
            <legend>
              <HistoryOutlined className="icon" /> Temporal Constraint
            </legend>
            <div className="temporal">
              <label>
                <CalendarOutlined className="icon" />
                Date Range
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
                  const startDate = dateStrings[0];
                  const endDate = dateStrings[1];
                  const { startTime, endTime } = this.state;
                  this.fetchCertainFlows(
                    startDate,
                    endDate,
                    startTime,
                    endTime
                  );
                }}
                disabledDate={(date) => {
                  return (
                    (date &&
                      date <
                        moment("2019-01-01", "YYYY-MM-DD").startOf("day")) ||
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
                  const { startDate, endDate } = this.state;
                  this.fetchCertainFlows(
                    startDate,
                    endDate,
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
                      onChange={this.refreshFlowBoundValue}
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
          <br />

          <div style={{ padding: "3px" }}>
            <legend>
              <EnvironmentOutlined className="icon" />
              Station Constraint
            </legend>
            <table>
              <tbody>
                <tr>
                  <td>
                    <label>Filter Method</label>
                  </td>
                  <td>
                    <Select 
                      className="select"
                      value={stationFilter} 
                      onChange={this.refreshStationFilter}
                      >
                      <Select.Option value={0}>None</Select.Option>
                      <Select.Option value={1}>Rank</Select.Option>
                      <Select.Option value={-1}>Polygon</Select.Option>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Rank Order</label>
                  </td>
                  <td>
                    <Radio.Group
                      value={stationOrder}
                      onChange={this.refreshStationOrder}
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
                      value={stationBound}
                      onChange={this.refreshStationBound}
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
                      step={stationBound > 0 ? 0.01 : 1}
                      min={0}
                      max={stationBound > 0 ? 100 : stationSize}
                      value={
                        stationBound > 0 ? [stationUBP, stationLBP] : [stationUBN, stationLBN]
                      }
                      onChange={this.refreshStationBoundValue}
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
                      step={stationBound > 0 ? 0.01 : 1}
                      min={0}
                      max={stationBound > 0 ? 100 : stationSize}
                      value={stationBound > 0 ? stationUBP : stationUBN}
                      style={{ width: '75px' }}
                      onChange={this.refreshStationLeftBound}
                    />
                    <InputNumber
                      className="num"
                      step={stationBound > 0 ? 0.01 : 1}
                      min={0}
                      max={stationBound > 0 ? 100 : stationSize}
                      value={stationBound > 0 ? stationLBP : stationLBN}
                      style={{ width: '75px' }}
                      onChange={this.refreshStationRightBound}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </LegendBox>
      </>
    );
  }
}
