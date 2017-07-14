/**
 * Created by Jwill on 16/9/26.
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addTag } from 'redux/modules/editor';
import React, { Component, PropTypes } from 'react';
import CollectionsList from './CollectionsList';

@connect(
  () => ({}),
  dispatch => bindActionCreators({ addTag }, dispatch)
)

export default class InterestsList extends Component {

  static propTypes = {
    interest: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    addTag: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = { showlistState: false };
    // this.onClick = this.onClick.bind(this);
    this.expend = this.expend.bind(this);
    this.collapse = this.collapse.bind(this);
  }

  expend() {
    this.setState({ showlistState: !this.state.showlistState });
  }

  collapse() {
    this.setState({ showlistState: false });
  }

  // onClick() {
  //   this.setState({ showlistState: true });
  // }
  render() {
    const styles = require('./InterestsList.scss');
    const collections = this.props.interest.collections;
    const showlistState = this.state.showlistState;
    const mappedCollections = collections.map(collection => <CollectionsList collection={collection} handleClick={this.props.addTag} id={collection.id} key={collection.id} />);

    return (
      <div>
        {/* <a>{this.props.interest.interest_name}</a>*/}
        <a onClick={this.expend} >{this.props.interest.interest_name}</a>
          { showlistState === true ?
            <div className={styles.dropRight}>
              {mappedCollections}
            </div> : null
          }
      </div>

    );
  }
}
