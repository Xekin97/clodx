import {
  CLOD_KEY_PREFIX,
  CLOD_TYPE,
  ERROR_PREFIX,
  __DEV__,
} from "../constants";
import type {
  AnyClod,
  AnyClodState,
  AsyncFunction,
  ClodGetter,
  ClodSetter,
  Maker,
  MaybePromise,
  StateValueTypeForGet,
  StateValueTypeForSet,
  Update,
} from "../types";
import { unionId } from "../utils";
import clodUpdator from "./clod-updator";

const genId = unionId();

const genClodKey = () => CLOD_KEY_PREFIX + genId();

export class Clod<T extends AnyClodState> {
  key: string;
  value?: StateValueTypeForGet<T>;
  meta: T;
  depUpdateSet: Set<Update> = new Set();
  depClodSet: Set<AnyClod> = new Set();
  onUpdateCallbacks: (() => void)[] = [];

  constructor(state: T) {
    this.key = genClodKey();
    this.meta = state;

    if (state.type === CLOD_TYPE.STATE) {
      this.value = state.value;
    }
  }

  get: ClodGetter = function (this: AnyClod, clod) {
    if ((clod as any).meta.type === CLOD_TYPE.SETTER) {
      if (__DEV__) {
        throw new Error(ERROR_PREFIX + "Can not get value from a makeClod.");
      } else {
        return;
      }
    }
    clod.depClod(this);
    if (clod.meta.type === CLOD_TYPE.GETTER) {
      return clod.pick();
    }
    return clod.value;
  };

  set: ClodSetter = function (clod, value) {
    if ((clod as any).meta.type === CLOD_TYPE.GETTER) {
      if (__DEV__) {
        throw new Error(ERROR_PREFIX + "Can not set value to a pickClod.");
      } else {
        return;
      }
    }

    return clod.make(value);
  };

  pick(): StateValueTypeForGet<T> {
    if (this.meta.type === CLOD_TYPE.GETTER) {
      // pickClod((get) => set(dfsdf, 123))
      // asyncPickClod(async (get) => await set(dfsdf, 123))
      const pick = this.meta.value;

      const result = pick(this.get.bind(this));

      if (result instanceof Promise) {
        result.then((v) => {
          this.updateValue(v);
        });
      } else {
        this.updateValue(result);
      }

      return result;
    }

    return this.value!;
  }

  make(
    value: StateValueTypeForSet<T>
  ): T extends Maker<AsyncFunction> ? Promise<void> : void;
  make(value: StateValueTypeForSet<T>): MaybePromise<void> {
    if ((this as any).meta.type === CLOD_TYPE.GETTER) {
      if (__DEV__) {
        throw new Error(ERROR_PREFIX + "Can not set value to a pickClod.");
      } else {
        return;
      }
    }
    if (this.meta.type === CLOD_TYPE.SETTER) {
      const maker = this.meta.value;
      return maker(value, this.get.bind(this), this.set.bind(this));
    } else {
      this.updateValue(value);
      return;
    }
  }

  onUpdate(callback: () => void) {
    this.onUpdateCallbacks.push(callback);
  }

  callbackUpdates() {
    this.onUpdateCallbacks.forEach((cb) => cb.call(this));
  }

  updateValue(value: StateValueTypeForGet<T>) {
    if (this.meta.type !== CLOD_TYPE.SETTER) {
      const equal = this.meta.equal ?? Object.is;
      const _value = this.value;
      this.value = value;
      if (!equal(_value, value)) {
        this.update();
      }
    } else {
      if (__DEV__) {
        throw new Error(ERROR_PREFIX + "a makeClod has no value for update.");
      }
    }
  }

  update() {
    clodUpdator.update(this as AnyClod);
  }

  depClod(this: AnyClod, clod: AnyClod) {
    this.depClodSet.add(clod);
  }

  unDepClod(clod: AnyClod) {
    clod.depClodSet.delete(clod);
  }

  depUpdate(update: Update) {
    this.depUpdateSet.add(update);
  }

  unDepUpdate(update: Update) {
    this.depUpdateSet.delete(update);
  }

  callDepUpdates() {
    this.depUpdateSet.forEach((update) => update());
  }

  dispose() {
    this.value = undefined;
    this.onUpdateCallbacks.length = 0;
    this.depClodSet.clear();
    this.depUpdateSet.clear();
  }

  static clone<T extends AnyClod>(clod: T) {
    return new Clod(clod.meta) as T;
  }
}
