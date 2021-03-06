import API from "./api/api.js";
import Provider from "./api/provider.js";
import Store from "./api/store.js";
import EventsListComponent from "./components/events-list.js";
import FilterController from "./controllers/filter.js";
import LoadingComponent from "./components/loading.js";
import PointsModel from "./models/points.js";
import PointModel from "./models/point.js";
import MenuComponent, {MenuItem} from "./components/menu.js";
import StatisticsComponent from "./components/statistics.js";
import TripController from "./controllers/trip.js";
import TripInfoController from "./controllers/trip-info.js";
import {remove, render, RenderPosition} from "./utils/render.js";


const AUTHORIZATION = `Basic [Xy~,MHMVf2auWFD9Jj`;
const END_POINT = `https://11.ecmascript.pages.academy/big-trip`;
const STORE_PREFIX = `bigtrip-localstorage`;
const STORE_VER = `v1`;
const STORE_NAME = `${STORE_PREFIX}-${STORE_VER}`;

const pageHeaderElement = document.querySelector(`.page-header`);
const pageMainElement = document.querySelector(`.page-main`);
const tripMainElement = pageHeaderElement.querySelector(`.trip-main`);
const menuTitleElement = pageHeaderElement.querySelector(`.trip-controls > h2:first-child`);
const filterTitleElement = pageHeaderElement.querySelector(`.trip-controls > h2:last-child`);
const newEventButton = pageHeaderElement.querySelector(`.trip-main__event-add-btn`);
const pageMainContainerElement = pageMainElement.querySelector(`.page-body__container`);

const menuComponent = new MenuComponent();

const api = new API(END_POINT, AUTHORIZATION);
const store = new Store(STORE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, store);
const pointsModel = new PointsModel();

const tripInfoController = new TripInfoController(tripMainElement, pointsModel);
const filtersController = new FilterController(filterTitleElement, pointsModel);
const eventsListComponent = new EventsListComponent();
const tripController = new TripController(eventsListComponent, pointsModel, apiWithProvider);
const statisticsComponent = new StatisticsComponent(pointsModel);
const loadingComponent = new LoadingComponent();

const onEscKeydown = (evt) => {
  const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

  if (isEscKey) {
    newEventButton.disabled = false;
    document.removeEventListener(`keydown`, onEscKeydown);
  }
};

const catcher = () => {
  remove(loadingComponent);
  pointsModel.setPoints();
  tripController.render();
};

render(menuTitleElement, menuComponent, RenderPosition.AFTER);

filtersController.render();
render(pageMainContainerElement, eventsListComponent, RenderPosition.BEFOREEND);
render(pageMainContainerElement, statisticsComponent, RenderPosition.BEFOREEND);

statisticsComponent.hide();

menuComponent.setOnClickHandler((menuItem) => {
  switch (menuItem) {
    case MenuItem.TABLE:
      tripController.resetSortType();
      menuComponent.setActiveItem(MenuItem.TABLE);
      statisticsComponent.hide();
      tripController.show();
      break;
    case MenuItem.STATS:
      newEventButton.disabled = false;
      tripController.resetCreatingPoint();
      tripController.resetSortType();
      menuComponent.setActiveItem(MenuItem.STATS);
      statisticsComponent.show();
      tripController.hide();
      break;
  }
});

newEventButton.addEventListener(`click`, () => {
  newEventButton.disabled = true;
  menuComponent.setActiveItem(MenuItem.TABLE);
  statisticsComponent.hide();
  tripController.show();
  document.addEventListener(`keydown`, onEscKeydown);

  pointsModel.setFilterResetHandler(filtersController.resetFilter);
  tripController.setCreatingSuccessHandler(() => {
    newEventButton.disabled = false;
  });

  tripController.setCancelButtonClickHandler(() => {
    newEventButton.disabled = false;
  });
  tripController.createPoint();
});

render(pageMainContainerElement, loadingComponent, RenderPosition.BEFOREEND);

let destinationsFromServer = null;
let offersFromServer = null;

apiWithProvider.getDesinations()
  .then((destinations) => {
    apiWithProvider.getOffers()
      .then((offers) => {
        destinationsFromServer = destinations;
        offersFromServer = offers;

        apiWithProvider.getPoints()
          .then((points) => {
            remove(loadingComponent);
            pointsModel.setPoints(points);
            tripController.render(destinations, offers);
            tripInfoController.render();
          });
      })
      .catch(() => {
        catcher();
      });
  })
  .catch(() => {
    catcher();
  });

window.addEventListener(`load`, () => {
  navigator.serviceWorker.register(`/sw.js`)
    .then(() => {
      // Действие, в случае успешной регистрации ServiceWorker
    }).catch(() => {
      // Действие, в случае ошибки при регистрации ServiceWorker
    });
});

window.addEventListener(`online`, () => {
  document.title = document.title.replace(` [offline]`, ``);

  apiWithProvider.sync()
    .then((points) => {
      pointsModel.setPoints(PointModel.parsePoints(points));
      tripController.render(destinationsFromServer, offersFromServer);
    });
});

window.addEventListener(`offline`, () => {
  document.title += ` [offline]`;
});
