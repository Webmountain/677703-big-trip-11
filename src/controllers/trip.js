import DayComponent from "../components/day.js";
import EditPointComponent from "../components/edit-point.js";
import PointComponent from "../components/point.js";
import NoPointsComponent from "../components/no-points.js";
import {render, RenderPosition} from "../utils/render.js";
import SortComponent, {SortType} from "../components/sort.js";
import TripDaysComponent from "../components/trip-days.js";
import {isDatesEqual, getDuration} from "../utils/common.js";

const renderPoint = (dayEventsListElement, point, destinations) => {
  const pointComponent = new PointComponent(point);
  const editPointComponent = new EditPointComponent(point, destinations);

  const replacePointToEdit = () => {
    dayEventsListElement.replaceChild(editPointComponent.getElement(), pointComponent.getElement());
  };

  const replaceEditToPoint = () => {
    dayEventsListElement.replaceChild(pointComponent.getElement(), editPointComponent.getElement());
  };
  const onEscKeyDown = (evt) => {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      replaceEditToPoint();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };
  pointComponent.setRollupButtonClickHandler(() => {
    replacePointToEdit();
    document.addEventListener(`keydown`, onEscKeyDown);
  });
  editPointComponent.setSubmitHandler((evt) => {
    evt.preventDefault();
    replaceEditToPoint();
    document.removeEventListener(`keydown`, onEscKeyDown);
  });

  render(dayEventsListElement, pointComponent, RenderPosition.BEFOREEND);
};

const renderPoints = (container, points, destinations) => {
  let currentDay = null;
  let dayCounter = 0;
  let dayComponent = null;

  points.forEach((point) => {
    if (!currentDay || !isDatesEqual(currentDay, point.startDate)) {
      dayCounter++;
      currentDay = point.startDate;
      dayComponent = new DayComponent(currentDay, dayCounter);
      render(container, dayComponent, RenderPosition.BEFOREEND);
    }
    let dayEventsListElement = dayComponent.getElement().querySelector(`.trip-events__list`);
    renderPoint(dayEventsListElement, point, destinations);
  });
};
const getSortedPoints = (points, sortType) => {
  let sortedPoints = [];

  switch (sortType) {
    case SortType.TIME_DOWN:
      sortedPoints = points
        .slice()
        .sort((a, b) => {
          const durationA = getDuration(a.startDate, a.endDate);
          const durationB = getDuration(b.startDate, b.endDate);

          return durationB - durationA;
        });
      break;
    case SortType.PRICE_DOWN:
      sortedPoints = points
        .slice()
        .sort((a, b) => b.totalPointPrice - a.totalPointPrice);
    case SortType.DEFAULT:
      sortedPoints = points;
      break;
  }

  return sortedPoints;
};
export default class TripController {
  constructor(container) {
    this._container = container;

    this._sortComponent = new SortComponent();
    this._tripDaysComponent = new TripDaysComponent();
    this._noPointsComponent = new NoPointsComponent();
  }

  render(points, destinations) {
    const container = this._container.getElement();
    render(container, this._sortComponent, RenderPosition.BEFOREEND);

    if (points.length === 0) {
      render(container, this._noPointsComponent, RenderPosition.BEFOREEND);
      return;
    }

    render(container, this._tripDaysComponent, RenderPosition.BEFOREEND);

    // renderPoints(this._tripDaysComponent.getElement(), points, destinations);
    this._sortComponent.setSortTypeChangeHandler((sortType) => {
      // const sortedPoints = getSortedPoints(points, sortType);
      console.log(`You have clicked on sortElement`);
    });

  }
}