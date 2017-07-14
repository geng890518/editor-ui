import React, { Component, PropTypes } from 'react';
import Icon from './Icon';

export default class VideoControls extends Component {
  static propTypes = {
    video: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.handleTimeUpdate = this._handleTimeUpdate.bind(this);
    this.handleVideoEnded = this._handleVideoEnded.bind(this);
    this.formatSeconds = this._formatSeconds.bind(this);

    this.state = {
      playButtonType: 'play',
      muteButtonType: 'volume',

      currentTime: '00:00',
      duration: '00:00'
    };
  }

  _handleVideoEnded() {
    this.seekBar.value = 0;
    this.setState({
      playButtonType: 'play',
      currentTime: '00:00'
    });
  }

  _handleTimeUpdate() {
    const nt = (100 / this.props.video.duration) * this.props.video.currentTime;
    this.seekBar.value = nt;
    this.setState({
      currentTime: this.formatSeconds(this.props.video.currentTime),
      duration: this.formatSeconds(this.props.video.duration)
    });
  }

  _formatSeconds(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    let hour = 0;
    if (mins > 60) {
      hour = Math.floor(mins / 60);
      // mins = Math.floor(mins % 60);
    }

    if (hour < 10) {
      hour = '0' + hour;
    }
    if (mins < 10) {
      mins = '0' + mins;
    }
    if (secs < 10) {
      secs = '0' + secs;
    }
    return `${mins}:${secs}`;
  }

  _handlePlayAndPause() {
    if (this.props.video.paused === true) {
      this.props.video.play();
      this.setState({
        playButtonType: 'pause'
      });
    } else {
      this.props.video.pause();
      this.setState({
        playButtonType: 'play'
      });
    }
  }

  _handleMute() {
    if (this.props.video.muted === false) {
      this.props.video.muted = true;
      this.props.video.volume = 0;
      this.setState({
        muteButtonType: 'mute'
      });
    } else {
      this.props.video.muted = false;
      this.props.video.volume = 1;
      this.setState({
        muteButtonType: 'volume'
      });
    }
  }

  _handleFullScreen() {
    if (this.props.video.requestFullscreen) {
      this.props.video.requestFullscreen();
    } else if (this.props.video.mozRequestFullScreen) {
      this.props.video.mozRequestFullScreen(); // Firefox
    } else if (this.props.video.webkitRequestFullscreen) {
      this.props.video.webkitRequestFullscreen(); // Chrome and Safari
    }
  }

  _handleSeekBar() {
    const time = this.props.video.duration * (this.seekBar.value / 100);
    this.props.video.currentTime = time;
  }

  _handleVolume() {
    this.props.video.volume = this.volumeBar.value;
  }

  render() {
    const styles = require('./VideoControls.scss');
    return (
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <button type="button" onClick={() => this._handlePlayAndPause()}>
            <Icon type={this.state.playButtonType} />
          </button>
          <div className={styles.timeDispaly}>
            <span>{ this.state.currentTime }</span>
            <span> / </span>
            <span>{this.state.duration}</span>
          </div>
          <input
            className={styles.seekBar}
            type="range"
            min="0"
            max="100"
            step="1"
            defaultValue="0"
            ref={(seekBar) => { this.seekBar = seekBar; }}
            onChange={() => this._handleSeekBar()}
          />
        </div>
        <div className={styles.rightControls}>
          <button
            type="button"
            onClick={() => this._handleMute()}
          >
            <Icon type={this.state.muteButtonType} />
          </button>
          <input
            className={styles.volume}
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="1"
            ref={(volumeBar) => { this.volumeBar = volumeBar; }}
            onChange={() => this._handleVolume()}
          />
          <button
            type="button"
            onClick={() => this._handleFullScreen()}
          >
            <Icon type="fullScreen" />
          </button>
        </div>
      </div>
    );
  }
}
