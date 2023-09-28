import React from "react"

import mapboxgl from "maplibre-gl"
import get from "lodash/get"

import { hasValue } from "./utils"
import { useTheme } from "./uicomponents"

const DefaultRenderComponent = ({ maplibreMap, layer, ...props }) => {
  return null;
}
const DefaultCallback = () => null;

const DefaultHoverComp = props => {
  const theme = useTheme();
  return (
    <div className={ `px-2 py-1 ${ theme.bg } rounded` }>
      <div>Broke-ass default hover component...</div>
      <div className="flex items-center flex-col">
        <span className="fa fa-face-sad-tear text-6xl"/>
        <span>...so sad...</span>
      </div>
      <div className="whitespace-pre-wrap">
        { JSON.stringify(props.data, null, 3) }
      </div>
    </div>
  )
}

export const RenderComponentWrapper = Component => props => {
  const {
    maplibreMap,
    layer,
    isActive,
    isVisible,
    updateHover,
    styleIndex,
    MapActions,
    resourcesLoaded,
    containerId,
    Protocols
  } = props;

  const {
    sources,
    layers,
    onClick,
    onHover,
    onBoxSelect
  } = layer;

  const updateLayerState = React.useCallback(state => {
    MapActions.updateLayerState(layer.id, state);
  }, [MapActions.updateLayerState, layer.id]);

  const startLayerLoading = React.useCallback(() => {
    MapActions.startLayerLoading(layer.id);
  }, [MapActions.startLayerLoading, layer.id]);
  const stopLayerLoading = React.useCallback(() => {
    MapActions.stopLayerLoading(layer.id);
  }, [MapActions.stopLayerLoading, layer.id]);

  const setResourcesLoaded = React.useCallback(loaded => {
    MapActions.setResourcesLoaded(layer.id, loaded);
  }, [MapActions.setResourcesLoaded, layer.id]);

  const [loading, setLoading] = React.useState(0);
  const startLoading = React.useCallback(() => {
    setLoading(l => l + 1);
  }, []);
  const stopLoading = React.useCallback(() => {
    setLoading(l => l - 1);
  }, []);

// LOAD SOURCES AND LAYERS
  React.useEffect(() => {
    if (!maplibreMap || !isActive) return;

    startLoading();

    setTimeout(stopLoading, 500);

    sources.forEach(({ id, source, protocol }) => {
      if (!maplibreMap.getSource(id)) {
        if (protocol in Protocols) {
          const { sourceInit, Protocol } = Protocols[protocol];
          sourceInit(Protocol, source, maplibreMap);
        }
        maplibreMap.addSource(id, source);
      }
    });

    const removeSources = () => {
      sources.forEach(({ id, source }) => {
        if (maplibreMap.getSource(id)) {
          maplibreMap.removeSource(id, source);
        }
      });
    }

    const layerVisibility = {};

    layers.forEach(layer => {
      if (!maplibreMap.getLayer(layer.id)) {
        if (layer.beneath && maplibreMap.getLayer(layer.beneath)) {
          maplibreMap.addLayer(layer, layer.beneath);
        }
        else {
          maplibreMap.addLayer(layer);
        }
      }
    });

    const removeLayers = () => {
      layers.forEach(layer => {
        if (maplibreMap.getLayer(layer.id)) {
          maplibreMap.removeLayer(layer.id);
        }
      })
    }

    return () => {
      if (!maplibreMap || !maplibreMap.loaded()) return;

      removeLayers();
      removeSources();
      setResourcesLoaded(false);
    };
  }, [maplibreMap, sources, layers, Protocols, isActive,
      startLoading, stopLoading, setResourcesLoaded
    ]
  );

// CHECK FOR STYLE CHANGE
  const prevStyleIndex = React.useRef(styleIndex);

  React.useEffect(() => {
    if (!maplibreMap || !isActive) return;
    if (prevStyleIndex.current === styleIndex) return;

    setResourcesLoaded(false);

    startLoading();

    setTimeout(stopLoading, 500);

    sources.forEach(({ id, source }) => {
      if (!maplibreMap.getSource(id)) {
        maplibreMap.addSource(id, source);
      }
    });

    layers.forEach(layer => {
      if (!maplibreMap.getLayer(layer.id)) {
        if (layer.beneath && maplibreMap.getLayer(layer.beneath)) {
          maplibreMap.addLayer(layer, layer.beneath);
        }
        else {
          maplibreMap.addLayer(layer);
        }
      }
    });

    prevStyleIndex.current = styleIndex;

  }, [maplibreMap, sources, layers, isActive,
      startLoading, stopLoading,
      styleIndex, setResourcesLoaded
    ]
  );

// ADD ON CLICK
  React.useEffect(() => {
    if (!maplibreMap || !isActive || !onClick) return;

    const { layers, callback = DefaultCallback } = onClick;

    function click(layerId, { point, features, lngLat }) {
      callback.call(layer, layerId, features, lngLat, point);
    };

    const funcs = layers.map(layerId => {
      const callback = click.bind(null, layerId);
      if (layerId === "maplibreMap") {
        maplibreMap.on("click", callback);
        return {
          action: "click",
          callback,
          layerId
        };
      }
      else {
        maplibreMap.on("click", layerId, callback);
        return {
          action: "click",
          callback,
          layerId
        };
      }
    });

    return () => {
      if (!maplibreMap || !maplibreMap.loaded()) return;

      funcs.forEach(({ action, callback, layerId }) => {
        if (layerId === "maplibreMap") {
          maplibreMap.off(action, callback);
        }
        else {
          maplibreMap.off(action, layerId, callback);
        }
      })
    }
  }, [maplibreMap, layer, onClick, isActive]);

// ADD ON HOVER
  React.useEffect(() => {
    if (!maplibreMap || !isActive || !onHover) return;

    const {
      layers = [],
      callback = DefaultCallback,
      Component = DefaultHoverComp,
      property = null,
      filterFunc = null,
      isPinnable = false,
      zIndex = -1
    } = onHover;

    const HoveredFeatures = new Map();

    function mousemove(layerId, { point, features, lngLat }) {
      const hoveredFeatures = HoveredFeatures.get(layerId) || new Map();
      HoveredFeatures.set(layerId, new Map());

      const hoverFeatures = features => {
        features.forEach(({ id, source, sourceLayer }) => {

          if ((id === undefined) || (id === null)) return;

          if (hoveredFeatures.has(id)) {
            HoveredFeatures.get(layerId).set(id, hoveredFeatures.get(id));
            hoveredFeatures.delete(id);
          }
          else {
            const value = { id, source, sourceLayer };
            HoveredFeatures.get(layerId).set(id, value);
            maplibreMap.setFeatureState(value, { hover: true });
          }
        });
      }

      const featuresMap = new Map();

      if (property) {
        const properties = features.reduce((a, c) => {
          const prop = get(c, ["properties", property], null);
          if (prop) {
            a[prop] = true;
          }
          return a;
        }, {});
        maplibreMap.queryRenderedFeatures({
            layers: [layerId],
            filter: ["in", ["get", property], ["literal", Object.keys(properties)]]
          })
          .forEach(feature => {
            if (feature.id) {
              featuresMap.set(feature.id, feature);
            }
          })
      }
      if (filterFunc) {
        const filter = filterFunc.call(layer, layerId, features, lngLat, point);
        if (hasValue(filter)) {
          maplibreMap.queryRenderedFeatures({ layers: [layerId], filter })
            .forEach(feature => {
              if (feature.id) {
                featuresMap.set(feature.id, feature);
              }
            });
        }
      }
      features.forEach(feature => {
        if (feature.id) {
          featuresMap.set(feature.id, feature);
        }
      });

      hoverFeatures([...featuresMap.values()]);

      hoveredFeatures.forEach(value => {
        maplibreMap.setFeatureState(value, { hover: false });
      })

      const data = callback(layerId, features, lngLat, point);

      if (hasValue(data)) {
        updateHover({
          type: "hover-layer-move",
          lngLat,
          Component,
          layer,
          layerId,
          isPinnable,
          zIndex,
          data
        });
      }
    } // END mousemove

    const hoverleave = (maplibreMap, layerId) => {
      if (!HoveredFeatures.has(layerId)) return;
      HoveredFeatures.get(layerId).forEach(value => {
        maplibreMap.setFeatureState(value, { hover: false });
      });
      HoveredFeatures.delete(layerId);
    }

    function mouseleave(layerId, e) {
      hoverleave(maplibreMap, layerId);
      updateHover({
        type: "hover-layer-leave",
        layerId
      });
    };

    const funcs = layers.reduce((a, c) => {
      let callback = mousemove.bind(layer, c);
      a.push({
        action: "mousemove",
        callback,
        layerId: c
      });
      maplibreMap.on("mousemove", c, callback);

      callback = mouseleave.bind(layer, c);
      a.push({
        action: "mouseleave",
        callback,
        layerId: c
      });
      maplibreMap.on("mouseleave", c, callback);

      return a;
    }, []);

    return () => {
      if (!maplibreMap || !maplibreMap.loaded()) return;

      funcs.forEach(({ action, callback, layerId }) => {
        maplibreMap.off(action, layerId, callback);
      });
      HoveredFeatures.forEach(hoveredFeatures => {
        hoveredFeatures.forEach(value => {
          maplibreMap.setFeatureState(value, { hover: false });
        });
      });
    }
  }, [maplibreMap, layer, onHover, isActive, updateHover]);

// ADD ON BOX SELECT
  React.useEffect(() => {
    if (!maplibreMap || !isActive || !onBoxSelect) return;

    const {
      callback = DefaultCallback,
      className = "bg-black bg-opacity-25 border-2 border-black rounded",
      layers,
      filter
    } = onBoxSelect;

    let selectedValues = [];
    let start, current, box;

    const div = document.getElementById(containerId);
    const blocker = document.getElementById(`${ containerId }-box-select-blocker`);

    const getPos = e => {
      const rect = div.getBoundingClientRect();
      return new mapboxgl.Point(
        e.clientX - rect.left - div.clientLeft,
        e.clientY - rect.top - div.clientTop
      )
    }

    const finish = bbox => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);

      maplibreMap.dragPan.enable();

      blocker.classList.add("pointer-events-none");
      blocker.classList.remove("pointer-events-auto");

      if (box) {
        box.remove();
        box = null;
      }

      if (bbox) {
        selectedValues.forEach(value => {
          maplibreMap.setFeatureState(value, { select: false });
        });

        const queriedFeatures = maplibreMap.queryRenderedFeatures(bbox, {
          layers,
          filter
        });

        const featureIds = new Set();

        selectedValues = queriedFeatures.reduce((a, c) => {
          if (!featureIds.has(c.id)) {
            featureIds.add(c.id);
            const value = {
              id: c.id,
              source: c.source,
              sourceLayer: c.sourceLayer,
              properties: c.properties
            }
            a.push(value);
            maplibreMap.setFeatureState(value, { select: true });
          }
          return a;
        }, []);

        callback(selectedValues);
      }
    }

    const mousemove = e => {
      e.preventDefault();

      current = getPos(e);

      if (!box) {
        box = document.createElement("div");
        box.className = "absolute top-0 left-0 w-0 h-0 " + className;
        div.appendChild(box);
      }

      var minX = Math.min(start.x, current.x),
        maxX = Math.max(start.x, current.x),
        minY = Math.min(start.y, current.y),
        maxY = Math.max(start.y, current.y);

        box.style.transform = `translate( ${ minX }px, ${ minY }px)`;
        box.style.width = `${ maxX - minX }px`;
        box.style.height = `${ maxY - minY }px`;
    }
    const mouseup = e => {
      finish([start, getPos(e)]);
    }

    const mousedown = e => {
      if (!(e.shiftKey && (e.button === 0))) return;

      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);

      maplibreMap.dragPan.disable();

      blocker.classList.remove("pointer-events-none");
      blocker.classList.add("pointer-events-auto");

      start = getPos(e);
    }

    div.addEventListener("mousedown", mousedown, true);

    maplibreMap.boxZoom.disable();

    return () => {
      div.removeEventListener("mousedown", mousedown);

      if (!maplibreMap || !maplibreMap.loaded()) return;

      maplibreMap.boxZoom.enable();
    }

  }, [maplibreMap, layers, layer, onBoxSelect, isActive, containerId]);

// ENSURE ALL SOURCES AND LAYERS HAVE COMPLETED LOADING
  React.useEffect(() => {
    if (!maplibreMap) return;
    if (resourcesLoaded) return;

    const sourcesLoaded = sources.reduce((a, c) => {
      return a && Boolean(maplibreMap.getSource(c.id));
    }, true);
    const layersLoaded = layers.reduce((a, c) => {
      return a && Boolean(maplibreMap.getLayer(c.id));
    }, true);

    const loaded = !loading && sourcesLoaded && layersLoaded;

    setResourcesLoaded(loaded);

  }, [maplibreMap, layer.id, sources, layers, setResourcesLoaded, loading, resourcesLoaded]);

  const [layerVisibility, _setLayerVisibility] = React.useState({});

  const setLayerVisibility = React.useCallback((layerId, visibility) => {
    _setLayerVisibility(prev => ({
      ...prev,
      [layerId]: visibility
    }));
  }, []);

// SET INITAL LAYER VISIBILITIES
  React.useEffect(() => {
    const layerVisibility = layers.reduce((a, c) => {
      a[c.id] = get(c, ["layout", "visibility"], "visible");
      return a;
    }, {});
    _setLayerVisibility(layerVisibility);
  }, [layers]);

// LISTEN FOR LAYER VISIBILITY CHANGE
  React.useEffect(() => {
    if (!maplibreMap) return;
    if (!resourcesLoaded) return;

    layers.forEach(({ id }) => {
      if (isVisible && (layerVisibility[id] !== "none")) {
        maplibreMap.setLayoutProperty(id, "visibility", "visible");
      }
      else {
        maplibreMap.setLayoutProperty(id, "visibility", "none");
      }
    });
  }, [maplibreMap, layers, isVisible, resourcesLoaded, layerVisibility]);

  return (
    <Component { ...props }
      setLayerVisibility={ setLayerVisibility }
      updateLayerState={ updateLayerState }
      startLayerLoading={ startLayerLoading }
      stopLayerLoading={ stopLayerLoading }/>
  );
}

let layerId = -1;
const getLayerId = () => `avl-layer-${ ++layerId }`;

const DefaultOptions = {
  sources: [],
  layers: [],
  toolbar: ["toggle-visibility"],
  startActive: true,
  startVisible: true,
  startState: {},
  filters: {},
  modals: {},
  mapActions: [],
  loadingIndicator: {},
  isDynamic: false
}

class AvlLayer {
  constructor(options = {}) {
    const Options = { ...DefaultOptions, ...options };
    for (const key in Options) {
      this[key] = Options[key];
    }
    this.id = this.id || getLayerId();
    this._initialized = false;
  }
  onFilterChange(filterId, value, prevValue) {

  }
  RenderComponent = DefaultRenderComponent;
}

export { AvlLayer }
