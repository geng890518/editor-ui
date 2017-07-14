/**
 * Created by Tian on 16/8/11.
 */

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { asyncConnect } from 'redux-async-connect';
// import { Motion, spring } from 'react-motion';

import { handleMouseDown, handleMouseMove, handleMouseUp } from 'redux/modules/editor';
// import { browserHistory } from 'react-router';
import RichEditor from './RichEditor';


// import EditorImage from './EditorImage/EditorImage';
// import EditorText from './EditorText/EditorText';

// const springConfig = { stiffness: 300, damping: 50 };

@connect(
  state => ({
    finished: state.editor.finished,
    postingError: state.editor.error,
    story: state.editor.story,

    delta: state.editor.delta,
    mouse: state.editor.mouse,
    isPressed: state.editor.isPressed,
    lastPressed: state.editor.lastPressed,
    order: state.editor.order,
    itemsCount: state.editor.itemsCount,

    user: state.auth.user,
  }),
  dispatch => bindActionCreators({ handleMouseMove, handleMouseUp, handleMouseDown }, dispatch)
)

export default class BeeEditor extends Component {
  static propTypes = {
    delta: PropTypes.number,
    mouse: PropTypes.number,
    isPressed: PropTypes.bool,
    lastPressed: PropTypes.number,
    order: PropTypes.array,
    itemsCount: PropTypes.number,

    handleMouseDown: PropTypes.func,
    handleMouseMove: PropTypes.func,
    handleMouseUp: PropTypes.func,

    finished: PropTypes.bool,
    error: PropTypes.object,
    story: PropTypes.object,
    user: PropTypes.object,
    location: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      client: false,
      counter: 3,
    };
  }

  componentDidMount() {
    this.setClientSideState();
    // window.addEventListener('touchmove', this.handleTouchMove);
    // window.addEventListener('touchend', this.props.handleMouseUp);
    // window.addEventListener('mousemove', this.props.handleMouseMove);
    // window.addEventListener('mouseup', this.props.handleMouseUp);
  }

  // componentWillReceiveProps(props) {
  //   if (props.finished && this.state.counter === 3) {
  //     const timer = () => {
  //       if (this.state.counter === 0) {
  //         browserHistory.push('/');
  //       } else {
  //         this.setCounter(this.state.counter - 1);
  //         setTimeout(timer, 1000);
  //       }
  //     };
  //     timer();
  //   }
  // }

  setCounter(counter) {
    this.setState({
      counter,
    });
  }

  setClientSideState() {
    this.setState({ client: true });
  }

  handleTouchStart(key, pressLocation, e) {
    this.props.handleMouseDown(key, pressLocation, e.touches[0]);
  }

  handleTouchMove(e) {
    e.preventDefault();
    this.props.handleMouseMove(e.touches[0]);
  }

  startPointForElement(element, i, order, elements) {
    let startY = 0;
    for (let a = 0; a < order.indexOf(i); a++) {
      const tempElement = elements[order[a]];
      startY += tempElement.height;
    }
    return startY;
  }

  render() {
    require('./draft.css');
    require('./toolbar.css');
    const t = <RichEditor story={this.props.story} type={this.props.location.query.type} />;
    // if (this.props.story && this.props.story.author.id !== this.props.user.userid) {
    //   t = (
    //     <div className="container">
    //       <h1>Doh! 404!</h1>
    //       <p>These are <em>not</em> the droids you are looking for!</p>
    //     </div>
    //   );
    // }
    return (
      <div>
        { t }
      </div>
    );
  }
}
