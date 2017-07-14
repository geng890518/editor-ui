import React, { Component, PropTypes } from 'react';
import lazyLoadMapApi from '../../utils/getMap';
import Uuid from './uuid-lib';
let map;
let placeSearch;
class AMap extends Component {
  static propTypes = {
    handleLngLag: PropTypes.func,
    handleMapState: PropTypes.func,
    handleMapStateShow: PropTypes.func,
    blockProps: PropTypes.object,
    location: PropTypes.array,
    finalTarget: PropTypes.string,
  }

  static defaultProps = {
    location: [116.397428, 39.90923],
    name: '天安门',
    address: '北京市东城区中华路'
  }

  constructor(props) {
    super(props);
    this.state = {
      elementId: Uuid.raw(),
      location: this.props.location,
      editorState: false,
    };
  }

  componentDidMount() {
    const mapElements = document.querySelectorAll('.el-react-amap-container .el-react-amap');
    const loadConfig = {
      key: '3c72d52d0a6f22b61258872a40c78531',
    };
    const currentElement = Array.from(mapElements).filter(element => element.id === this.state.elementId)[0];
    const that = this;
    lazyLoadMapApi(loadConfig).then(() => {
      let dragEnable = true;
      let zoomEnable = true;
      let resizeEnable = true;
      let location = that.props.location;
      if (that.props.blockProps) {
        location = that.props.blockProps.location;
        resizeEnable = false;
        zoomEnable = false;
        dragEnable = false;
      }
      map = new window.AMap.Map(currentElement.id, {
        resizeEnable,
        zoomEnable,
        dragEnable,
        center: location,
        zoom: 13
      });
      const marker = new window.AMap.Marker({
        position: location,
        offset: new window.AMap.Pixel(-12, -12),
        zIndex: 101,
        map
      });
      console.log(marker);
      if (!that.props.blockProps) {
        const autoOptions = {
          input: 'search'
        };
        window.AMap.service(['AMap.PlaceSearch'], () => {
          placeSearch = new window.AMap.PlaceSearch({ // 构造地点查询类
            pageSize: 5,
            pageIndex: 1,
              // city: '010', // 城市
            map,
            panel: 'panel'
          });
        });

        const select = (e) => {
          let geocoder;
          window.AMap.service(['AMap.Geocoder'], () => {
            geocoder = new window.AMap.Geocoder({
              radius: 1000 // 范围，默认：500
            });
            const finalTarget = that.props.finalTarget ? that.props.finalTarget : e.poi.name;
            const searchTarget = e.poi.district + e.poi.address + e.poi.name;
            geocoder.getLocation(searchTarget, (status, result) => {
              if (status === 'complete' && result.info === 'OK') {
                const currentLngLag = [result.geocodes[0].location.getLng(), result.geocodes[0].location.getLat()];
                geocoder.getAddress(currentLngLag, (addstatus, addresult) => {
                  that.props.handleMapStateShow();
                  if (addstatus === 'complete' && addresult.info === 'OK') {
                    placeSearch.setCity(e.poi.adcode);
                    placeSearch.search(e.poi.name);
                    that.props.handleLngLag(currentLngLag, finalTarget, addresult.regeocode.formattedAddress);
                  }
                });
              } else {
                map.setZoomAndCenter(14, [116.397428, 39.90923]);
                that.props.handleMapState();
              }
            });
          });
        };
        let auto;
        window.AMap.service(['AMap.Autocomplete'], () => {
          auto = new window.AMap.Autocomplete(autoOptions);
          window.AMap.event.addListener(auto, 'select', select);
        });
      // 注册监听，当选中某条记录时会触发
      }
    });
  }

  render() {
    const styles = {
      container: {
        width: '100%',
        height: '300px',
        marginTop: '30px',
        marginBottom: '30px',
      },
      map: {
        width: '100%',
        height: '300px',
      },
    };
    const infoStyles = require('./Map.scss');
    const mapInfo = this.props.blockProps ? (<div className={infoStyles.addcontainer}>
      <div className={infoStyles.address}>
        <span className={infoStyles.nameinfo}>{this.props.blockProps.name}</span><br />
        <span className={infoStyles.addressinfo}>{this.props.blockProps.address}</span>
      </div>
    </div>) : null;
    return (
      <div>
        <div className="el-react-amap-container" style={styles.container}>
          <div className="el-react-amap" id={this.state.elementId} style={styles.map} />
          {mapInfo}
        </div>
      </div>
    );
  }
}
export default AMap;
