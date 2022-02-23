import { DeckGL } from "deck.gl";
import { IconLayer } from "@deck.gl/layers";
import React, { Component } from "react";
import { StaticMap } from "react-map-gl";
import axios from "axios";
import LineChart from "../LineChart";
import "mapbox-gl/dist/mapbox-gl.css";

export default class IconInfo extends Component {
  // initial state
  state = {
    stations: [],
    flows: [],
    selected : null,
    inflow: [],
    outflow: [],
    err: ""
  };

  fetchAllStation() {
    axios.get(" http://localhost:3000/search/all_station").then(
      (response) => {
        this.setState(response.data);
      },
      (error) => {
        console.log(error);
        this.setState({ err: error.message });
      }
    );
  }

  fetchStatisticFlowData(id) {
    axios.get(`http://localhost:3000/search/station_flow_info/${id}`).then(
      (response) => {
        this.setState(response.data);
      },
      (error) => {
        console.log(error);
        this.setState({ err: error.message });
      }
    );
  }

  handleIconOnClick = ({ object }) => {
    console.log(`${object.name}`);
    this.setState({ selected: object });
    this.fetchStatisticFlowData(object.id)
  };

  componentDidMount() {
    this.fetchAllStation();
  }

  render() {
    const { stations, selected, inflow, outflow } = this.state;
    return (
      <DeckGL
        controller={true}
        initialViewState={{ longitude: -74, latitude: 40.73, zoom: 11 }}
        layers={[
          new IconLayer({
            id: "icon-layer",
            data: stations,
            pickable: true,
            sizeScale: 2,
            getSize: 10,
            getColor: [255, 140, 0],
            iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
            iconMapping: { marker: { x: 0, y: 0, width: 128, height: 128, mask: true } },
            getIcon: () => "marker",
            getPosition: (d) => [d.longitude, d.latitude],
            onClick: this.handleIconOnClick
          })
        ]}
      >
        {selected && <LineChart selected={selected} inflow={inflow} outflow={outflow} />}
        <StaticMap
          mapboxApiAccessToken={
            "pk.eyJ1IjoibGtlZWV5IiwiYSI6ImNrdnRtdXo3MjI0cmEydnFoaTFidXpqYmIifQ.GrcM2kjDF4x4wMuPrKT4eA"
          }
        />
      </DeckGL>
    );
  }
}
