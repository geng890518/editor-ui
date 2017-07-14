import { fetchImage } from './Helpers';
const fetch = () => (req, res, next) => {
  fetchImage(req.headers.imageurl, req.headers.userid, (error, result) => {
    if (error) {
      next();
    } else {
      res.send(result);
    }
  });
};

export default fetch;
