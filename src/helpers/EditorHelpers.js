// import superagent from 'superagent';
// import { fullImageURLForImageModel, fullVideoURLForVideoModel } from './URLHelpers';
import { ALIGNMENTS, existedBlockTypesForContent } from '../containers/BeeEditor/RichEditor/utils/ExtendedRichUtils';

var seenKeys = {};
var MULTIPLIER = Math.pow(2, 24);
function generateRandomKey() {
  var key;
  while (key === undefined || {}.hasOwnProperty.call(seenKeys, key) || !isNaN(+key)) {
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }
  seenKeys[key] = true;
  return key;
}

function convertContentBlockTypeToElementStyle(blockType) {
  let style = 'body';
  switch (blockType) {
    case 'header-one':
      style = 'header';
      break;
    case 'blockquote':
      style = 'quote';
      break;
    default:
      style = 'body';
  }
  return style;
}

// function sendNetImage(imageURL, userid) {
//   console.log(imageURL);
//   return new Promise((resolve, reject) => {
//     const url = 'http://localhost:3000/fetch';
//     const request = superagent.post(url);
//     request.set('imageurl', imageURL);
//     request.set('userid', userid);
//     request.end((error, res) => {
//       if (error) {
//         reject(error);
//       } else {
//         const imageInfo = JSON.parse(res.text);
//         const imageName = imageInfo.key.substring(22);
//         const imageElement = {
//           grid_size: '{2,2}',
//           layout_type: 'block',
//           content: {
//             type: 'image',
//             media: {
//               name: imageName,
//               original_size: '{2, 2}',
//             }
//           }
//         };
//         resolve(imageElement);
//       }
//     });
//   });
// }

export function convertCurrentContentToElementsArray(currentContent) {
  const blocks = currentContent.blocks;
  const entityMap = currentContent.entityMap;
  const elementArray = [];
  for (let i = 0; i < blocks.length; i++) {
    const tempBlock = blocks[i];
    if (existedBlockTypesForContent.includes(tempBlock.type) && tempBlock.text.length > 0) {
      let alignment = ALIGNMENTS[0];
      if (tempBlock.data.textAlignment) alignment = tempBlock.data.textAlignment;
      const style = convertContentBlockTypeToElementStyle(tempBlock.type);
      const textElement = {
        id: tempBlock.data.id,
        type: 'text',
        media: {
          alignment,
          style,
          plain_text: tempBlock.text,
        }
      };
      elementArray.push(textElement);
    } else if (tempBlock.type === 'atomic') {
      const entityRangesMagKey = tempBlock.entityRanges[0].key;
      const data = entityMap[entityRangesMagKey].data;
      if (data.selfdefine) {
        const imageElement = {
          id: data.id,
          type: 'image',
          media: {
            name: data.imageURL,
            original_size: data.original_size,
          }
        };
        // if (data.needsUpload) {
        //   imageElement = await (sendNetImage(data.imageURL, userid));
        // } else if (data.aid) {
        //   imageElement = {
        //     id: data.id,
        //     type: 'image',
        //     media: {
        //       name: data.name,
        //       original_size: data.original_size,
        //       aid: data.aid,
        //       url: data.imageURL,
        //     }
        //   };
        // } else {
        //   imageElement = {
        //     id: data.id,
        //     type: 'image',
        //     media: {
        //       name: data.imageURL,
        //       original_size: data.original_size,
        //     }
        //   };
        // }

        if (data.captionText && data.captionText.length > 0) imageElement.media.comment = data.captionText;
        elementArray.push(imageElement);
      } else if (data.map) {
        const location = '{' + data.location[1] + ',' + data.location[0] + '}';
        const mapElement = {
          id: data.id,
          type: 'location',
          media: {
            name: data.name,
            address: data.address,
            location
          }
        };
        elementArray.push(mapElement);
      } else if (data.video) {
        let videoElement;
        if (data.url) {
          videoElement = {
            id: data.id,
            type: 'video',
            media: {
              url: data.url,
              iframe_code: data.iframe_code,
            }
          };
        } else if (data.name) {
          videoElement = {
            id: data.id,
            type: 'video',
            media: {
              // name: data.name,
              name: data.videoURL,
              length: data.length,
            }
          };
        }
        elementArray.push(videoElement);
      } else {
        const separatorElement = {
          type: 'line',
          media: {
            style: 'normal'
          }
        };
        elementArray.push(separatorElement);
      }
    }
  }
  return elementArray;
}

export function hasTextElement(elements) {
  let hasText = false;
  elements.forEach(element => {
    if (element.type === 'text') hasText = true;
  });
  return hasText;
}

export function getImageCount(elements) {
  let count = 0;
  for (let i = 0; i < elements.length; i++) {
    if (elements[i] && elements[i].type === 'image' && elements[i].media.name) {
      count++;
    }
  }
  return count;
}

function strlen(str) {
  var value = str.replace(/(^\s*)|(\s*$)/g, '');
  var reg = new RegExp('((news|telnet|nttp|file|http|ftp|https)://){1}(([-A-Za-z0-9]+(\\.[-A-Za-z0-9]+)*(\\.[-A-Za-z]{2,5}))|([0-9]{1,3}(\\.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_\\$\\.\\+\\!\\*\\(\\),;:@&=\\?/~\\#\\%]*)*', 'gi');
  value = value.replace(reg, '**********************');
  return Math.ceil(value.replace(/[^\x00-\xff]/ig, '**').length / 2);
}

export function getSummary(elements) {
  let allText = '';
  let summary = '';
  for (let i = 0; i < elements.length; i++) {
    if (elements[i] && elements[i] && elements[i].media) {
      const plainText = elements[i].media.plain_text;
      if (elements[i].type === 'text' && allText !== '') {
        allText += '\n' + plainText;
      } else if (elements[i].type === 'text' && allText === '') {
        allText += plainText;
      }
    }
  }
  if (allText.length > 0) {
    const sentences = allText.split(/[.|。|!|？|?|\\n|\\Z]\s/gi);
    for (let i = 0; i < sentences.length; i++) {
      const tempSummary = summary + sentences[i];
      if (strlen(tempSummary) <= 140) {
        summary = tempSummary;
      } else {
        break;
      }
    }
  }
  return summary;
}

export function getMultiMediaForCoverMedia(elements) {
  const contents = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].type === 'image') {
      contents.push(elements[i]);
    }
  }
  const multiMedia = {
    type: 'multimedia',
    media: {
      contents
    }
  };
  return multiMedia;
}

function convertElementStyleToContentBlockType(style) {
  let type = 'unstyled';
  switch (style) {
    case 'header':
      type = 'header-one';
      break;
    case 'quote':
      type = 'blockquote';
      break;
    default:
      type = 'unstyled';
  }
  return type;
}

function convertTextElementToBlock(textElement) {
  const textAlignment = textElement.media.alignment;
  const type = convertElementStyleToContentBlockType(textElement.media.style);
  return {
    data: {
      id: textElement.id || undefined,
      textAlignment
    },
    depth: 0,
    entityRanges: [],
    inlineStyleRanges: [],
    key: generateRandomKey(),
    text: textElement.media.plain_text,
    type,
  };
}

function convertSeparatorElementToEntityMap(tempElement, mapKey) {
  // console.log(mapKey);
  const newEntityMapObject = {};
  newEntityMapObject[mapKey] = {
    data: { },
    mutability: 'IMMUTABLE',
    type: 'atomic',
  };
  return newEntityMapObject;
}

function convertSeparatorElementToBlock(tempElement, mapKey) {
  return {
    data: { },
    depth: 0,
    entityRanges: [
      {
        key: mapKey,
        length: 1,
        offset: 0,
      }
    ],
    inlineStyleRanges: [],
    key: generateRandomKey(),
    text: ' ',
    type: 'atomic',
  };
}

function convertImageElementToBlock(imageElement, mapKey) {
  return {
    data: {
      selfdefine: true,
    },
    depth: 0,
    entityRanges: [
      {
        key: mapKey,
        length: 1,
        offset: 0,
      }
    ],
    inlineStyleRanges: [],
    key: generateRandomKey(),
    text: ' ',
    type: 'atomic',
  };
}

function convertMapElementToBlock(mapeElement, mapKey) {
  return {
    data: {
      map: true,
    },
    depth: 0,
    entityRanges: [
      {
        key: mapKey,
        length: 1,
        offset: 0,
      }
    ],
    inlineStyleRanges: [],
    key: generateRandomKey(),
    text: ' ',
    type: 'atomic',
  };
}

function convertVideoElementToBlock(videoeElement, videoKey) {
  return {
    data: {
      video: true,
    },
    depth: 0,
    entityRanges: [
      {
        key: videoKey,
        length: 1,
        offset: 0,
      }
    ],
    inlineStyleRanges: [],
    key: generateRandomKey(),
    text: ' ',
    type: 'atomic',
  };
}

function convertImageElementToEntityMap(imageElement, mapKey) {
  const newEntityMapObject = {};
  newEntityMapObject[mapKey] = {
    data: {
      selfdefine: true,
      file: undefined,
      finished: true,
      // imageURL: fullImageURLForImageModel(imageElement.media),
      imageURL: imageElement.media.name,
      name: imageElement.media.name,
      id: imageElement.id || undefined,
      original_size: imageElement.media.original_size,
      captionText: imageElement.media.comment,
    },
    mutability: 'IMMUTABLE',
    type: 'atomic',
  };
  return newEntityMapObject;
}

function convertMapElementToEntityMap(mapElement, mapKey) {
  // console.log(mapElement);
  const finLocation = [mapElement.media.location.substring(1, (mapElement.media.location.length - 2)).split(',')[1], mapElement.content.media.location.substring(1, (mapElement.content.media.location.length - 2)).split(',')[0]];
  const newEntityMapObject = {};
  // const location = '{' + mapElement.content.media.location[1] + ',' + mapElement.content.media.location[0] + '}';
  newEntityMapObject[mapKey] = {
    data: {
      map: true,
      name: mapElement.media.name,
      id: mapElement.id || undefined,
      address: mapElement.media.address,
      location: finLocation,
    },
    mutability: 'IMMUTABLE',
    type: 'atomic',
  };
  return newEntityMapObject;
}

function convertVideoElementToEntityMap(videoElement, videoKey) {
  const newEntityMapObject = {};
  if (videoElement.media.iframe_code) {
    newEntityMapObject[videoKey] = {
      data: {
        video: true,
        url: videoElement.media.url,
        id: videoElement.id || undefined,
        iframe_code: videoElement.media.iframe_code,
        finished: true,
        // address: mapElement.content.media.address,
        // location: finLocation,
      },
      mutability: 'IMMUTABLE',
      type: 'atomic',
    };
  } else {
    newEntityMapObject[videoKey] = {
      data: {
        video: true,
        name: videoElement.media.name,
        // videoURL: fullVideoURLForVideoModel(videoElement.media),
        finished: true,
        // address: mapElement.content.media.address,
        // location: finLocation,
      },
      mutability: 'IMMUTABLE',
      type: 'atomic',
    };
  }

  return newEntityMapObject;
}

function newEmptyTextElement() {
  const textElement = {
    type: 'text',
    media: {
      alignment: 'left',
      style: 'body',
      plain_text: '',
    }
  };
  return textElement;
}

export function convertElementsArrayToRawDraftContent(elementArray) {
  // 保证非文字元素之间有text元素
  const elementArrayForEditor = [];
  if (elementArray instanceof Array && elementArray.length > 0) {
    Array.prototype.forEach.call(elementArray, (item, index, elements) => {
      if ((index === 0 && item.type !== 'text') ||
          (item.type !== 'text' && elements[index - 1].type !== 'text')) {
        elementArrayForEditor.push(newEmptyTextElement());
      }
      elementArrayForEditor.push(item);
      if ((index === (elements.length - 1) && item.type !== 'text')) {
        elementArrayForEditor.push(newEmptyTextElement());
      }
    });
  }

  const blocks = [];
  const entityMap = {};
  for (let i = 0; i < elementArrayForEditor.length; i++) {
    const tempElement = elementArrayForEditor[i];
    const elementType = tempElement.type;
    if (elementType === 'text') {
      blocks.push(convertTextElementToBlock(tempElement));
    } else if (elementType === 'image') {
      const maxKey = Object.keys(entityMap).length;
      blocks.push(convertImageElementToBlock(tempElement, maxKey));
      const newEntityMapObject = convertImageElementToEntityMap(tempElement, maxKey);
      Object.assign(entityMap, newEntityMapObject);
    } else if (elementType === 'line') {
      const maxKey = Object.keys(entityMap).length;
      blocks.push(convertTextElementToBlock(newEmptyTextElement()));
      blocks.push(convertSeparatorElementToBlock(tempElement, maxKey));
      const newEntityMapObject = convertSeparatorElementToEntityMap(tempElement, maxKey);
      Object.assign(entityMap, newEntityMapObject);
    } else if (elementType === 'location') {
      const maxKey = Object.keys(entityMap).length;
      blocks.push(convertMapElementToBlock(tempElement, maxKey));
      const newEntityMapObject = convertMapElementToEntityMap(tempElement, maxKey);
      Object.assign(entityMap, newEntityMapObject);
    } else if (elementType === 'video') {
      const maxKey = Object.keys(entityMap).length;
      blocks.push(convertVideoElementToBlock(tempElement, maxKey));
      const newEntityMapObject = convertVideoElementToEntityMap(tempElement, maxKey);
      Object.assign(entityMap, newEntityMapObject);
    }
  }
  return {
    blocks,
    entityMap,
  };
}

export function convertTitleToRawDraftContent(title) {
  const blocks = [];
  const entityMap = {};
  const titleBlock = {
    data: {},
    depth: 0,
    entityRanges: [],
    inlineStyleRanges: [],
    key: generateRandomKey(),
    text: title,
    type: 'unstyled',
  };
  blocks.push(titleBlock);
  return {
    blocks,
    entityMap,
  };
}

export function convertElementTypeToNumber(elements) {
  let mappedElements;
  if (Array.isArray(elements)) {
    mappedElements = elements.map(element => {
      if (element.type === 'text') {
        element.type = 10;
      } else if (element.type === 'image') {
        element.type = 20;
      } else if (element.type === 'video') {
        element.type = 30;
      } else if (element.type === 'location') {
        element.type = 40;
      }
      return element;
    });
  }
  return mappedElements;
}

export function convertElementNumberToType(elements) {
  let mappedElements;
  if (Array.isArray(elements)) {
    mappedElements = elements.map(element => {
      if (element.type === 10) {
        element.type = 'text';
      } else if (element.type === 20) {
        element.type = 'image';
      } else if (element.type === 30) {
        element.type = 'video';
      } else if (element.type === 40) {
        element.type = 'location';
      }
      return element;
    });
  }
  return mappedElements;
}

// export function convertCoverMediaImageTypeToNumber(coverMedia) {
//   if (coverMedia.type === 'image') coverMedia.type = 20;
//   return coverMedia;
// }
//
// export function convertCoverMediaImageNumberToType(coverMedia) {
//   if (coverMedia.type === 20) coverMedia.type = 'image';
//   return coverMedia;
// }
