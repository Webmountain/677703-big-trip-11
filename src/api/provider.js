import Point from "../models/point.js";
// import Destination from "../models/destination.js";
// import Offer from "../models/offer.js";

import {nanoid} from "nanoid";

const isOnline = () => {
  return window.navigator.onLine;
};

const getSyncedPoints = (items) => {
  return items.filter(({success}) => success)
    .map(({payload}) => payload.point);
};

const createStoreStructure = (items) => {
  return items.reduce((acc, current) => {
    return Object.assign({}, acc, {
      [current.id]: current,
    });
  }, {});
};

export default class Provider {
  constructor(api, store) {
    this._api = api;
    this._store = store;
  }

  getPoints() {
    if (isOnline()) {
      return this._api.getPoints()
      .then((points) => {
        const items = createStoreStructure(points.map((point) => point.toRAW()));
        this._store.setItems(items);
        return points;
      });
    }

    const storePoints = Object.values(this._store.getItems());

    return Promise.resolve(Point.parsePoints(storePoints));
  }

  getDesinations() {
    if (isOnline()) {
      return this._api.getDesinations();
    }

    return Promise.reject(`offline logic is not implemented`);
  }

  getOffers() {
    if (isOnline()) {
      return this._api.getOffers();
    }

    return Promise.reject(`offline logic is not implemented`);
  }

  createPoint(point) {
    if (isOnline()) {
      return this._api.createPoint(point)
        .then((newPoint) => {
          this._store.setItem(newPoint.id, newPoint.toRAW());

          return newPoint;
        });
    }

    const localNewPointId = nanoid();
    const localNewPoint = Point.clone(Object.assign(point, {id: localNewPointId}));

    this._store.setItem(localNewPoint.id, localNewPoint.toRAW());

    return Promise.resolve(localNewPoint);
  }

  updatePoint(id, point) {
    if (isOnline()) {
      return this._api.updatePoint(id, point)
        .then((newPoint) => {
          this._store.setItem(newPoint.id, newPoint.toRAW());

          return newPoint;
        });
    }

    const localPoint = Point.clone(Object.assign(point, {id}));
    this._store.setItem(id, localPoint.toRAW());

    return Promise.resolve(localPoint);
  }

  deletePoint(id) {
    if (isOnline()) {
      return this._api.deletePoint(id)
        .then(() => this._store.removeItem(id));
    }

    this._store.removeItem(id);

    return Promise.resolve();
  }

  sync() {
    if (isOnline()) {
      const storePoints = Object.values(this._store.getItems());

      return this._api.sync(storePoints)
        .then((response) => {

          // const createdPoints = getSyncedPoints(response.created);
          const createdPoints = response.created;

          const updatedPoints = getSyncedPoints(response.updated);

          const items = createStoreStructure([...createdPoints, ...updatedPoints]);

          this._store.setItems(items);
        });
    }

    return Promise.reject(new Error(`Sync data failed`));
  }
}
