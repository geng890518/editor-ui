/**
 * Created by Jwill on 16/9/24.
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import { addTag, delTag } from 'redux/modules/editor';
import { bindActionCreators } from 'redux';
import Tag from '../../../../../components/BasicComponents/Tag/Tag';
import CascaderButton from '../../../../../components/BasicComponents/Cascader/CascaderButton';

@connect(
  state => ({
    posting: state.editor.posting,
    finished: state.editor.finished,
    allCollections: state.editor.allCollections,
    collections: state.editor.collections
  }),
  dispatch => bindActionCreators({ addTag, delTag }, dispatch)
)

export default class EditorFooter extends Component {

  static propTypes = {
    postDraft: PropTypes.func,
    posting: PropTypes.bool,
    finished: PropTypes.bool,
    allCollections: PropTypes.array,
    addTag: PropTypes.func,
    collections: PropTypes.array,
    delTag: PropTypes.func,
  }

  render() {
    const styles = require('./EditorFooter.scss');
    const borderColor = {
      borderColor: '#ced0d4',
      padding: '2px 8px',
    };
    const collectionsArray = [];
    this.props.allCollections.map((element) => {
      this.props.collections.map((collection) => {
        if (collection.id === element.id) {
          collectionsArray.push(element);
        }
        return null;
      });
      return null;
    });
    const mapElements = collectionsArray.map((element, index) => <Tag closable key={index} onClose={() => this.props.delTag({ id: element.id })}>{element.collection_name}</Tag>);
    const message = this.props.posting ? '发布中...' : '发布';
    const className = styles.sendButton + ' ' + styles.noemit;
    return (
      <div className={styles.footer}>
        <Grid>
          <Row>
            <Col xs={12} md={8} mdOffset={2} className={styles.base_finished}>
              {mapElements}
              <div className={styles.fright}>
                <CascaderButton allCollections={this.props.allCollections} addTag={this.props.addTag} collections={this.props.collections} />
                <button
                  className={className}
                  type="submit"
                  style={borderColor}
                  onClick={() => this.props.postDraft()}
                  disabled={this.props.posting}
                >
                  {message}
                </button>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
