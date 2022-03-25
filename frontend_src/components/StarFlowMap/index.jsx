<<<<<<< HEAD
import FlowMap, { LegendBox, LocationTotalsLegend } from "@flowmap.gl/react";
import { EditableGeoJsonLayer, DrawPolygonMode } from "nebula.gl";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { DeckGL } from "deck.gl";
import React, { Component } from "react";
import PubSub from "pubsub-js";
import qs from "querystring";
import axios from "axios";
import {
  DatabaseOutlined,
  ShrinkOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  HeatMapOutlined
} from "@ant-design/icons";
import { Slider, Radio, DatePicker, TimePicker, Select } from "antd";
import moment from "moment";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css"

export default class StarFlowMap extends Component {
  // initial state
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
    flowLBP: 100,
    flowUBP: 0,
    flowLBN: 0,
    flowUBN: 0,
    flowOrder: 1,
    flowBound: 1,
    stationLBP: 100,
    stationUBP: 0,
    stationLBN: 0,
    stationUBN: 0,
    stationOrder: 1,    
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
    selectedStation: [],
    reachInfo: [],
    cirInfo: [],
    polygon: {
      type: "FeatureCollection",
      features: []
    },
    polygonNum: 0,
    viewState: {
      latitude: 40.73,
      longitude: -74,
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
    // be called whenever there is an event that changes the state value is triggered
    // const { startDate, endDate, startTime, endTime } = this.state

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
          flowLBN :flows.length,
          stations: stations,
          stationsId: stationsId,
          stationSize: stations.length,          
          stationLBN: stations.length, 
          startDate: startDate, 
          endDate: endDate, 
          startTime: startTime,
          endTime: endTime
        });
      },
      (error) => {
        this.setState({ err: error.message });
      }
    );
  }

  // fetchWeekFlows() {
  //   const {startDate, endDate, selectedStation} = this.state;

  //   axios.get(`http://localhost:3000/search/station_flow_info?station_id=${selectedStation[3]}&start_date=${startDate}&end_date=${endDate}`).then(
  //     (response) => {
  //       this.setState({ displayingCir: true, cirInfo: response.data.data});
  //     },
  //     (error) => {
  //       this.setState({ err: error.message });
  //     }
  //   );
  // }

  // highlightRelevant = (flow) => {
  //   const { lightStation, stationOrder } = this.state

  //   if(stationOrder === 0)
  //     return undefined
  //   else{
  //     if (lightStation.includes(flow.origin) || lightStation.includes(flow.dest)) 
  //       return "rgb(240,128,128)"
  //     else
  //       return undefined
  //   }
  // }

  // refreshStationLB = (evt) => {
  //   const value = Number(evt.currentTarget.value);
  //   const { stationsId, stationOrder, stationSize, stationFilter, stationUBP, stationUBN, stationBound } = this.state;

  //   if (stationBound > 0){
  //     if (stationUBP <= value && value <= 100){
  //       if (stationFilter === 1){
  //         const left_idx = Math.round(stationUBP/100 * stationSize);
  //         const right_idx = Math.round(value/100 * stationSize);
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(left_idx, right_idx);
  //         else  
  //           selectedStation = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);

  //         this.setState({ stationLBP: value, selectedStation: selectedStation });
  //       }else this.setState({ stationLBP: value });
  //      } 
  //   }else{
  //     if (stationUBN <= value && value <= stationSize){
  //       if (stationFilter === 1){
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(stationUBN, value);
  //         else
  //           selectedStation = stationUBN === 0 ? stationsId.slice(-value) : stationsId.slice(-value, -stationUBN);

  //         this.setState({ stationLBN: value, selectedStation: selectedStation });
  //       }else this.setState({ stationLBN: value });
  //     } 
  //   }                  
  // } 

  // refreshStationUB = (evt) => {
  //   const value = Number(evt.currentTarget.value);
  //   const { stationsId, stationOrder, stationSize, stationFilter, stationLBP, stationLBN, stationBound } = this.state;

  //   if (stationBound > 0){
  //     if (0 <= value && value <= stationLBP){
  //       if (stationFilter === 1) {
  //         const left_idx = Math.round(value/100 * stationSize);
  //         const right_idx = Math.round(stationLBP/100 * stationSize);
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(left_idx, right_idx);
  //         else
  //           selectedStation = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);

  //         this.setState({ stationUBP: value, selectedStation: selectedStation });
  //       }else this.setState({ stationUBP: value });
  //      } 
  //   }else{
  //     if (0 <= value && value <= stationLBN){
  //       if (stationFilter === 1){
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(value, stationLBN);
  //         else 
  //           selectedStation = value === 0 ? stationsId.slice(-stationLBN) : stationsId.slice(-stationLBN, -value);

  //         this.setState({ stationUBN: value, selectedStation: selectedStation });
  //       }else this.setState({ stationUBN: value });
  //     } 
  //   }                  
  // } 

  refreshStationBoundValue = (value) => {
    const { stationsId, stationOrder, stationSize, stationFilter, stationBound } = this.state;
    if (stationBound > 0) {
      const stationUBP = value[0];
      const stationLBP = value[1];

      if (stationFilter === 1) {
        const selectedStation = this.refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder);
        this.setState({ stationUBP: stationUBP, stationLBP: stationLBP, selectedStation: selectedStation });
      }else
        this.setState({ stationUBP: stationUBP, stationLBP: stationLBP });

    } else {
      const stationUBN = value[0];
      const stationLBN = value[1];

      if (stationFilter === 1){
        const selectedStation = this.refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder);
        this.setState({ stationUBN: stationUBN, stationLBN: stationLBN, selectedStation: selectedStation });
      }else 
        this.setState({ stationUBN: stationUBN, stationLBN: stationLBN });
    }
  };

  refreshStationOrder = (evt) =>{
    const stationOrder = evt.target.value;
    const { stationsId, stationSize, stationFilter, stationLBP, stationLBN, stationUBP, stationUBN, stationBound } = this.state;

    if (stationFilter === 1){
      const selectedStation = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationOrder: stationOrder, selectedStation: selectedStation });
    }else
      this.setState({ stationOrder: stationOrder })
  }

  refreshStationBound = (evt) =>{
    const stationBound = evt.target.value;
    const { stationsId, stationSize, stationFilter, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder } = this.state;

    if (stationFilter === 1){
      const selectedStation = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationBound: stationBound, selectedStation: selectedStation });
    }else
      this.setState({ stationBound: stationBound })
  }

  refreshStationFilter = (evt) =>{
    const new_value = evt.value;
    const { stationsId, stationSize, stationFilter, stationOrder, stationLBP, stationLBN, stationUBP, stationUBN, stationBound } = this.state;

    if (stationFilter !== 1 && new_value === 1){
      const selectedStation = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationFilter: new_value, selectedStation: selectedStation });
    }else
      this.setState({ stationFilter: new_value });
  }

  refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder){
    let selectedStation;

    const left_idx = Math.round(stationUBP/100 * stationSize);
    const right_idx = Math.round(stationLBP/100 * stationSize);
    if (stationOrder > 0)
      selectedStation = stationsId.slice(left_idx, right_idx);
    else
      selectedStation = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);
    
    const selectStr = qs.stringify({ s: selectedStation });
    PubSub.publish("selected", selectStr);
    return selectedStation;
  }

  refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder){
    let selectedStation;

    if (stationOrder > 0)
      selectedStation = stationsId.slice(stationUBN, stationLBN);
    else 
      selectedStation = stationUBN === 0 ? stationsId.slice(-stationLBN) : stationsId.slice(-stationLBN, -stationUBN);

    const selectStr = qs.stringify({ s: selectedStation });
    PubSub.publish("selected", selectStr);
    return selectedStation;
  }

  refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound){
    const selectedStation = stationBound > 0 
      ? this.refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder)
      : this.refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder);

    return selectedStation;
  }

  refreshFlowBoundValue = (value) => {
    const { flowBound } = this.state;
    if (flowBound > 0) {
      this.setState({ flowUBP: value[0], flowLBP: value[1] });
    } else {
      this.setState({ flowUBN: value[0], flowLBN: value[1] });
    }
  };

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
        const { coordinates } = polygon.features[0].geometry;

        let selectedStation = [];
        stations.forEach((station) => {
          const { id, longitude, latitude } = station;
          if (this.isinPolygon(longitude, latitude, coordinates[0])) 
            selectedStation.push(id);
        });

        const selectStr = qs.stringify({ s: [1, 1, 2] });
        PubSub.publish("selected", selectStr);
        this.setState({ selecting: !selecting, selectedStation: selectedStation });
      } else this.setState({ selecting: !selecting });
    }

  };

  setReachInfo = () => {
    const { displayingHeat, selectedStation, stationFilter, flows, stations } = this.state;
    if (stationFilter !== 0){
      if (!displayingHeat){
        let counts = {};
        let reachable = [];

        flows.forEach((flow) => {
          const {origin, dest, count} = flow
          if (selectedStation.includes(origin) || selectedStation.includes(dest)){
            if (!selectedStation.includes(origin)){
              if(!counts.hasOwnProperty(origin))
                counts[origin] = count;
              else
                counts[origin] += count;

              reachable.push(origin);
            }

            if (!selectedStation.includes(dest)){
              if(!counts.hasOwnProperty(dest))
                counts[dest] = count;
              else
                counts[dest] += count;

              reachable.push(dest);
            }
          }
        })

        reachable = [...new Set(reachable)]
        let reachInfo = [];
        stations.forEach((station) => {
          const { longitude, latitude, id } = station

          if (reachable.includes(id))
            reachInfo.push([longitude, latitude, counts[id]]);                  
        });

        this.setState({ displayingHeat: !displayingHeat, reachInfo: reachInfo });
      }else
        this.setState({ displayingHeat: !displayingHeat });
    }
  }

  setCirInfo = () => {
    const { displayingCir, stationFilter} = this.state;
    if (stationFilter !== 0){
      if (!displayingCir){
        this.fetchWeekFlows();
      }else
        this.setState({ displayingCir: !displayingCir });
    }
  }

  fetchSelectedParam() {
    const { search } = this.props.location;
    const selectStr = search.slice(1);
    let param = qs.parse(selectStr);
    this.setState(param);
  }

  componentDidMount() {
    this.fetchSelectedParam();
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
      selectedStation,
      reachInfo,
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
    if(stationFilter !== 0 && selectedStation.length > 0){
      constrainedFlow = fitSizeFlow.filter((flow) => 
        selectedStation.includes(flow.origin) || 
        selectedStation.includes(flow.dest)
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
          maxLocationCircleSize={7}
          maxFlowThickness={10}
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
          // highlight specific flow
          // getFlowColor={this.highlightRelevant}
        />

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
        
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <button
            style={{
              background: selecting ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setSelectStation}
          >
            Select Target Stations
          </button>

          <button
            style={{
              background: displayingCir ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setCirInfo}
          >
            Circular Heat Chart
          </button>
          
          <button
            style={{
              background: displayingHeat ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setReachInfo}          
          >
            Reachable Domain View
          </button>
        </div>

        <LegendBox
          bottom={35}
          left={10}
          style={{ 
            backgroundColor: "rgb(41, 36, 33)",
            color: "white",
            borderWidth: 0,
            fontSize: 12,
          }}
        >
          <LocationTotalsLegend colors={colors} />
        </LegendBox>

        <LegendBox top={10} right={10} style={{ fontSize: 15}}>
          <div style={{ padding: "3px" }}>
            <legend>
              <DatabaseOutlined className="icon" /> Data Set Constraint:
            </legend>
            <div className="temporal">
              <label>
                <ScheduleOutlined className="icon" />
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
                  this.fetchCompareFlows(
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
                  this.fetchCompareFlows(
                    startDate,
                    endDate,
                    startTime,
                    endTime
                  );
                }}
              />
            </div>
          </div>
          
          <div style={{ padding: "3px" }}>
            <legend>
              <ShrinkOutlined className="icon" />
              Flow Constraint:
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
                      min={flowBound > 0 ? 0 : 0}
                      max={flowBound > 0 ? 100 : flowSize}
                      value={
                        flowBound > 0 ? [flowUBP, flowLBP] : [flowUBN, flowLBN]
                      }
                      onChange={this.refreshFlowBoundValue}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ padding: "3px" }}>
            <legend>
              <HeatMapOutlined className="icon" />
              Station Constraint:
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
                      <Select.Option value={-1}>Poly</Select.Option>
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
                      min={stationBound > 0 ? 0 : 0}
                      max={stationBound > 0 ? 100 : stationSize}
                      value={
                        stationBound > 0 ? [stationUBP, stationLBP] : [stationUBN, stationLBN]
                      }
                      onChange={this.refreshStationBoundValue}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* <div style={{ padding: "3px" }}>
            <legend> Station Constraint: </legend>
            <fieldset>
              <legend>Display Range</legend>

              <label>Filter Method</label>
              <select 
                value={stationFilter}
                onChange={this.refreshStationFilter}
              >
                <option value={0}>None</option>
                <option value={1}>Rank</option>
                <option value={-1}>Selected</option>
              </select>
              <br />

              <label>Rank Order</label>
              <select 
                value={stationOrder}
                onChange={this.refreshStationOrder}
              >
                <option value={1}>Ascend</option>
                <option value={-1}>Descend</option>
              </select>
              <br />

              <label>Bound Method</label>
              <select 
                value={stationBound}
                onChange={(evt) =>
                  this.setState({ stationBound: evt.currentTarget.value })
                }
              >
                <option value={1}>Percent</option>
                <option value={-1}>Number</option>
              </select>
              <br />

              <label>Higher</label>
              <input
                type="number"
                value={stationBound > 0 ? stationUBP : stationUBN}
                step={stationBound > 0 ? 0.01 : 1}
                min={stationBound > 0 ? 0 : 1}
                max={stationBound > 0 ? 100 : stationSize}
                onChange={this.refreshStationUB}
              />
              <label>Lower</label>
              <input
                type="number"
                value={stationBound > 0 ? stationLBP : stationLBN}
                step={stationBound > 0 ? 0.01 : 1}
                min={stationBound > 0 ? 0 : 1}
                max={stationBound > 0 ? 100 : stationSize}
                onChange={this.refreshStationLB}
              />
            </fieldset>
          </div> */}
        </LegendBox>
      </>
    );
  }
}
=======
import FlowMap, { LegendBox, LocationTotalsLegend } from "@flowmap.gl/react";
import { EditableGeoJsonLayer, DrawPolygonMode } from "nebula.gl";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { DeckGL } from "deck.gl";
import React, { Component } from "react";
import PubSub from "pubsub-js";
import qs from "querystring";
import axios from "axios";
import {
  DatabaseOutlined,
  ShrinkOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  HeatMapOutlined
} from "@ant-design/icons";
import { Slider, Radio, DatePicker, TimePicker, Select } from "antd";
import moment from "moment";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css"

export default class StarFlowMap extends Component {
  // initial state
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
    flowLBP: 100,
    flowUBP: 0,
    flowLBN: 0,
    flowUBN: 0,
    flowOrder: 1,
    flowBound: 1,
    stationLBP: 100,
    stationUBP: 0,
    stationLBN: 0,
    stationUBN: 0,
    stationOrder: 1,    
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
    selectedStation: [],
    reachInfo: [],
    cirInfo: [],
    polygon: {
      type: "FeatureCollection",
      features: []
    },
    polygonNum: 0,
    viewState: {
      latitude: 40.73,
      longitude: -74,
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
    // be called whenever there is an event that changes the state value is triggered
    // const { startDate, endDate, startTime, endTime } = this.state

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
          flowLBN :flows.length,
          stations: stations,
          stationsId: stationsId,
          stationSize: stations.length,          
          stationLBN: stations.length, 
          startDate: startDate, 
          endDate: endDate, 
          startTime: startTime,
          endTime: endTime
        });
      },
      (error) => {
        this.setState({ err: error.message });
      }
    );
  }

  // fetchWeekFlows() {
  //   const {startDate, endDate, selectedStation} = this.state;

  //   axios.get(`http://localhost:3000/search/station_flow_info?station_id=${selectedStation[3]}&start_date=${startDate}&end_date=${endDate}`).then(
  //     (response) => {
  //       this.setState({ displayingCir: true, cirInfo: response.data.data});
  //     },
  //     (error) => {
  //       this.setState({ err: error.message });
  //     }
  //   );
  // }

  // highlightRelevant = (flow) => {
  //   const { lightStation, stationOrder } = this.state

  //   if(stationOrder === 0)
  //     return undefined
  //   else{
  //     if (lightStation.includes(flow.origin) || lightStation.includes(flow.dest)) 
  //       return "rgb(240,128,128)"
  //     else
  //       return undefined
  //   }
  // }

  // refreshStationLB = (evt) => {
  //   const value = Number(evt.currentTarget.value);
  //   const { stationsId, stationOrder, stationSize, stationFilter, stationUBP, stationUBN, stationBound } = this.state;

  //   if (stationBound > 0){
  //     if (stationUBP <= value && value <= 100){
  //       if (stationFilter === 1){
  //         const left_idx = Math.round(stationUBP/100 * stationSize);
  //         const right_idx = Math.round(value/100 * stationSize);
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(left_idx, right_idx);
  //         else  
  //           selectedStation = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);

  //         this.setState({ stationLBP: value, selectedStation: selectedStation });
  //       }else this.setState({ stationLBP: value });
  //      } 
  //   }else{
  //     if (stationUBN <= value && value <= stationSize){
  //       if (stationFilter === 1){
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(stationUBN, value);
  //         else
  //           selectedStation = stationUBN === 0 ? stationsId.slice(-value) : stationsId.slice(-value, -stationUBN);

  //         this.setState({ stationLBN: value, selectedStation: selectedStation });
  //       }else this.setState({ stationLBN: value });
  //     } 
  //   }                  
  // } 

  // refreshStationUB = (evt) => {
  //   const value = Number(evt.currentTarget.value);
  //   const { stationsId, stationOrder, stationSize, stationFilter, stationLBP, stationLBN, stationBound } = this.state;

  //   if (stationBound > 0){
  //     if (0 <= value && value <= stationLBP){
  //       if (stationFilter === 1) {
  //         const left_idx = Math.round(value/100 * stationSize);
  //         const right_idx = Math.round(stationLBP/100 * stationSize);
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(left_idx, right_idx);
  //         else
  //           selectedStation = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);

  //         this.setState({ stationUBP: value, selectedStation: selectedStation });
  //       }else this.setState({ stationUBP: value });
  //      } 
  //   }else{
  //     if (0 <= value && value <= stationLBN){
  //       if (stationFilter === 1){
  //         let selectedStation;

  //         if (stationOrder > 0)
  //           selectedStation = stationsId.slice(value, stationLBN);
  //         else 
  //           selectedStation = value === 0 ? stationsId.slice(-stationLBN) : stationsId.slice(-stationLBN, -value);

  //         this.setState({ stationUBN: value, selectedStation: selectedStation });
  //       }else this.setState({ stationUBN: value });
  //     } 
  //   }                  
  // } 

  refreshStationBoundValue = (value) => {
    const { stationsId, stationOrder, stationSize, stationFilter, stationBound } = this.state;
    if (stationBound > 0) {
      const stationUBP = value[0];
      const stationLBP = value[1];

      if (stationFilter === 1) {
        const selectedStation = this.refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder);
        this.setState({ stationUBP: stationUBP, stationLBP: stationLBP, selectedStation: selectedStation });
      }else
        this.setState({ stationUBP: stationUBP, stationLBP: stationLBP });

    } else {
      const stationUBN = value[0];
      const stationLBN = value[1];

      if (stationFilter === 1){
        const selectedStation = this.refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder);
        this.setState({ stationUBN: stationUBN, stationLBN: stationLBN, selectedStation: selectedStation });
      }else 
        this.setState({ stationUBN: stationUBN, stationLBN: stationLBN });
    }
  };

  refreshStationOrder = (evt) =>{
    const stationOrder = evt.target.value;
    const { stationsId, stationSize, stationFilter, stationLBP, stationLBN, stationUBP, stationUBN, stationBound } = this.state;

    if (stationFilter === 1){
      const selectedStation = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationOrder: stationOrder, selectedStation: selectedStation });
    }else
      this.setState({ stationOrder: stationOrder })
  }

  refreshStationBound = (evt) =>{
    const stationBound = evt.target.value;
    const { stationsId, stationSize, stationFilter, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder } = this.state;

    if (stationFilter === 1){
      const selectedStation = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationBound: stationBound, selectedStation: selectedStation });
    }else
      this.setState({ stationBound: stationBound })
  }

  refreshStationFilter = (evt) =>{
    const new_value = evt.value;
    const { stationsId, stationSize, stationFilter, stationOrder, stationLBP, stationLBN, stationUBP, stationUBN, stationBound } = this.state;

    if (stationFilter !== 1 && new_value === 1){
      const selectedStation = this.refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound)
      this.setState({ stationFilter: new_value, selectedStation: selectedStation });
    }else
      this.setState({ stationFilter: new_value });
  }

  refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder){
    let selectedStation;

    const left_idx = Math.round(stationUBP/100 * stationSize);
    const right_idx = Math.round(stationLBP/100 * stationSize);
    if (stationOrder > 0)
      selectedStation = stationsId.slice(left_idx, right_idx);
    else
      selectedStation = left_idx === 0 ? stationsId.slice(-right_idx) : stationsId.slice(-right_idx, -left_idx);
    
    const selectStr = qs.stringify({ s: selectedStation });
    PubSub.publish("selected", selectStr);
    return selectedStation;
  }

  refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder){
    let selectedStation;

    if (stationOrder > 0)
      selectedStation = stationsId.slice(stationUBN, stationLBN);
    else 
      selectedStation = stationUBN === 0 ? stationsId.slice(-stationLBN) : stationsId.slice(-stationLBN, -stationUBN);

    const selectStr = qs.stringify({ s: selectedStation });
    PubSub.publish("selected", selectStr);
    return selectedStation;
  }

  refreshSelectStation(stationsId, stationSize, stationLBP, stationLBN, stationUBP, stationUBN, stationOrder, stationBound){
    const selectedStation = stationBound > 0 
      ? this.refreshPercentSelect(stationsId, stationSize, stationLBP, stationUBP, stationOrder)
      : this.refreshNumberSelect(stationsId, stationLBN, stationUBN, stationOrder);

    return selectedStation;
  }

  refreshFlowBoundValue = (value) => {
    const { flowBound } = this.state;
    if (flowBound > 0) {
      this.setState({ flowUBP: value[0], flowLBP: value[1] });
    } else {
      this.setState({ flowUBN: value[0], flowLBN: value[1] });
    }
  };

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
        const { coordinates } = polygon.features[0].geometry;

        let selectedStation = [];
        stations.forEach((station) => {
          const { id, longitude, latitude } = station;
          if (this.isinPolygon(longitude, latitude, coordinates[0])) 
            selectedStation.push(id);
        });

        const selectStr = qs.stringify({ s: [1, 1, 2] });
        PubSub.publish("selected", selectStr);
        this.setState({ selecting: !selecting, selectedStation: selectedStation });
      } else this.setState({ selecting: !selecting });
    }

  };

  setReachInfo = () => {
    const { displayingHeat, selectedStation, stationFilter, flows, stations } = this.state;
    if (stationFilter !== 0){
      if (!displayingHeat){
        let counts = {};
        let reachable = [];

        flows.forEach((flow) => {
          const {origin, dest, count} = flow
          if (selectedStation.includes(origin) || selectedStation.includes(dest)){
            if (!selectedStation.includes(origin)){
              if(!counts.hasOwnProperty(origin))
                counts[origin] = count;
              else
                counts[origin] += count;

              reachable.push(origin);
            }

            if (!selectedStation.includes(dest)){
              if(!counts.hasOwnProperty(dest))
                counts[dest] = count;
              else
                counts[dest] += count;

              reachable.push(dest);
            }
          }
        })

        reachable = [...new Set(reachable)]
        let reachInfo = [];
        stations.forEach((station) => {
          const { longitude, latitude, id } = station

          if (reachable.includes(id))
            reachInfo.push([longitude, latitude, counts[id]]);                  
        });

        this.setState({ displayingHeat: !displayingHeat, reachInfo: reachInfo });
      }else
        this.setState({ displayingHeat: !displayingHeat });
    }
  }

  setCirInfo = () => {
    const { displayingCir, stationFilter} = this.state;
    if (stationFilter !== 0){
      if (!displayingCir){
        this.fetchWeekFlows();
      }else
        this.setState({ displayingCir: !displayingCir });
    }
  }

  fetchSelectedParam() {
    const { search } = this.props.location;
    const selectStr = search.slice(1);
    let param = qs.parse(selectStr);
    this.setState(param);
  }

  componentDidMount() {
    this.fetchSelectedParam();
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
      selectedStation,
      reachInfo,
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
    if(stationFilter !== 0 && selectedStation.length > 0){
      constrainedFlow = fitSizeFlow.filter((flow) => 
        selectedStation.includes(flow.origin) || 
        selectedStation.includes(flow.dest)
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
          maxLocationCircleSize={7}
          maxFlowThickness={10}
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
          // highlight specific flow
          // getFlowColor={this.highlightRelevant}
        />

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
        
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <button
            style={{
              background: selecting ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setSelectStation}
          >
            Select Target Stations
          </button>

          <button
            style={{
              background: displayingCir ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setCirInfo}
          >
            Circular Heat Chart
          </button>
          
          <button
            style={{
              background: displayingHeat ? "rgb(135, 206, 235)" : null
            }}
            onClick={this.setReachInfo}          
          >
            Reachable Domain View
          </button>
        </div>

        <LegendBox
          bottom={35}
          left={10}
          style={{ 
            backgroundColor: "rgb(41, 36, 33)",
            color: "white",
            borderWidth: 0,
            fontSize: 12,
          }}
        >
          <LocationTotalsLegend colors={colors} />
        </LegendBox>

        <LegendBox top={10} right={10} style={{ fontSize: 15}}>
          <div style={{ padding: "3px" }}>
            <legend>
              <DatabaseOutlined className="icon" /> Data Set Constraint:
            </legend>
            <div className="temporal">
              <label>
                <ScheduleOutlined className="icon" />
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
                  this.fetchCompareFlows(
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
                  this.fetchCompareFlows(
                    startDate,
                    endDate,
                    startTime,
                    endTime
                  );
                }}
              />
            </div>
          </div>
          
          <div style={{ padding: "3px" }}>
            <legend>
              <ShrinkOutlined className="icon" />
              Flow Constraint:
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
                      min={flowBound > 0 ? 0 : 0}
                      max={flowBound > 0 ? 100 : flowSize}
                      value={
                        flowBound > 0 ? [flowUBP, flowLBP] : [flowUBN, flowLBN]
                      }
                      onChange={this.refreshFlowBoundValue}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ padding: "3px" }}>
            <legend>
              <HeatMapOutlined className="icon" />
              Station Constraint:
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
                      <Select.Option value={-1}>Poly</Select.Option>
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
                      min={stationBound > 0 ? 0 : 0}
                      max={stationBound > 0 ? 100 : stationSize}
                      value={
                        stationBound > 0 ? [stationUBP, stationLBP] : [stationUBN, stationLBN]
                      }
                      onChange={this.refreshStationBoundValue}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* <div style={{ padding: "3px" }}>
            <legend> Station Constraint: </legend>
            <fieldset>
              <legend>Display Range</legend>

              <label>Filter Method</label>
              <select 
                value={stationFilter}
                onChange={this.refreshStationFilter}
              >
                <option value={0}>None</option>
                <option value={1}>Rank</option>
                <option value={-1}>Selected</option>
              </select>
              <br />

              <label>Rank Order</label>
              <select 
                value={stationOrder}
                onChange={this.refreshStationOrder}
              >
                <option value={1}>Ascend</option>
                <option value={-1}>Descend</option>
              </select>
              <br />

              <label>Bound Method</label>
              <select 
                value={stationBound}
                onChange={(evt) =>
                  this.setState({ stationBound: evt.currentTarget.value })
                }
              >
                <option value={1}>Percent</option>
                <option value={-1}>Number</option>
              </select>
              <br />

              <label>Higher</label>
              <input
                type="number"
                value={stationBound > 0 ? stationUBP : stationUBN}
                step={stationBound > 0 ? 0.01 : 1}
                min={stationBound > 0 ? 0 : 1}
                max={stationBound > 0 ? 100 : stationSize}
                onChange={this.refreshStationUB}
              />
              <label>Lower</label>
              <input
                type="number"
                value={stationBound > 0 ? stationLBP : stationLBN}
                step={stationBound > 0 ? 0.01 : 1}
                min={stationBound > 0 ? 0 : 1}
                max={stationBound > 0 ? 100 : stationSize}
                onChange={this.refreshStationLB}
              />
            </fieldset>
          </div> */}
        </LegendBox>
      </>
    );
  }
}
>>>>>>> 1a8d03daa8f554b10e21a354b27cf5da96127b85
