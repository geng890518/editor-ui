import { message } from 'antd';
import cookie from 'react-cookie';
import { convertElementNumberToType } from '../../helpers/EditorHelpers';
// import superagent from 'superagent';
const HANDLE_MOUSE_DOWN = 'redux-example/editor/HANDLE_MOUSE_DOWN';
const HANDLE_MOUSE_MOVE = 'redux-example/editor/HANDLE_MOUSE_MOVE';
const HANDLE_MOUSE_UP = 'redux-example/editor/HANDLE_MOUSE_UP';

const EDITOR_CONFIGURE = 'redux-example/editor/EDITOR_CONFIGURE';
const SET_RETURNURL = 'redux-example/editor/SET_RETURNURL';
const SET_CHANNEL = 'redux-example/editor/SET_CHANNEL';
const SET_COLLECTIONS = 'redux-example/editor/SET_COLLECTIONS';
const SET_TOKEN = 'redux-example/editor/SET_TOKEN';
const SET_TITLE = 'redux-example/editor/SET_TITLE';
const SET_COVER_MEDIA = 'redux-example/editor/SET_COVER_MEDIA';
const REMOVE_COVER_MEDIA = 'redux-example/editor/REMOVE_COVER_MEDIA';
const POST_DRAFT = 'redux-example/editor/POST_DRAFT';
const POST_DRAFT_SUCCESS = 'redux-example/editor/POST_DRAFT_SUCCESS';
const POST_DRAFT_FAIL = 'redux-example/editor/POST_DRAFT_FAIL';
const SET_ELEMENTS = 'redux-example/editor/SET_ELEMENTS';
const REBUILD_EDITOR = 'redux-example/editor/REBUILD_EDITOR';
const LOAD_STORY_FOR_EDITOR = 'redux-example/editor/LOAD_STORY_FOR_EDITOR';
const LOAD_STORY_FOR_EDITOR_SUCCESS = 'redux-example/editor/LOAD_STORY_FOR_EDITOR_SUCCESS';
const LOAD_STORY_FOR_EDITOR_FAIL = 'redux-example/editor/LOAD_STORY_FOR_EDITOR_FAIL';
const GETCOLLECTIONS = 'redux-example/editor/GETCOLLECTIONS';
const GETCOLLECTIONS_SUCCESS = 'redux-example/editor/GETCOLLECTIONS_SUCCESS';
const GETCOLLECTIONS_FAIL = 'redux-example/editor/GETCOLLECTIONS_FAIL';
const ADDTAG = 'redux-example/editor/ADDTAG';
const DELTAG = 'redux-example/editor/DELTAG';

const reinsert = (arr, from, to) => {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
};

export function generateAuthHeaderForUser(user) {
  const auth = [
    {
      key: 'X-Tella-Request-AppVersion',
      value: '1.0.0',
    },
    {
      key: 'X-Tella-Request-Provider',
      value: 'web',
    },
    {
      key: 'X-Tella-Request-Token',
      value: user.access_token,
    },
    {
      key: 'X-Tella-Request-Userid',
      value: user.userid,
    },
    {
      key: 'X-Tella-Request-Device',
      value: 10,
    }
  ];
  return auth;
}

const startPointForElement = (element, i, order, elements) => {
  let startY = 0;
  for (let a = 0; a < order.indexOf(i); a++) {
    const tempElement = elements[order[a]];
    startY += tempElement.height;
  }
  return startY;
};

const updateElementLayoutInfoForNewOrder = (elements, newOrder) => {
  for (let i = 0; i < elements.length; i++) {
    const tempElement = elements[i];
    const startY = startPointForElement(tempElement, i, newOrder, elements);
    const endY = startY + tempElement.height;
    tempElement.layout = {
      startY,
      endY,
      center: (startY + endY) / 2,
    };
  }
  return elements;
};

const findRowForSwitch = (elements, lastPressed, order, mouse) => {
  const lastPressedElement = elements[lastPressed];
  const startY_Pressed = mouse;
  const endY_Pressed = startY_Pressed + lastPressedElement.height;

  let targetRow = order.indexOf(lastPressed);

  const upperIndex = ((order.indexOf(lastPressed) - 1) >= 0) ? (order.indexOf(lastPressed) - 1) : null;
  const lowerIndex = ((order.indexOf(lastPressed) + 1) < order.length) ? (order.indexOf(lastPressed) + 1) : null;

  let upperElement = null;
  let lowerElement = null;
  if (upperIndex !== null) {
    upperElement = elements[order[upperIndex]];
    if (startY_Pressed < upperElement.layout.center) {
      targetRow = upperIndex;
    }
  }
  if (lowerIndex !== null) {
    lowerElement = elements[order[lowerIndex]];
    if (endY_Pressed > lowerElement.layout.center) {
      targetRow = lowerIndex;
    }
  }
  return targetRow;
};

/**
 *  initialState
 */
const initialState = {
  editorConfigure: {
    cover_required: true,
    title_required: true,
    content_image_required: true,
    content_text_required: true,
    text_alignment: true,
    text_style: true,
    add_video: true,
    show_author: true,
    show_cover_editor: true,
    show_title: true,
    content_required: true
  },
  channel: null,
  token: null,
  collections: [],
  allCollections: [],
  title: null,
  cover_media: null,
  elements: [
    {
      content: '元素A',
      height: 100,
    },
    {
      content: '元素B',
      height: 200
    },
    {
      content: '元素C',
      height: 300
    },
    {
      content: '元素D',
      height: 400
    }
  ],
  summary: null,
  imageCount: 0,

  posting: false,
  finished: false,
  postingError: null,

  loadingStory: false,
  story: null,
  loadingStoryError: null,
  storyLoaded: false,


  delta: 0,
  mouse: 0,
  isPressed: false,
  lastPressed: 0,
  order: [1, 2, 3, 0],
  itemsCount: 4,
};

/**
 *  reducer
 */

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case HANDLE_MOUSE_DOWN: {
      const pageY = action.pageY;
      const pressY = action.pressY;
      const pos = action.pos;
      const elements = updateElementLayoutInfoForNewOrder(state.elements, state.order);
      return {
        ...state,
        delta: pageY - pressY,
        mouse: pressY,
        isPressed: true,
        lastPressed: pos,
        elements,
      };
    }
    case HANDLE_MOUSE_MOVE: {
      const pageY = action.pageY;
      const isPressed = state.isPressed;
      const delta = state.delta;
      const order = state.order;
      const lastPressed = state.lastPressed;
      let elements = state.elements;
      if (isPressed) {
        const mouse = pageY - delta;
        const row = findRowForSwitch(elements, lastPressed, order, mouse);
        const newOrder = reinsert(order, order.indexOf(lastPressed), row);

        elements = updateElementLayoutInfoForNewOrder(elements, newOrder);
        return {
          ...state,
          mouse,
          elements,
          order: newOrder,
          row
        };
      }
      return {
        ...state,
      };
    }
    case HANDLE_MOUSE_UP: {
      return {
        ...state,
        isPressed: false,
        delta: 0,
      };
    }
    case EDITOR_CONFIGURE:
      return {
        ...state,
        editorConfigure: action.editorConfigures
      };
    case SET_RETURNURL:
      return {
        ...state,
        returnUrl: action.returnUrl
      };
    case SET_CHANNEL:
      return {
        ...state,
        channel: action.channel
      };
    case SET_COLLECTIONS:
      return {
        ...state,
        collections: action.collections
      };
    case SET_TOKEN:
      return {
        ...state,
        token: action.token
      };
    case SET_TITLE:
      return {
        ...state,
        title: action.title,
      };
    case SET_COVER_MEDIA: {
      // const coverMedia = {
      //   type: 'image',
      //   media: action.coverImage,
      // };
      return {
        ...state,
        cover_media: action.coverImage,
      };
    }
    case REMOVE_COVER_MEDIA:
      return {
        ...state,
        cover_media: null
      };
    case SET_ELEMENTS:
      return {
        ...state,
        elements: action.elements,
      };
    case POST_DRAFT:
      return {
        ...state,
        posting: true,
        finished: false,
      };
    case POST_DRAFT_SUCCESS:
      return {
        ...state,
        posting: false,
        finished: true,
        postDraftSucessData: action.result
      };
    case POST_DRAFT_FAIL:
      message.error('请检查网络，稍后重试', 2);
      return {
        ...state,
        posting: false,
        finished: false,
        postingError: action.error,
      };
    case REBUILD_EDITOR:
      return {
        ...state,
        posting: false,
        finished: false,
        story: null,
        title: null,
        cover_media: null,
        elements: [],
        summary: null,
        imageCount: 0,
      };
    case LOAD_STORY_FOR_EDITOR:
      return {
        ...state,
        loadingStory: true,
        loadingStoryError: null,
        storyLoaded: false,
      };
    case LOAD_STORY_FOR_EDITOR_SUCCESS: {
      if (Object.hasOwnProperty.call(action.result.data, 'author') && Object.keys(action.result.data).length <= 1) {
        return {
          ...state,
          user: action.result.data.author
        };
      }
      return {
        ...state,
        loadingStory: false,
        loadingStoryError: null,
        storyLoaded: true,
        story: action.result.data,
        title: action.result.data.title,
        collections: action.result.data.collections,
        cover_media: action.result.data.cover_image,
        elements: convertElementNumberToType(action.result.data.elements),
        user: action.result.data.author
      };
    }
    case LOAD_STORY_FOR_EDITOR_FAIL:
      return {
        ...state,
        loadingStory: false,
        loadingStoryError: action.error,
        storyLoaded: false,
      };
    case GETCOLLECTIONS:
      return {
        ...state,
        posted: false,
      };
    case GETCOLLECTIONS_SUCCESS:
      return {
        ...state,
        posting: false,
        posted: true,
        allCollections: action.result
      };
    case GETCOLLECTIONS_FAIL:
      return {
        ...state,
        posting: false,
        posted: false,
        postingError: action.error,
      };
    case ADDTAG:
      return {
        ...state,
        collections: [...state.collections, action.elements],
      };
    case DELTAG: {
      const newArray = [];
      state.collections.map((collection) => {
        if (collection.id !== action.Info.id) {
          newArray.push(collection);
        }
        return null;
      });
      return {
        ...state,
        collections: newArray,
      };
    }
    default:
      return state;
  }
}

/**
 *  Mouse events
 */
export function handleMouseDown(pos, pressY, { pageY }) {
  return {
    type: HANDLE_MOUSE_DOWN,
    pos,
    pressY,
    pageY
  };
}

export function handleMouseMove({ pageY }) {
  return {
    type: HANDLE_MOUSE_MOVE,
    pageY,
  };
}

export function handleMouseUp() {
  return {
    type: HANDLE_MOUSE_UP,
  };
}

/**
 *  editor configure
 */
export function editorConfig(config) {
  const editorConfigs = String.prototype.split.call(config, '_');
  const editorConfigures = {
    cover_required: editorConfigs[0] === '1',
    title_required: editorConfigs[1] === '1',
    content_image_required: editorConfigs[2] === '1',
    content_text_required: editorConfigs[3] === '1',
    text_alignment: editorConfigs[4] === '1',
    text_style: editorConfigs[5] === '1',
    add_video: editorConfigs[6] === '1',
    show_author: editorConfigs[7] === '1',
    show_cover_editor: editorConfigs[8] === '1',
    show_title: editorConfigs[9] === '1',
    content_required: editorConfigs[10] === '1'
  };
  return {
    type: EDITOR_CONFIGURE,
    editorConfigures
  };
}

export function setReturnUrl(returnUrl) {
  return {
    type: SET_RETURNURL,
    returnUrl
  };
}

/**
 *  channel
 */
export function setChannel(channel) {
  return {
    type: SET_CHANNEL,
    channel
  };
}

/**
 *  user token
 */
export function setUserToken(token) {
  return {
    type: SET_TOKEN,
    token
  };
}

/**
 *  set content collections
 */
export function setCollections(collections) {
  return {
    type: SET_COLLECTIONS,
    collections
  };
}

/**
 *  story title
 */
export function setTitle(title) {
  return {
    type: SET_TITLE,
    title,
  };
}

/**
 *  set cover image
 */
export function setCoverImageSuccess(coverImage) {
  return {
    type: SET_COVER_MEDIA,
    coverImage,
  };
}

/**
 *  delete cover image
 */
export function delCoverImage() {
  return {
    type: REMOVE_COVER_MEDIA,
  };
}

/**
 *  set story elements
 */
export function setElements(elements) {
  return {
    type: SET_ELEMENTS,
    elements,
  };
}

export function addTag(elements) {
  console.log(elements);
  return {
    type: ADDTAG,
    elements,
  };
}
export function delTag(Info) {
  return {
    type: DELTAG,
    Info,
  };
}
/**
 *  post story
 */
export function postDraft(draft) {
  const auth = cookie.load('loginResult');
  const authHeaders = generateAuthHeaderForUser(auth);
  return {
    types: [POST_DRAFT, POST_DRAFT_SUCCESS, POST_DRAFT_FAIL],
    promise: (client) => client.post('stories', {
      data: draft,
      authHeaders
    })
  };
}

/**
 *  story update
 */
export function updateStory(draft) {
  return {
    types: [POST_DRAFT, POST_DRAFT_SUCCESS, POST_DRAFT_FAIL],
    promise: (client) => client.post('/content/save', {
      data: draft
    })
  };
}

export function rebuildEditor() {
  return {
    type: REBUILD_EDITOR,
  };
}

export function isStoryLoaded(globalState) {
  return globalState.editor && globalState.storyLoaded;
}

export function loadStoryForEditor(params) {
  return {
    types: [LOAD_STORY_FOR_EDITOR, LOAD_STORY_FOR_EDITOR_SUCCESS, LOAD_STORY_FOR_EDITOR_FAIL],
    promise: (client) => client.get('/content/init', { params })
  };
}


export function getCollections() {
  return {
    types: [GETCOLLECTIONS, GETCOLLECTIONS_SUCCESS, GETCOLLECTIONS_FAIL],
    promise: (client) => client.get('collections/all')
  };
}
