import {
  getVisibleSelectionRect } from 'draft-js';
export const getSelectionRange = () => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;
  return selection.getRangeAt(0);
};

export const getSelectedBlockElement = (range) => {
  let node = range.startContainer;
  do {
    const nodeIsDataBlock = node.getAttribute
                            ? node.getAttribute('data-block')
                            : null;
    if (nodeIsDataBlock) {
      let node2 = node;
      do {
        const dataBlockIsInTargetEditor = node2.getAttribute
                                ? node2.getAttribute('id') === 'richEditor'
                                : null;
        node2 = node2.parentNode;
        if (dataBlockIsInTargetEditor) {
          return node;
        }
      } while (node2 !== null);
    }
    node = node.parentNode;
  } while (node !== null);
  return null;
};

export const getSelectionCoords = () => {
  // const editorBounds = document.getElementById('richEditor').getBoundingClientRect();
  const editorBounds = document.getElementById('richEditor').getBoundingClientRect();
  const rangeBounds = getVisibleSelectionRect(window);
  if (!rangeBounds || (editorBounds.top > rangeBounds.top)) {
    return null;
  }
  const rangeWidth = rangeBounds.right - rangeBounds.left;
  // const rangeHeight = rangeBounds.bottom - rangeBounds.top;
  const offsetLeft = (rangeBounds.left - editorBounds.left)
            + (rangeWidth / 2) + (-25);
  const offsetTop = rangeBounds.top - editorBounds.top - 14 - (-330);
  const offsetBottom = (editorBounds.bottom - rangeBounds.top) + 44;

  return { offsetLeft, offsetTop, offsetBottom };
};
