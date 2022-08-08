import TwTh from './23.js/index.ts';

export default class JSRewriter {
  constructor(ctx) {
    this.TwentyThree = new TwTh(ctx);
  }

  get rewriteJS() {
    return this.TwentyThree.rewriteJS;
  }
};