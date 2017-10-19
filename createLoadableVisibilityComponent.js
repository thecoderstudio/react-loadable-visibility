'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _capacities = require('./capacities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var intersectionObserver = void 0;
var trackedElements = new Map();

if (_capacities.IntersectionObserver) {
  intersectionObserver = new window.IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      var trackedElement = trackedElements.get(entry.target);

      if (trackedElement && entry.intersectionRatio > 0) {
        trackedElement.visibilityHandler();
      }
    });
  });
}

function createLoadableVisibilityComponent(args, _ref) {
  var Loadable = _ref.Loadable,
      preloadFunc = _ref.preloadFunc,
      LoadingComponent = _ref.LoadingComponent;

  var preloaded = false;
  var visibilityHandlers = [];

  var LoadableComponent = Loadable.apply(undefined, args);

  return function (_Component) {
    _inherits(LoadableVisibilityComponent, _Component);

    LoadableVisibilityComponent[preloadFunc] = function () {
      if (!preloaded) {
        preloaded = true;
        visibilityHandlers.forEach(function (handler) {
          return handler();
        });
      }

      LoadableComponent[preloadFunc]();
    };

    function LoadableVisibilityComponent(props) {
      _classCallCheck(this, LoadableVisibilityComponent);

      var _this = _possibleConstructorReturn(this, _Component.call(this, props));

      _this.attachRef = function (element) {
        if (_this.loadingRef && trackedElements.get(_this.loadingRef)) {
          intersectionObserver.unobserve(_this.loadingRef);
          trackedElements.delete(_this.loadingRef);
        }

        _this.loadingRef = element;

        if (element) {
          trackedElements.set(element, _this);
          intersectionObserver.observe(element);
        }
      };

      _this.visibilityHandler = function () {
        if (_this.loadingRef) {
          intersectionObserver.unobserve(_this.loadingRef);
          trackedElements.delete(_this.loadingRef);
        }

        _this.setState({
          visible: true
        });
      };

      if (!preloaded) {
        visibilityHandlers.push(_this.visibilityHandler);
      }

      _this.state = {
        visible: preloaded
      };
      return _this;
    }

    LoadableVisibilityComponent.prototype.componentWillUnmount = function componentWillUnmount() {
      if (this.loadingRef) {
        intersectionObserver.unobserve(this.loadingRef);
        trackedElements.delete(this.loadingRef);
      }

      var handlerIndex = visibilityHandlers.indexOf(this.visibilityHandler);

      if (handlerIndex >= 0) {
        visibilityHandlers.splice(handlerIndex, 1);
      }
    };

    LoadableVisibilityComponent.prototype.render = function render() {
      if (this.state.visible) {
        return _react2.default.createElement(LoadableComponent, this.props);
      }

      if (LoadingComponent) {
        return _react2.default.createElement(
          'div',
          {
            style: { display: 'inline-block', minHeight: '1px', minWidth: '1px' },
            className: this.props.className,
            ref: this.attachRef
          },
          _react2.default.createElement(LoadingComponent, {
            isLoading: true
          })
        );
      }

      return _react2.default.createElement('div', {
        style: { display: 'inline-block', minHeight: '1px', minWidth: '1px' },
        className: this.props.className,
        ref: this.attachRef
      });
    };

    return LoadableVisibilityComponent;
  }(_react.Component);
}

exports.default = createLoadableVisibilityComponent;