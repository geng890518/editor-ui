import timekeeper from 'timekeeper';
import { expect } from 'chai';
import loadInfo from '../loadInfo';

describe('loadInfo', () => {
  it('loads the current date', () => {
    const now = Date.now();
    timekeeper.freeze(now);

    return loadInfo().then(data => {
      expect(data).to.deep.equal({ time: now, message: 'This came from the api server' });
    });
  });
});
