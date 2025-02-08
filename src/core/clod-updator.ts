import { CLOD_TYPE } from "../constants";
import { AnyClod } from "../types";

class ClodUpdator {
  updating = false;
  cache = new Set<AnyClod>();

  update(clod: AnyClod) {
    if (this.updating) {
      clod.depClodSet.forEach((clod) => {
        this.cache.add(clod);
        this.update(clod);
      });
      return;
    }

    this.cache.add(clod);
    this.updating = true;
    clod.depClodSet.forEach((clod) => {
      this.cache.add(clod);
      this.update(clod);
    });

    this.cache.forEach((clod) => {
      clod.callDepUpdates();
      if (clod.meta.type === CLOD_TYPE.GETTER) {
        clod.pick();
      } else {
        this.update(clod);
      }
    });

    this.updating = false;
    this.cache.clear();
  }
}

export default new ClodUpdator();
