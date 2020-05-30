import Point from "../models/point.js";
import Destination from "../models/destination.js";
import Offer from "../models/offer.js";

const isOnline = () => {
  return window.navigator.onLine;
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
        points.forEach((point) => this._store.setItem(point.id, point.toRAW()));

        return points;
      });
    }

    const storePoints = Object.values(this._store.getItems());

    return Promise.resolve(Promise.parsePoints(storePoints));
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
      return this._api.createPoint(point);
    }

    return Promise.reject(`offline logic is not implemented`);
  }

  updatePoint(id, point) {
    if (isOnline()) {
      return this._api.updatePoint(id, point);
    }

    return Promise.reject(`offline logic is not implemented`);
  }

  deletePoint(id) {
    if (isOnline()) {
      return this._api.deletePoint(id);
    }

    return Promise.reject(`offline logic is not implemented`);
  }
}
