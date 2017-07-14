/**
 * Created by Tian on 16/8/9.
 */
// export function fullImageURLForMediaModel(mediaModel) {
//   let fullURL;
//   switch (mediaModel.type) {
//     case 'multimedia': {
//       const [firstImage] = mediaModel.media.contents;
//       fullURL = 'http://o9vi0jo2t.bkt.clouddn.com/client_uploads/images/' + firstImage.media.name;
//       break;
//     }
//     case 'image': {
//       fullURL = 'http://o9vi0jo2t.bkt.clouddn.com/client_uploads/images/' + mediaModel.media.name;
//       break;
//     }
//     default:
//   }
//   return fullURL;
// }
//
// export function fullImageURLForImageKey(key) {
//   return 'http://o9vi0jo2t.bkt.clouddn.com/' + key;
// }
//
// export function fullVideoURLForVideoKey(key) {
//   return 'http://o9vi0jo2t.bkt.clouddn.com/' + key;
// }
//
// export function fullVideoURLForVideoModel(videoModel) {
//   if (videoModel !== null && videoModel !== undefined) {
//     return 'http://o9vi0jo2t.bkt.clouddn.com/client_uploads/videos/' + videoModel.name;
//   }
//   return null;
// }
//
// export function fullImageURLForImageModel(imageModel) {
//   if (imageModel !== null && imageModel !== undefined) {
//     if (typeof imageModel !== 'object') return imageModel;
//     return 'http://o9vi0jo2t.bkt.clouddn.com/client_uploads/images/' + imageModel.name;
//   }
//   return null;
// }
//
// export function fullURLForStory(storyModel) {
//   return '/story/' + storyModel.url;
// }
//
// export function fullURLForColumn(columnModel) {
//   return '/columns/' + columnModel.id;
// }
//
// export function getMaxIDForEvents(events) {
//   const lastEvent = events[events.length - 1];
//   return lastEvent.id;
// }
//
// export function getMaxStoryIDForStories(stories) {
//   if (stories.length > 0) {
//     const lastStory = stories[stories.length - 1];
//     return lastStory.id;
//   }
//   return undefined;
// }
