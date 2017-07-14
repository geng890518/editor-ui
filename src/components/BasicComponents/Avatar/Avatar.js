import React, { Component, PropTypes } from 'react';
// import { fullImageURLForImageModel } from '../../../helpers/URLHelpers';
import { Icon } from '../../BasicComponents';

export default class Avatar extends Component {
  static propTypes = {
    user: PropTypes.object,
    type: PropTypes.oneOf(['square', 'circle', 'editor']),
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    white: PropTypes.bool,
  }

  static defaultProps = {
    size: 24,
  }

  render() {
    const src = null;
    // if (this.props.user && this.props.user.avatar_image.url.length > 0) {
    //   src = this.props.user.avatar_image.url;
    // }
    const type = this.props.type;
    let style = {};
    if (type === 'circle') {
      style = {
        backgroundImage: 'url(' + src + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: this.props.size,
        height: this.props.size,
        borderRadius: '50%',
        flex: '0 0 auto',
        float: 'left',
        color: '#d8d8da',
      };
    } else if (type === 'editor') {
      style = {
        backgroundImage: 'url(' + src + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: this.props.size,
        height: this.props.size,
        borderRadius: '50%',
        flex: '0 0 auto',
        float: 'left',
        color: '#d8d8da',
        position: 'relative',
      };
    } else {
      style = {
        backgroundImage: 'url(' + src + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: this.props.size,
        height: this.props.size,
        borderRadius: '4px',
        flex: '0 0 auto',
        float: 'left',
        color: '#d8d8da',
      };
    }
    const icon = <Icon type="avatar" style={{ verticalAlign: 'top' }} width={this.props.size} height={this.props.size} />;
    const content = src ? null : icon;
    return (
      <div classID="avatar" style={style}>
        { content }
      </div>
    );
  }
}
