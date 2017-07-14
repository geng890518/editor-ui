import React, { Component, PropTypes } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Grid from 'react-bootstrap/lib/Grid';
import Col from 'react-bootstrap/lib/Col';
// import { browserHistory } from 'react-router';
import {
  Editor,
  ContentState,
  convertFromHTML,
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw,
  getVisibleSelectionRect,
  Modifier,
} from 'draft-js';
import { FullScreen } from 'components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { postDraft, updateStory, setElements, rebuildEditor } from 'redux/modules/editor';
import { Modal, Button } from 'antd';
import {
  getSelectionRange,
  getSelectedBlockElement,
  getSelectionCoords
} from '../utils/selection';
import Toolbar from './SideToolbar';
import SideBar from '../components/InlineToolbar';
import EditorImage from '../components/EditorImage/EditorImage';
import { convertCurrentContentToElementsArray, convertElementsArrayToRawDraftContent, getImageCount, getSummary, hasTextElement, convertElementTypeToNumber } from '../../../../helpers/EditorHelpers';
import EditorFooter from '../components/EditorFooter/EditorFooter';
import EditorTitle from '../../EditorTitle/EditorTitle';
import EditorCoverPage from '../../EditorCoverPage/EditorCoverPage';
import ExtendedRichUtils, { ALIGNMENT_DATA_KEY, ALIGNMENTS, existedBlockTypesForContent } from '../utils/ExtendedRichUtils';
import Separator from '../../../../components/Separator/Separator';
import AMap from '../components/Map/Map';
import EditorVideo from '../components/EditorVideo/EditorVideo';
import { Icon } from '../../../../components/BasicComponents';
import DEFAULT_PLUGINS from '../components/plugins/default';

@connect(
  state => ({
    token: state.qiniu.token,
    posting: state.editor.posting,
    finished: state.editor.finished,
    postDraftSucessData: state.editor.postDraftSucessData,

    userToken: state.editor.token,
    returnUrl: state.editor.returnUrl,
    editorConfigure: state.editor.editorConfigure,
    channel: state.editor.channel,
    collections: state.editor.collections,
    title: state.editor.title,
    cover_media: state.editor.cover_media,
    elements: state.editor.elements,
    summary: state.editor.summary,
    imageCount: state.editor.imageCount,

    delta: state.editor.delta,
    mouse: state.editor.mouse,
    isPressed: state.editor.isPressed,
    lastPressed: state.editor.lastPressed,
    order: state.editor.order,
    itemsCount: state.editor.itemsCount,
  }),
  dispatch => bindActionCreators({ postDraft, updateStory, setElements, rebuildEditor }, dispatch)
)

class RichEditor extends Component {
  static propTypes = {
    token: PropTypes.string,
    story: PropTypes.object,
    userToken: PropTypes.string,
    returnUrl: PropTypes.string,
    postDraftSucessData: PropTypes.object,

    editorConfigure: PropTypes.object,
    channel: PropTypes.string,
    collections: PropTypes.array,
    title: PropTypes.string,
    cover_media: PropTypes.object,
    elements: PropTypes.array,
    summary: PropTypes.string,
    imageCount: PropTypes.number,
    collectionID: PropTypes.array,

    postDraft: PropTypes.func,
    updateStory: PropTypes.func,
    setElements: PropTypes.func,
    rebuildEditor: PropTypes.func,

    finished: PropTypes.bool,
    posting: PropTypes.bool,
    noNavigationBar: PropTypes.string,
    type: PropTypes.string,
  }

  constructor(props) {
    super(props);

    let newEditorState = EditorState.createEmpty();
    if (this.props.story) {
      // console.log(convertFromRaw(convertElementsArrayToRawDraftContent(this.props.story.elements)));
      const blocks = convertFromRaw(convertElementsArrayToRawDraftContent([...this.props.story.elements]));
      newEditorState = EditorState.createWithContent(blocks);
      // console.log(blocks);
    }
    this.state = {
      editorState: newEditorState,
      toolbar: { show: false },
      editingImage: false,
      editingVideo: false,
      editingFooter: false,
      editingCaption: false,
      client: false,
      counter: 3,
      liveCaptionEdits: new Map(),
      mapState: true,
      visible: false,
      targetAddress: '',
      location: [116.397428, 39.90923],
      name: '天安门',
      address: '北京市东城区中华路甲10号',
      selectedBlock: null,
    };

    this.logState = () => {
      const content = this.state.editorState.getCurrentContent();
      console.log('++++++++++++state+++++++++++++++');
      console.log(convertToRaw(content));
      console.log('------------state---------------');
    };
    this.logElements = async () => {
      const content = this.state.editorState.getCurrentContent();
      const elements = await (convertCurrentContentToElementsArray(convertToRaw(content)));
      console.log('++++++++++++elements++++++++++++');
      console.log(elements);
      console.log('------------elements------------');
    };
    this.logTest = () => {
      // const content = this.state.editorState.getCurrentContent();
      // const elements = convertCurrentContentToElementsArray(convertToRaw(content));
      const content2 = convertElementsArrayToRawDraftContent(this.props.story.elements);
      console.log('++++++++++++test++++++++++++++++');
      console.log(content2);
      console.log('------------test----------------');
    };

    this.logSummary = async () => {
      const content = this.state.editorState.getCurrentContent();
      const elements = await (convertCurrentContentToElementsArray(convertToRaw(content)));
      const summary = getSummary(elements);
      console.log('++++++++++++summary+++++++++++++');
      console.log(summary);
      console.log('------------summary-------------');
    };

    this.onChange = (editorState) => {
      // console.log(window.getSelection().getRangeAt(0).getBoundingClientRect());
      const scrollTop = document.body.scrollTop;
      if (getVisibleSelectionRect(window) && ((getVisibleSelectionRect(window).top < 58))) {
        document.body.scrollTop = scrollTop + getVisibleSelectionRect(window).top + (-58);
      }
      this.setState({ editorState });
      setTimeout(this.updateSelection, 0);
    };
    this.focus = () => this.editor.focus();
    this.updateSelection = () => this._updateSelection();
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.handleUploadImage = () => this._handleUploadImage();
    this.handleUploadSeparator = () => this._handleUploadSeparator();
    this.handleUploadMap = () => this._handleUploadMap();
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.insertImage = (file) => this._insertImage(file);
    this.insertSeparator = (file) => this._insertSeparator(file);
    this.insertMap = (file) => this._insertMap(file);
    this.handleCancel = () => this._handleCancel();
    this.handleOk = () => this._handleOk();
    this.showModal = () => this._showModal();
    this.handleLngLag = (location, name, address) => this._handleLngLag(location, name, address);
    this.handleNewOpen = () => this._handleNewOpen();
    this.handleMapState = () => this._handleMapState();
    this.handleMapStateShow = () => this._handleMapStateShow();
    this.plugins = () => this._getValidPlugins();
    this.insertVideo = (file) => this._insertVideo(file);
    this.handleUploadVideo = () => this._handleUploadVideo();
    this.handlePastedText = (text, html) => this._handlePastedText(text, html);
    this.blockRenderer = (block) => {
      if (block.getType() === 'atomic') {
        const contentState = this.state.editorState.getCurrentContent();
        const entity = contentState.getEntity(block.getEntityAt(0));
        if (entity.getData().selfdefine && !entity.getData().map) {
          return {
            component: EditorImage,
            editable: false,
            props: {
              createMoreImages: (files) => this.createMoreImages(files),
              editingImage: (editingImage) => this.editingImage(editingImage),
              editingCaption: (editingCaption) => this.editingCaption(editingCaption),
              finished: entity.getData().finished,
              imageURL: entity.getData().imageURL,
              captionText: entity.getData().captionText,

              onStartCaptionEdit: () => { this.setState({ editingCaption: true }); },
              onFinishCaptionEdit: () => { this.setState({ editingCaption: false }, () => { this.updateSelection(); }); },
            },
          };
        } else if (!entity.getData().selfdefine && entity.getData().map) {
          return {
            component: AMap,
            editable: false,
            props: {
              location: entity.getData().location,
              name: entity.getData().name,
              address: entity.getData().address,
            },
          };
        } else if (entity.getData().video) {
          return {
            component: EditorVideo,
            editable: false,
            props: {
              editingVideo: (editingVideo) => this.editingVideo(editingVideo),
              videoURL: entity.getData().videoURL,
              urlRequired: entity.getData().url,
              finished: entity.getData().finished,
              length: entity.getData().length,
              iframe_code: entity.getData().iframe_code,
              editingFooter: (editingFooter) => this.editingFooter(editingFooter),
            }
          };
        }
        return {
          component: Separator,
          editable: false,
        };
      }
      return null;
    };

    /**
     *  post draft
     */
    this.postDraft = () => {
      const content = this.state.editorState.getCurrentContent();
      const elements = convertCurrentContentToElementsArray(convertToRaw(content));
      // const summary = getSummary(elements);
      this.props.setElements(elements);
      const image_count = getImageCount(elements);

      if (this.props.editorConfigure.title_required && !this.props.title) {
        window.alert('请添加标题...');
        return;
      }

      if (this.props.editorConfigure.cover_required && !this.props.cover_media && this.props.type !== '20') {
        window.alert('请添加封面图...');
        return;
      }

      if (!this.props.editorConfigure.content_required && this.props.editorConfigure.content_image_required && image_count === 0) {
        window.alert('请添加除封面图外的其它图片...');
        return;
      }
      if (!this.props.editorConfigure.content_required && this.props.editorConfigure.content_text_required && !hasTextElement(elements)) {
        window.alert('请添加除标题外的其它文字元素...');
        return;
      }

      if (this.props.editorConfigure.content_required && image_count === 0 && !hasTextElement(elements)) {
        window.alert('请添加内容...');
        return;
      }
      let draftContent = {
        type: this.props.type,
        title: this.props.title,
        collections: this.props.collections || undefined,
        cover_image: this.props.cover_media || undefined,
        elements: convertElementTypeToNumber(elements),
        location: this.state.locationForEditor
      };
      if (this.props.story) {
        draftContent = {
          id: this.props.story.id,
          type: this.props.story.type,
          collections: this.props.collections,
          comment_enabled: this.props.story.comment_enabled,
          location: this.props.story.location || this.state.locationForEditor,

          title: this.props.title,
          cover_image: this.props.cover_media,
          elements: convertElementTypeToNumber(elements),
        };
      }
      const draft = {
        content: JSON.stringify(draftContent)
      };
      // console.log(draft);
      console.log(draft);
      this.props.postDraft(draft.content);
    };

    this.blockStyler = (block) => {
      if (block.getType() === 'IMAGE') {
        return 'atomic';
      }

      if (existedBlockTypesForContent.includes(block.getType())) {
        let alignment = ALIGNMENTS[0];
        if (block.getData().get(ALIGNMENT_DATA_KEY)) alignment = block.getData().get(ALIGNMENT_DATA_KEY);
        return `alignment--${alignment}`;
      }
      return null;
    };
  }

  /**
   *  RichEditor的生命周期
   */
  componentDidMount() {
    this.setClientSideState();
    try {
      this.getBrowserCurrentLocation();
    } catch (err) {
      console.error('get browser location failed... 😓  😓  😓  ');
    }

    // window.addEventListener('touchmove', this.handleTouchMove);
    // window.addEventListener('touchend', this.props.handleMouseUp);
    // window.addEventListener('mousemove', this.props.handleMouseMove);
    // window.addEventListener('mouseup', this.props.handleMouseUp);
  }

  componentWillReceiveProps(props) {
    if (props.finished && this.state.counter === 3) {
      if (window) window.scrollTo(0, 0);
      const timer = () => {
        if (this.state.counter === 0) {
          this.setState({
            editorState: EditorState.createEmpty(),
          });
          window.location.href = 'http://localhost:3000/content';
        } else {
          this.setCounter(this.state.counter - 1);
          setTimeout(timer, 1000);
        }
      };
      timer();
    }
  }

  setCounter(counter) {
    this.setState({
      counter,
    });
  }

  setClientSideState() {
    this.setState({ client: true });
  }

  /**
   *  获取使用者当前的地址
   */
  getBrowserCurrentLocation() {
    let mapObj;
    let geolocation;
    if (window.AMap) {
      mapObj = new window.AMap.Map('iCenter');
      mapObj.plugin('AMap.Geolocation', () => {
        geolocation = new window.AMap.Geolocation({ timeout: 10000 });
      });
      mapObj.addControl(geolocation);
      geolocation.getCurrentPosition();
      window.AMap.event.addListener(geolocation, 'complete', (data) => {
        this.setCurrentLocation({
          type: 10,
          lng: data.position.lng,
          lat: data.position.lat,
          address: data.formattedAddress
        });
      });
      window.AMap.event.addListener(geolocation, 'error', (error) => console.log(error));
    }
  }
  setCurrentLocation(locationForEditor) {
    this.setState({
      locationForEditor
    });
  }

  /**
   *  编辑器发布完内容后跳转到期望的地址(returnUrl)
   */

  _updateSelection() {
    const selectionRange = getSelectionRange();
    let selectedBlock;
    if (selectionRange) {
      selectedBlock = getSelectedBlockElement(selectionRange);
      if (selectedBlock) {
        if (selectedBlock.localName !== 'figure' && this.state.editorState.getSelection().focusOffset === 0 && !this.state.editingCaption && !selectedBlock.textContent && !this.state.editingVideo) {
          this.setState({
            selectedBlock,
            selectionRange
          });
        } else {
          this.setState({
            selectedBlock: null,
          });
        }
      }
    }
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    if (command === 'split-block') {
      this.onChange(ExtendedRichUtils.splitBlock(editorState));
      return true;
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    if (ALIGNMENTS.includes(blockType)) {
      this.onChange(ExtendedRichUtils.toggleAlignment(this.state.editorState, blockType));
    } else {
      this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
    }
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _insertSeparator() {
    const contentState = this.state.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('atomic', 'IMMUTABLE');
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    this.onChange(
      this.state.editorState = AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _insertMap() {
    const contentState = this.state.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('atomic', 'IMMUTABLE', {
      map: true,
      location: this.state.location,
      name: this.state.name,
      address: this.state.address
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    this.onChange(
      this.state.editorState = AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _insertImage(file) {
    const contentState = this.state.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('atomic', 'IMMUTABLE', { selfdefine: true, file, finished: false });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    this.onChange(
      this.state.editorState = AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _handleUploadImage() {
    this.insertImage();
  }

  _handleUploadSeparator() {
    this.insertSeparator();
  }

  _handleUploadMap() {
    this.setState({
      visible: true,
      location: [116.397428, 39.90923],
      name: '天安门',
      address: '北京市东城区中华路'
    });
    if (this.search) {
      this.search.value = '';
      this.search.placeholder = '搜索';
    }
  }

  createMoreImages(files) {
    for (let i = 0; i < files.length; i++) {
      this.insertImage(files[i]);
    }
  }

  editingImage(editingImage) {
    this.setState({ editingImage });
  }

  editingVideo(editingVideo) {
    this.setState({ editingVideo });
  }

  editingFooter(editingFooter) {
    this.setState({ editingFooter });
  }

  _showModal() {
    this.setState({
      visible: true,
    });
  }
  _handleOk() {
    this.insertMap();
    this.setState({
      visible: false,
    });
  }
  _handleCancel() {
    this.setState({
      visible: false,
    });
  }
  editingCaption(editingCaption) {
    this.setState(
      {
        editingCaption,
      }
    );
  }
  _handleLngLag = (location, name, address) => {
    this.setState({
      location,
      name,
      address,
    });
  }

  _handleMapState = () => {
    this.search.value = '';
    this.search.placeholder = '请输入有效关键字';
    this.setState({
      mapState: false,
    });
  }

  _handleMapStateShow = () => {
    this.setState({
      mapState: true,
    });
  }

  _handleNewOpen = () => {
    const getName = document.getElementsByClassName('poibox selected')[0].getElementsByTagName('h3')[0].getElementsByTagName('span')[0].innerText;
    const targetAddress = document.getElementsByClassName('poibox selected')[0].getElementsByClassName('poi-addr')[0].innerText;
    this.search.value = getName;
    this.setState({
      name: getName,
      targetAddress,
    });
  }

  _getValidPlugins = () => {
    const plugins = [];
    for (const plugin of DEFAULT_PLUGINS) {
      if (plugin.type === 'video') {
        if (this.props.editorConfigure.add_video) plugins.push(plugin);
      } else if (plugin.type === 'image') {
        if (this.props.editorConfigure.content_image_required) plugins.push(plugin);
      }
    }
    return plugins;
  }

  _insertVideo() {
    const contentState = this.state.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('atomic', 'IMMUTABLE', { video: true });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    this.onChange(
      this.state.editorState = AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _handleUploadVideo() {
    this.insertVideo();
  }

  insertPastedImage(contentStateForHTML, entityKey) {
    const entity = contentStateForHTML.getEntity(entityKey);
    const contentState = this.state.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('atomic', 'IMMUTABLE', {
      selfdefine: true,
      captionText: '',
      imageURL: entity.data.src,
      finished: true,
      needsUpload: true,
      token: this.props.token
    });
    const lastEntityKey = contentStateWithEntity.getLastCreatedEntityKey();
    this.onChange(AtomicBlockUtils.insertAtomicBlock(this.state.editorState, lastEntityKey, ' '));
  }

  insertPastedText(text) {
    const contentState = this.state.editorState.getCurrentContent();
    const selection = this.state.editorState.getSelection();
    const blockMap = ContentState.createFromText(text).getBlockMap();
    const newConState = Modifier.replaceWithFragment(contentState, selection, blockMap);
    const newEditorState = EditorState.push(this.state.editorState, newConState, 'insert-fragment');
    this.onChange(newEditorState);
    setTimeout(() => {
      this.onChange(ExtendedRichUtils.splitBlock(this.state.editorState));
    }, 0);
  }

  _handlePastedText(text, html) {
    const blocksFromHTML = convertFromHTML(html);
    const newContentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
    const blocksArray = newContentState.getBlocksAsArray();

    const timeIntervalI = 50;
    blocksArray.forEach((contentBlock, index) => {
      const entityKeyWithImage = contentBlock.getEntityAt(0);
      if (entityKeyWithImage !== null && newContentState.getEntity(entityKeyWithImage).getType() === 'IMAGE') {
        setTimeout(() => {
          this.insertPastedImage(newContentState, entityKeyWithImage);
        }, index * timeIntervalI);
      } else {
        setTimeout(() => {
          this.insertPastedText(contentBlock.text);
        }, index * timeIntervalI);
      }
    });
    return true;
  }


  render() {
    const { editorState, selectedBlock } = this.state;
    const plugins = this.plugins;
    let sideToolbarOffsetTop = 0;
    if (selectedBlock && !this.props.finished) {
      const editor = document.getElementById('richEditor');
      const editorBounds = editor.getBoundingClientRect();
      const blockBounds = selectedBlock.getBoundingClientRect();
      const selectedBlockHeight = blockBounds.bottom - blockBounds.top;
      const sideToobarHeight = 32;
      const offsetY = 2;
      sideToolbarOffsetTop = (blockBounds.bottom - editorBounds.top) - ((sideToobarHeight / 2) + (selectedBlockHeight / 2) + offsetY);
      if (sideToolbarOffsetTop < 0) sideToolbarOffsetTop = (selectedBlockHeight / 2) - (sideToobarHeight / 2) - offsetY;
    }
    const styles = require('./RichEditor.scss');
    require('./modalStyle.css');
    let content = null;
    let title = null;
    let buttonControl = (
      <div className={styles.buttonDiv}>
        <Button type="primary" size="large" onClick={this.handleCancel} className={styles.cancel}>取消</Button>
        <Button type="primary" size="large" onClick={this.handleOk} className={styles.complete}>完成</Button>
      </div>
    );
    if (this.search && !this.search.value) {
      buttonControl = (
        <div className={styles.buttonDiv}>
          <Button type="primary" size="large" onClick={this.handleCancel} className={styles.cancel}>取消</Button>
          <Button type="primary" size="large" onClick={this.handleOk} disabled="disabled" className={styles.complete}>完成</Button>
        </div>
      );
    }
    const search = (
      <div className={styles.mapHead}>
        <div className={styles.search}>
          <Icon width={24} height={24} type="search" />
        </div>
        <input id="search" ref={ref => { this.search = ref; }} placeholder="搜索" type="text" defaultValue="" className={styles.input} />
        {buttonControl}
      </div>
    );
    const panelStyle = this.state.mapState ? styles.show : styles.hidden;
    let finalTarget;
    if (this.search && this.search.value) finalTarget = this.search.value;
    const modelMap = (
      <div>
        <Modal
          visible={this.state.visible}
          title={search}
          onCancel={this.handleCancel}
        >
          { this.state.visible && <div>
            <AMap handleLngLag={this.handleLngLag} handleMapState={this.handleMapState} handleMapStateShow={this.handleMapStateShow} finalTarget={finalTarget} />
            <div className={styles.panelContainer}>
              <div id="panel" onClick={this.handleNewOpen} className={panelStyle} />
            </div>
          </div> }
        </Modal>
      </div>
    );
    if (this.state.client) {
      content = (
        <div className="editor" id="richEditor">
          {selectedBlock
            ?
              <SideBar
                plugins={plugins}
                editorState={editorState}
                // onToggle={this.toggleInlineStyle}
                onChange={this.onChange}
                // style={{ top: sideToolbarOffsetTop }}
                top={sideToolbarOffsetTop}
                onUploadImage={this.handleUploadImage}
                onUploadSeparator={this.handleUploadSeparator}
                onUploadMap={this.handleUploadMap}
                onUploadVideo={this.handleUploadVideo}
              />
        : null
        }
          <Editor
            id="editor"
            blockRendererFn={this.blockRenderer}
            blockStyleFn={this.blockStyler}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder="开始创作吧…"
            spellCheck
            handlePastedText={this.handlePastedText}
            readOnly={this.state.editingImage || this.state.editingCaption || this.state.editingVideo}
            ref={(ref) => { this.editor = ref; }}
          />
          {(this.props.editorConfigure.content_text_required || this.props.editorConfigure.text_alignment) &&
            <Toolbar
              editorState={editorState}
              editorConfigure={this.props.editorConfigure}
              onToggle={this.toggleBlockType}
              getSelectionCoords={getSelectionCoords}
              onRef={(toolBar) => { this.toolBar = toolBar; }}
            />
          }
          { modelMap }
        </div>
      );
      title = (
        <EditorTitle story={this.props.story} editorConfigure={this.props.editorConfigure} />
      );
    }

    const editor = (
      <div>
        <Grid>
          <Row>
            <Col xs={12} md={8} mdOffset={2} className={styles.base}>
              {this.props.story && <EditorCoverPage coverMedia={this.props.story.cover_image} /> }
              {(!this.props.story && this.props.editorConfigure.show_cover_editor) && <EditorCoverPage />}
              { title }
              { content }
            </Col>
          </Row>
        </Grid>
        { !this.state.editingFooter ? <EditorFooter postDraft={this.postDraft} /> : null }
      </div>
    );

    const finished = (
      <Grid>
        <Row>
          <Col xs={12} md={8} mdOffset={2} className={styles.base_finished}>
            <div>发布成功 !</div>
            <p>{this.state.counter + ' 秒后跳转...'}</p>
          </Col>
        </Row>
      </Grid>
    );

    const html = this.props.finished ? finished : editor;
    return (
      <FullScreen color="#F5F6F9" noNavigationBar={this.props.noNavigationBar}>
        {/* <div>
          <button onClick={this.logState}>logState</button>
          <button onClick={this.logElements}>logElements</button>
          <button onClick={this.logTest}>logTest</button>
          <button onClick={this.logSummary}>logSummary</button>
        </div> */}
        {html}
      </FullScreen>
    );
  }
}

export default RichEditor;
