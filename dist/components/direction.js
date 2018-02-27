'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _manager = require('../manager.js');

var _mapElementMixin = require('./mapElementMixin');

var _mapElementMixin2 = _interopRequireDefault(_mapElementMixin);

var _getPropsValuesMixin = require('../utils/getPropsValuesMixin.js');

var _getPropsValuesMixin2 = _interopRequireDefault(_getPropsValuesMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import eventBinder from '../utils/eventsBinder.js';
// import propsBinder from '../utils/propsBinder.js';
var props = {
  options: {
    type: Object,
    default: function _default() {
      return {};
    }
  },
  origin: {
    type: Object
  },
  destination: {
    type: Object
  },
  travelMode: {
    type: String
  },
  panel: {
    type: HTMLDivElement
  }
};

// const events = [];

// import {clone, omit} from 'lodash';

exports.default = {
  mixins: [_mapElementMixin2.default, _getPropsValuesMixin2.default],
  props: props,

  render: function render() {
    return '';
  },
  destroyed: function destroyed() {
    if (this.$directionsRenderer) {
      this.$directionsRenderer.setMap(null);
    }
  },
  created: function created() {
    var _this = this;

    this.$directionCreated = new Promise(function (resolve, reject) {
      _this.$directionCreatedDeferred = { resolve: resolve, reject: reject };
    });

    var recalculateRoute = function recalculateRoute() {
      if (_this.$directionsService && _this.$directionsRenderer) {
        _this.$directionsService.route(_this.directionsRequest, _this.renderDirections);
      }
    };
    this.$watch('directionsRequest', recalculateRoute);
  },


  computed: {
    directionsRequest: function directionsRequest() {
      return Object.assign({}, this.options, {
        origin: this.origin,
        destination: this.destination,
        travelMode: this.travelMode
      });
    }
  },

  watch: {
    panel: function panel(_panel) {
      if (this.$directionsRenderer) {
        this.$directionsRenderer.setPanel(_panel);
      }
    }
  },

  methods: {
    renderDirections: function renderDirections(results, status) {
      if (status === 'OK') {
        this.$directionsRenderer.setDirections(results);
      } else {
        this.$emit('directionsError', status);
        throw new Error(status);
      }
    }
  },

  deferredReady: function deferredReady() {
    var _this2 = this;

    return _manager.loaded.then(function () {
      _this2.$directionsService = new google.maps.DirectionsService();
      _this2.$directionsRenderer = new google.maps.DirectionsRenderer();
      _this2.$directionsRenderer.setMap(_this2.$map);
      var renderDirections = function renderDirections(results, status) {
        if (status === 'OK') {
          _this2.$directionsRenderer.setDirections(results);
          if (_this2.panel) _this2.$directionsRenderer.setPanel(_this2.panel);
          _this2.$directionCreatedDeferred.resolve();
        } else {
          _this2.$emit('directionsError', status);
          _this2.$directionCreatedDeferred.reject();
          throw new Error(status);
        }
      };
      _this2.$directionsService.route(_this2.directionsRequest, renderDirections);
      return _this2.$directionCreated;
    });
  }
};