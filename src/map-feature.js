export class MapFeature extends HTMLElement {
  // to-do:
  // make <map-feature> interactive
  // 1. when <map-feature> is re-added to the dom-tree, it should be re-rendered; -> done
  // 2. when <map-feature> is removed from the dom-tree, the feature should be removed from the map/layer -> done
  // 3. when <map-feature> is updated in the dom-tree (attribute), the feature should be updated dynamically -> done
    static get observedAttributes() {
      return ['zoom'];
    }
    get zoom() {
      return +(this.hasAttribute("zoom") ? this.getAttribute("zoom") : 0);
    }
    set zoom(val) {
      var parsedVal = String.toString(parseInt(val,10));
      if (!isNaN(parsedVal) && (parsedVal >= 0 && parsedVal <= 25)) {
        this.setAttribute('zoom', parsedVal);
      }
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'zoom': {
          if (oldValue !== newValue && oldValue) {
            this._addOrUpdateFeature();
          }
          break;
        }
      }
    }
    constructor() {
      // Always call super first in constructor
      super();
    }
    connectedCallback() {
      if (this.parentElement.tagName.toLowerCase() !== 'layer-') {
        return;
      }
      this._layerParent = this.parentElement._layer._mapmlvectors;
      this._map = this._layerParent._map;
      
      if (!this._featureLayer) {
        this._addOrUpdateFeature();
      }

      // link to the leaflet featuresgroup
      // done in FeatureLayer.js -> MapMLLayer.js
      // can be accessed by this._featureLayer
      this._groupEl = this._featureLayer.options.group;
    }
      
    disconnectedCallback() {
      this._groupEl.parentElement.removeChild(this._groupEl);
      // remove the layer that the featureGroup is put on
      this._featureLayer._map.removeLayer(this._featureLayer);
      delete this._featureLayer;
      delete this._groupEl;
    }

    // render / re-render (for update) features
    _addOrUpdateFeature() {
      let nativeZoom = this.closest("map-meta[name=zoom]")?.getAttribute('content')?.split(',').find(zoom => zoom.includes('value')) || 0,
          nativeCS = this.closest(".map-meta[name=cs]")?.getAttribute('content') || 'pcrs';
      this._featureLayer = this._layerParent.addData(this, nativeCS, nativeZoom);
      this._featureLayer.addTo(this._map);
      let features = this._featureLayer._layers;
      for (const key in features) {
        features[key].addTo(this._map);
      }
    }

    // Util functions:
    // internal support for returning a GeoJSON representation of <map-feature> geometry
    geometryToGeoJSON() {

    }

    // method to calculate and return the extent of the feature as a JavaScript object
    getFeatureExtent() {
      // can be implemented by slightly changing the mapml2geojson function

    }

  };