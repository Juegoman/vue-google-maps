// import {clone, omit} from 'lodash';

import { loaded } from '../manager.js';
// import eventBinder from '../utils/eventsBinder.js';
// import propsBinder from '../utils/propsBinder.js';
import MapElementMixin from './mapElementMixin';
import getPropsValuesMixin from '../utils/getPropsValuesMixin.js';

const props = {
  options: {
    type: Object,
    default () {return {};}
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
    type: Object
  }
};

// const events = [];

export default {
  mixins: [MapElementMixin, getPropsValuesMixin],
  props: props,

  render() { return ''; },

  destroyed () {
    if (this.$directionsRenderer) {
      this.$directionsRenderer.setMap(null);
    }
  },

  created() {
    this.$directionCreated = new Promise((resolve, reject) => {
      this.$directionCreatedDeferred = { resolve, reject };
    });

    const recalculateRoute = () => {
      if (this.$directionsService && this.$directionsRenderer) {
        this.$directionsService.route(this.directionsRequest, this.renderDirections);
      }
    };
    this.$watch('directionsRequest', recalculateRoute);
  },

  computed: {
    directionsRequest () {
      return Object.assign({}, this.options, {
        origin: this.origin,
        destination: this.destination,
        travelMode: this.travelMode
      });
    }
  },

  watch: {
    panel (panel) {
      if (this.$directionsRenderer) {
        this.$directionsRenderer.setPanel(panel);
      }
    }
  },

  methods: {
    renderDirections (results, status) {
      if (status === 'OK') {
        this.$directionsRenderer.setDirections(results);
      } else throw new Error(status);
    }
  },

  deferredReady() {
    return loaded.then(() => {
      this.$directionsService = new google.maps.DirectionsService();
      this.$directionsRenderer = new google.maps.DirectionsRenderer();
      this.$directionsRenderer.setMap(this.$map);
      if (this.panel) this.$directionsRenderer.setPanel(this.panel);
      const renderDirections = (results, status) => {
        if (status === 'OK') {
          this.$directionsRenderer.setDirections(results);
          this.$directionCreatedDeferred.resolve();
        } else {
          this.$directionCreatedDeferred.reject();
          throw new Error(status);
        }
      };
      this.$directionsService.route(this.directionsRequest, renderDirections);
      return this.$directionCreated;
    });
  }
};