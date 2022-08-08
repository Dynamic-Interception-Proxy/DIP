import load from './meta/load';
import type MetaURL from './meta/type';

const DynamicMeta: MetaURL = class DynamicMeta {
  load = load;

  constructor(ctx) {
    this.ctx = ctx;
  }
}

export default DynamicMeta;