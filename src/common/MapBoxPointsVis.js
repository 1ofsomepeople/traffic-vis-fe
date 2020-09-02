import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';

class MapBoxPointsVis extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
        this.map = null;
        mapboxgl.accessToken = 'pk.eyJ1IjoiaHVzdDEyIiwiYSI6ImNrM3BpbDhsYTAzbDgzY3J2OXBzdXFuNDMifQ.bDD9-o_SB4fR0UXzYLy9gg';
        
    }

    showMap(){
        this.map = new mapboxgl.Map({
            container: this.props.mapContainerID,
            style: 'mapbox://styles/mapbox/outdoors-v11',
            zoom: 10,
            center: [116.368608, 39.901744],
        });
    }

    componentDidMount(){
        this.showMap();
        window.onresize = () => {
            this.map.resize()
        }
    }
    render() { 
        return (
            <div id={this.props.mapContainerID} style={{ minHeight: "600px" }}/>
        );
    }
}
 
export default MapBoxPointsVis;