import sinon from 'sinon';

import { expect } from 'chai';
import load from '../widget/load';


describe('widget load', () => {
  afterEach(() => {
    if ('restore' in Math.random) {
      Math.random.restore(); // reset the Math.random fixture
    }
  });

  describe('successful', () => {
    beforeEach(() => {
      sinon.stub(Math, 'random').returns(0.4);
    });

    it('uses the widgets from the session', () =>
      load({ session: { widgets: ['a', 'b', 'c'] } }).then(widgets => {
        expect(widgets.length).to.equal(3);
      })
    );

    it('initializes the widgets ', () => load({ session: {} }).then(widgets => {
      expect(widgets.length).to.equal(4);
      expect(widgets[0].color).to.equal('Red');
    })
    );
  });

  describe('unsuccessful', () => {
    beforeEach(() => {
      sinon.stub(Math, 'random').returns(0.2);
    });

    it('rejects the call', () => load({ session: {} }).then(
        () => {
        },
        (err) => {
          expect(err).to.equal('Widget load fails 33% of the time. You were unlucky.');
        })
    );
  });
});
