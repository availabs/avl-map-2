import React from "react"

import maplibre from "maplibre-gl"
import { Protocol } from './pmtiles/index.ts';

import get from "lodash/get"

import { RenderComponentWrapper } from "./avl-layer"

import {
  HoverCompContainer,
  PinnedHoverComp,
  LayerSidebar,
  LayerSidebarContainer,
  LayerSidebarToggle,
  PanelContainer,
  LayersPanel,
  LayerPanelContainer,
  LayerPanel,
  LayerPanelHeaderContainer,
  LayerPanelHeader,
  FilterContainer,
  LoadingIndicator,
  InfoBoxSidebar,
  Modal
} from "./components"

import {
  useSetSize
} from "./utils"

import { useTheme } from "./uicomponents"

let idCounter = 0;
const getNewId = () => `avl-thing-${ ++idCounter }`;
export const protocol = new Protocol()

const EmptyObject = {};

export const DefaultStyles = [
  // { name: "Blank Map",
  //   style: "https://api.maptiler.com/maps/cfab42ac-61f1-49de-8efc-01ff718944bd/style.json?key=mU28JQ6HchrQdneiq6k9"
  // },
  { name: "Dark",
    style: "https://api.maptiler.com/maps/dataviz-dark/style.json?key=mU28JQ6HchrQdneiq6k9"
  },
  { name: "Light",
    style: "https://api.maptiler.com/maps/dataviz-light/style.json?key=mU28JQ6HchrQdneiq6k9"
  },
  { name: "Streets",
    style: "https://api.maptiler.com/maps/streets-v2/style.json?key=mU28JQ6HchrQdneiq6k9",
  },
  { name: "Satellite Streets",
    style: "https://api.maptiler.com/maps/hybrid/style.json?key=mU28JQ6HchrQdneiq6k9",
  },
];

const DefaultMapOptions = {
  center: [-74.180647, 42.58],
  minZoom: 2,
  zoom: 10,
  preserveDrawingBuffer: true,
  styles: DefaultStyles,
  attributionControl: false,
  logoPosition: "bottom-left",
  navigationControl: "bottom-right"
};

const DefaultLeftSidebar = {
  Component: LayerSidebar,
  startOpen: true,
  Panels: ["LayersPanel", "StylePanel"],
  SubComponents: {
    LayerSidebarContainer: LayerSidebarContainer,
    LayerSidebarToggle: LayerSidebarToggle,
    PanelContainer: PanelContainer,
    LayerPanelContainer: LayerPanelContainer,
    LayersPanel: LayersPanel,
    LayerPanel: LayerPanel,
    LayerPanelHeaderContainer: LayerPanelHeaderContainer,
    LayerPanelHeader: LayerPanelHeader,
    FilterContainer: FilterContainer,
  }
}
const DefaultRightSidebar = {
  Component: InfoBoxSidebar,
  SubComponents: {

  }
}

export const ActionButton = ({ children, onClick }) => {
  const theme = useTheme();
  return (
    <div onClick={ onClick }
      className={ `
        rounded ${ theme.bg } h-10 w-10
        flex items-center justify-center
        cursor-pointer pointer-events-auto text-2xl
        ${ theme.textHighlightHover }
      ` }
    >
      { children }
    </div>
  )
}

const MapAction = ({ action, icon, MapActions }) => {
  const onClick = React.useCallback(() => {
    if (typeof action === "function") {
      action(MapActions);
    }
  }, [action, MapActions]);
  return (
    <ActionButton onClick={ onClick }>
      <span className={ icon }/>
    </ActionButton>
  )
}
const ResetView = ({ MapActions, maplibreMap }) => {
  const [bearing, setBearing] = React.useState(0);

  React.useEffect(() => {
    if (!maplibreMap) return;
    setBearing(maplibreMap.getBearing());
  }, [maplibreMap]);

  React.useEffect(() => {
    if (!maplibreMap) return;
    const func = e => {
      setBearing(maplibreMap.getBearing());
    }
    maplibreMap.on("rotate", func);
    return () => {
      maplibreMap.off("rotate", func);
    }
  }, [maplibreMap]);

  const resetView = React.useCallback(e => {
    MapActions.resetView();
  }, [MapActions.resetView]);

  const theme = useTheme();

  return (
    <ActionButton onClick={ resetView }>
      <span className={ `
          fa-solid fa-arrow-up w-10 py-1 flex justify-center
          ${ theme.textHighlightHover }
        ` }
        style={ { transform: `rotate(${ bearing }deg)` } }/>
    </ActionButton>
  )
}
const Navigationcontrols = ({ MapActions, maplibreMap }) => {
  const [bearing, setBearing] = React.useState(0);

  React.useEffect(() => {
    if (!maplibreMap) return;
    setBearing(maplibreMap.getBearing());
  }, [maplibreMap]);

  React.useEffect(() => {
    if (!maplibreMap) return;
    const func = e => {
      setBearing(maplibreMap.getBearing());
    }
    maplibreMap.on("rotate", func);
    return () => {
      maplibreMap.off("rotate", func);
    }
  }, [maplibreMap]);

  const zoomIn = React.useCallback(e => {
    if (!maplibreMap) return;
    const current = maplibreMap.getZoom();
    maplibreMap.zoomTo(current * 1.1);
  }, [maplibreMap]);

  const resetView = React.useCallback(e => {
    MapActions.resetView();
  }, [MapActions.resetView]);

  const zoomOut = React.useCallback(e => {
    if (!maplibreMap) return;
    const current = maplibreMap.getZoom();
    maplibreMap.zoomTo(current / 1.1);
  }, [maplibreMap]);

  const theme = useTheme();

  return (
    <div className={ `
        flex flex-col cursor-pointer pointer-events-auto ${ theme.bg } rounded
      ` }
    >
      <span onClick={ zoomIn }
        className={ `
          fa-solid fa-plus w-10 py-1 flex justify-center
          ${ theme.textHighlightHover }
        ` }/>
      <div onClick={ resetView }
        className={ `border-y ${ theme.border }` }
      >
        <span className={ `
            fa-solid fa-arrow-up w-10 py-1 flex justify-center
            ${ theme.textHighlightHover }
          ` }
          style={ { transform: `rotate(${ bearing }deg)` } }/>
      </div>
      <span onClick={ zoomOut }
        className={ `
          fa-solid fa-minus w-10 py-1 flex justify-center
          ${ theme.textHighlightHover }
        ` }/>
    </div>
  )
}

const LayerAction = ({ action, icon, layer, MapActions }) => {
  const onClick = React.useCallback(() => {
    if (typeof action === "function") {
      action(layer, MapActions);
    }
  }, [action, layer, MapActions]);
  return (
    <ActionButton onClick={ onClick }>
      <span className={ icon }/>
    </ActionButton>
  )
}

const DefaultMapActions = {
  "reset-view": {
    Component: ResetView
  },
  "go-home": {
    Component: MapAction,
    icon: "fa-solid fa-house",
    action: ({ goHome }) => {
      goHome();
    }
  },
  "navigation-controls": {
    Component: Navigationcontrols
  }
}

const InitialState = {
  maplibreMap: null,
  moving: false,
  mapStyles: [],
  styleIndex: 0,
  layerVisibility: {},
  layerState: {},
  dynamicLayers: [],
  activeLayers: {},
  resourcesLoaded: {},
  hoverData: {
    data: [],
    lngLat: { lng: 0, lat: 0 },
    hovering: false
  },
  pinnedHoverComps: [],
  filterUpdate: { layerId: null },
  layersLoading: {},
  legend: {
    type: "quantize",
    domain: [0, 1],
    range: ["red", "yellow", "green"],
    format: ",.2f",
    name: "Unnamed Legend",
    isActive: false
  },
  openedModals: []
}
const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "toggle-layer-visibility":
      return {
        ...state,
        layerVisibility: {
          ...state.layerVisibility,
          [payload.layerId]: !state.layerVisibility[payload.layerId]
        }
      }
    case "update-layer-state": {
      const { layerId, layerState: newState } = payload;
      const prevState = get(state, ["layerState", layerId], {});
      if (typeof newState === "function") {
        return {
          ...state,
          layerState: {
            ...state.layerState,
            [layerId]: {
              ...prevState,
              ...newState(prevState)
            }
          }
        }
      }
      return {
        ...state,
        layerState: {
          ...state.layerState,
          [layerId]: {
            ...prevState,
            ...newState
          }
        }
      }
    }

    case "create-dynamic-layer": {
      const { layer } = payload;
      const exists = state.dynamicLayers.reduce((a, c) => {
        return a || (c.id === layer.id);
      }, false);
      if (exists) return state;
      layer.isDynamic = true;
      return {
        ...state,
        dynamicLayers: [...state.dynamicLayers, layer]
      }
    }
    case "destroy-dynamic-layer":
      return {
        ...state,
        dynamicLayers: state.dynamicLayers.filter(dl => dl.id !== payload.layerId)
      }

    case "open-modal": {
      const { layerId, modalId } = payload;
      const openedModals = state.openedModals
        .filter(m => !((m.layerId === layerId) && (m.modalId === modalId)));
      return {
        ...state,
        openedModals: [...openedModals, { layerId, modalId }]
      }
    }
    case "close-modal": {
      const { layerId, modalId } = payload;
      const openedModals = state.openedModals
        .filter(m => !((m.layerId === layerId) && (m.modalId === modalId)));
      return {
        ...state,
        openedModals
      }
    }
    case "bring-modal-to-front": {
      const { layerId, modalId } = payload;
      const openedModals = [...state.openedModals]
        .sort((a, b) => {
          if (((a.layerId === layerId) && (a.modalId === modalId))) {
            return 1;
          }
          if (((b.layerId === layerId) && (b.modalId === modalId))) {
            return -1;
          }
          return 0;
        });
      return {
        ...state,
        openedModals
      }
    }

    case "update-filter": {
      return {
        ...state,
        filterUpdate: {
          ...payload
        }
      }
    }

    case "hover-layer-move": {
      const { data, layer, Component, isPinnable, zIndex, ...rest } = payload;
      return {
        ...state,
        hoverData: {
          data: [
            ...state.hoverData.data.filter(d => d.layer.id !== layer.id),
            { data,
              Component,
              layer,
              isPinnable,
              zIndex,
            }
          ],
          ...rest,
          hovering: true
        },
      };
    }
    case "hover-layer-leave": {
      const { layerId } = payload;
      const data = state.hoverData.data.filter(d => d.layer.id !== layerId);
      return {
        ...state,
        hoverData: {
          ...state.hoverData,
          data,
          hovering: Boolean(data.length)
        },
      };
    }
    case "pin-hover-comp": {
      if (!state.hoverData.hovering) return state;

      const { lngLat, marker } = payload;

      const HoverComps = [...state.hoverData.data]
        .filter(({ isPinnable }) => isPinnable)
        .sort((a, b) => b.zIndex - a.zIndex);

      if (HoverComps.length) {
        marker.addTo(state.maplibreMap);
        const newPinned = {
          id: getNewId(),
          lngLat,
          marker,
          HoverComps
        }
        return {
          ...state,
          pinnedHoverComps: [
            ...state.pinnedHoverComps,
            newPinned
          ]
        };
      }
      return state;
    }
    case "remove-pinned":
      return {
        ...state,
        pinnedHoverComps: state.pinnedHoverComps.filter(phc => {
          if (phc.id !== payload.id) return true;
          phc.marker.remove();
          return false;
        }),
      };

    case "layer-loading-start": {
      const { layerId } = payload;
      let start = get(state, ["layersLoading", layerId, "start"], 0);
      let loading = get(state, ["layersLoading", layerId, "loading"], 0);
      return {
        ...state,
        layersLoading: {
          ...state.layersLoading,
          [layerId]: {
            start: start || performance.now(),
            loading: ++loading
          }
        }
      }
    }
    case "layer-loading-stop": {
      const { layerId } = payload;
      let start = get(state, ["layersLoading", layerId, "start"], 0);
      let loading = get(state, ["layersLoading", layerId, "loading"], 0);
      return {
        ...state,
        layersLoading: {
          ...state.layersLoading,
          [layerId]: {
            start: loading > 1 ? start : 0,
            loading: Math.max(--loading, 0)
          }
        }
      }
    }

    case "activate-layer":
      return {
        ...state,
        activeLayers: {
          ...state.activeLayers,
          [payload.layerId]: true
        }
      }
    case "deactivate-layer":
      return {
        ...state,
        activeLayers: {
          ...state.activeLayers,
          [payload.layerId]: false
        }
      }

    case "update-state":
      return { ...state, ...payload };
    case "map-loaded": {
      const { legend, ...rest } = payload;
      return {
        ...state,
        ...payload,
        legend: {
          ...state.length,
          ...legend
        }
      };
    }
    case "update-legend":
      return {
        ...state,
        legend: {
          ...state.legend,
          ...payload.update
        }
      }
    case "initialize-layers": {
      const { layerVisibility, layerState, activeLayers, resourcesLoaded } = payload;
      return {
        ...state,
        layerVisibility: {
          ...state.layerVisibility,
          ...layerVisibility
        },
        layerState: {
          ...state.layerState,
          ...layerState
        },
        activeLayers: {
          ...state.activeLayers,
          ...activeLayers
        },
        resourcesLoaded: {
          ...state.resourcesLoaded,
          ...resourcesLoaded
        }
      }
    }
    case "set-resources-loaded": {
      const { layerId, loaded } = payload;
      return {
        ...state,
        resourcesLoaded: {
          ...state.resourcesLoaded,
          [layerId]: loaded
        }
      }
    }
    default:
      return state;
  }
}

const AvlMap = allProps => {
  const {
    accessToken,
    mapOptions = EmptyObject,
    layers,
    layerProps,
    id,
    leftSidebar = EmptyObject,
    rightSidebar = EmptyObject,
    legend = EmptyObject,
    mapActions = ["reset-view"],
    ...props
  } = allProps;

  const containerId = React.useRef(id || getNewId());

  const MapOptions = React.useRef({
    ...DefaultMapOptions,
    ...mapOptions,
    accessToken,
    legend
  });

  const [state, dispatch] = React.useReducer(Reducer, InitialState);

// INITIALIZE MAP
  React.useEffect(() => {
    const {
      styles,
      navigationControl,
      accessToken,
      legend,
      ...Options
    } = MapOptions.current;

    if (!accessToken) {
      console.error("A valid Mapbox access token is required.");
      return;
    };

    maplibre.accessToken = accessToken;

    maplibre.addProtocol("pmtiles", protocol.tile);

    let styleIndex = 0;

    const maplibreMap = new maplibre.Map({
      container: containerId.current,
      ...Options,
      style: styles[0].style
    });

    if (navigationControl) {
      maplibreMap.addControl(new maplibre.NavigationControl(), navigationControl);
    }

    maplibreMap.on("move", (e) => {
      dispatch({ type: "update-state", moving: true });
    });
    maplibreMap.on("moveend", (e) => {
      dispatch({ type: "update-state", moving: false });
    });

    maplibreMap.once("load", (e) => {
      dispatch({ type: "map-loaded", maplibreMap, mapStyles: styles, styleIndex, legend });
    });

    return () => maplibreMap.remove();
  }, []);

// INITIALIZE LAYERS
  React.useEffect(() => {
    if (!state.maplibreMap) return;

    const layerVisibility = {};
    const layerState = {};
    const activeLayers = {};
    const resourcesLoaded = {};
    [...layers, ...state.dynamicLayers].forEach(l => {
      if (!l._initialized) {
        layerVisibility[l.id] = get(l, "startVisible", true);
        layerState[l.id] = get(l, "startState", {});
        activeLayers[l.id] = get(l, "startActive", true);
        resourcesLoaded[l.id] = false;
        l._initialized = true;
        l.RenderComponent = RenderComponentWrapper(l.RenderComponent);
        function updateState(layerState) {
          dispatch({
            type: "update-layer-state",
            layerId: l.id,
            layerState
          })
        }
        l.updateState = updateState.bind(l);
      }
    });
    dispatch({
      type: "initialize-layers",
      layerVisibility,
      layerState,
      activeLayers,
      resourcesLoaded
    });
  }, [state.maplibreMap, layers, state.dynamicLayers]);

// SEND PROPS TO LAYERS
  React.useEffect(() => {
    layers.forEach(l => {
      l.props = get(layerProps, l.id, {});
    })
  }, [layers, layerProps]);

// SEND STATE TO LAYERS
  React.useEffect(() => {
    layers.forEach(l => {
      l.state = get(state, ["layerState", l.id], {});
    })
  }, [layers, state.layerState]);

// CREATE MAP ACTIONS
  const createDynamicLayer = React.useCallback(layer => {
    dispatch({
      type: "create-dynamic-layer",
      layer
    })
  }, []);
  const destroyDynamicLayer = React.useCallback(layerId => {
    dispatch({
      type: "destroy-dynamic-layer",
      layerId
    })
  }, []);

  const setResourcesLoaded = React.useCallback((layerId, loaded) => {
    dispatch({
      type: "set-resources-loaded",
      layerId,
      loaded
    })
  }, []);

  const toggleLayerVisibility = React.useCallback(layerId => {
    dispatch({
      type: "toggle-layer-visibility",
      layerId
    });
  }, []);

  const updateLayerState = React.useCallback((layerId, layerState) => {
    dispatch({
      type: "update-layer-state",
      layerId,
      layerState
    });
  }, []);

  const setMapStyle = React.useCallback(styleIndex => {
    if (!state.maplibreMap) return;
    if (styleIndex === state.styleIndex) return;
    const mapStyle = state.mapStyles[styleIndex];
    if (!mapStyle) return;
    state.maplibreMap.once("styledata", e => {
      dispatch({
        type: "update-state",
        styleIndex
      })
    });
    state.maplibreMap.setStyle(mapStyle.style);
  }, [state.maplibreMap, state.mapStyles, state.styleIndex]);

  const updateLegend = React.useCallback(update => {
    dispatch({
      type: "update-legend",
      update
    })
  }, []);

  const updateHover = React.useCallback(hoverData => {
    dispatch(hoverData);
  }, []);
  const pinHoverComp = React.useCallback(({ lngLat }) => {
    const marker = new maplibre.Marker().setLngLat(lngLat);
    dispatch({
      type: "pin-hover-comp",
      lngLat,
      marker
    });
  }, []);
  const removePinnedHoverComp = React.useCallback(id => {
    dispatch({
      type: "remove-pinned",
      id,
    });
  }, []);

  const startLayerLoading = React.useCallback(layerId => {
    dispatch({
      type: "layer-loading-start",
      layerId
    })
  }, []);
  const stopLayerLoading = React.useCallback(layerId => {
    dispatch({
      type: "layer-loading-stop",
      layerId
    })
  }, []);

  const updateFilter = React.useCallback((layer, filterId, value) => {
    if (!get(layer, ["filters", filterId], null)) return;
    const prevValue = layer.filters[filterId].value;
    dispatch({
      type: "update-filter",
      layerId: layer.id,
      filterId,
      prevValue,
      value
    })
  }, []);

  const activateLayer = React.useCallback(layerId => {
    dispatch({
      type: "activate-layer",
      layerId
    });
  }, []);
  const deactivateLayer = React.useCallback(layerId => {
    dispatch({
      type: "deactivate-layer",
      layerId
    });
  }, []);

  const openModal = React.useCallback((layerId, modalId) => {
    dispatch({
      type: "open-modal",
      layerId,
      modalId
    });
  }, []);
  const closeModal = React.useCallback((layerId, modalId) => {
    dispatch({
      type: "close-modal",
      layerId,
      modalId
    });
  }, []);
  const bringModalToFront = React.useCallback((layerId, modalId) => {
    dispatch({
      type: "bring-modal-to-front",
      layerId,
      modalId
    });
  }, []);

  const goHome = React.useCallback(() => {
    if (!state.maplibreMap) return;
    const { center, zoom } = MapOptions.current;
    state.maplibreMap.easeTo({
      pitch: 0,
      bearing: 0,
      center,
      zoom
    });
  }, [state.maplibreMap]);
  const resetView = React.useCallback((options = {}) => {
    if (!state.maplibreMap) return;
    state.maplibreMap.easeTo({
      pitch: 0,
      bearing: 0,
      ...options
    });
  }, [state.maplibreMap]);

// DETERMINE ACTIVE AND INACTIVE LAYERS
  const [activeLayers, inactiveLayers] = React.useMemo(() => {
    return [...layers, ...state.dynamicLayers].reduce((a, c) => {
      if (state.activeLayers[c.id]) {
        a[0].push(c);
      }
      else {
        a[1].push(c);
      }
      return a;
    }, [[], []]);
  }, [layers, state.dynamicLayers, state.activeLayers]);

// APPLY POINTER STYLE TO CURSOR ON HOVER
  React.useEffect(() => {
    if (!state.maplibreMap) return;
    if (state.hoverData.hovering) {
      state.maplibreMap.getCanvas().style.cursor = 'pointer';
    }
    else {
      state.maplibreMap.getCanvas().style.cursor = '';
    }
  }, [state.maplibreMap, state.hoverData.hovering]);

// DETERMINE LOADING LAYERS
  const loadingLayers = React.useMemo(() => {
    return activeLayers.filter(layer => {
      return get(state, ["layersLoading", layer.id, "loading"], 0);
    }).sort((a, b) => {
      const aStart = get(state, ["layersLoading", a.id, "start"], 0);
      const bStart = get(state, ["layersLoading", b.id, "start"], 0);
      return aStart - bStart;
    })
  }, [state.layersLoading, activeLayers]);

// GET LEFT SIDEBAR OPTIONS
  const [LeftSidebar, leftSidebarOptions] = React.useMemo(() => {
    if (!leftSidebar) return [null, {}];
    const { SubComponents: DefaultSubComponents } = DefaultLeftSidebar;
    const { SubComponents = {} } = leftSidebar;
    const { Component, ...rest } = { ...DefaultLeftSidebar,
                                      ...leftSidebar,
                                      SubComponents: {
                                        ...DefaultSubComponents,
                                        ...SubComponents
                                      }
                                    };
    return [Component, rest];
  }, [leftSidebar]);

// GET RIGHT SIDEBAR OPTIONS
  const [RightSidebar, rightSidebarOptions] = React.useMemo(() => {
    if (!rightSidebar) return [null, {}];
    const { SubComponents: DefaultSubComponents } = DefaultRightSidebar;
    const { SubComponents = {} } = rightSidebar;
    const { Component, ...rest } = { ...DefaultRightSidebar,
                                      ...rightSidebar,
                                      SubComponents: {
                                        ...DefaultSubComponents,
                                        ...SubComponents
                                      }
                                    };
    return [Component, rest];
  }, [rightSidebar]);

// APPLY CLICK LISTENER TO MAP TO ALLOW PINNED HOVER COMPS
  const isPinnable = React.useMemo(() => {
    return activeLayers.reduce((a, c) => {
      return a || get(c, ["onHover", "isPinnable"], false);
    }, false);
  }, [activeLayers]);

  React.useEffect(() => {
    if (!isPinnable) return;

    state.maplibreMap.on("click", pinHoverComp);

    return () => { state.maplibreMap.off("click", pinHoverComp); }
  }, [state.maplibreMap, pinHoverComp, isPinnable]);

// GET HOVER COMP DATA
  const { HoverComps, ...hoverData } = React.useMemo(() => {
    if (!state.maplibreMap) {
      return { hovering: false };
    };
    const { data, ...rest } = state.hoverData;
    const HoverComps = [...data].sort(
      (a, b) => b.zIndex - a.zIndex
    );
    return { HoverComps, ...rest };
  }, [state.hoverData]);

// GET MODALS
  const Modals = React.useMemo(() => {
    return activeLayers.reduce((a, c) => {
      state.openedModals.forEach(({ layerId, modalId }) => {
        if ((layerId === c.id) && get(c, ["modals", modalId], null)) {
          a.push({
            layer: c,
            key: `${ layerId }-${ modalId }`,
            layerId, modalId,
            ...get(c, ["modals", modalId], {})
          });
        }
      });
      return a;
    }, []);
  }, [activeLayers, state.openedModals]);

// GET LAYER AND MAP ACTIONS
  const Actions = React.useMemo(() => {
    const mas = (mapActions || []).reduce((a, c) => {
      if (c in DefaultMapActions) {
        a.push(DefaultMapActions[c]);
      }
      else if (typeof c === "object") {
        a.push({
          Component: MapAction,
          icon: "fa-solid fa-gear",
          ...c
        });
      }
      return a;
    }, []);
    return activeLayers.reduce((a, c) => {
      get(c, "layerActions", [])
        .forEach(({ Component = LayerAction, wrapper = null, ...action }) => {
          a.push({
            layer: c,
            Component: wrapper ? wrapper(Component) : Component,
            ...action
          });
        })
      return a;
    }, mas);
  }, [mapActions, activeLayers]);

  const projectLngLat = React.useCallback(lngLat => {
    if (!state.maplibreMap) return { x: 0, y: 0 };
    return state.maplibreMap.project(lngLat);
  }, [state.maplibreMap]);

  const [ref, setRef] = React.useState(null);
  const size = useSetSize(ref);

  const MapActions = React.useMemo(() => {
    return {
      toggleLayerVisibility,
      updateLayerState,
      activateLayer,
      deactivateLayer,
      updateFilter,
      startLayerLoading,
      stopLayerLoading,
      setMapStyle,
      setResourcesLoaded,
      updateLegend,
      openModal,
      closeModal,
      bringModalToFront,
      createDynamicLayer,
      destroyDynamicLayer,
      resetView,
      goHome
    }
  }, [toggleLayerVisibility, updateLayerState,
      activateLayer, deactivateLayer, updateFilter,
      startLayerLoading, stopLayerLoading,
      setMapStyle, setResourcesLoaded, updateLegend,
      openModal, closeModal, bringModalToFront,
      createDynamicLayer, destroyDynamicLayer,
      resetView, goHome
  ]);

  const theme = useTheme();

  return (
    <div className={ `block relative w-full h-full max-w-full max-h-full overflow-visible ${ theme.text }` }>
      <div ref={ setRef } id={ containerId.current } className="w-full h-full relative"/>

      <div id={ `${ containerId.current }-box-select-blocker` }
         className="absolute inset-0 z-50 pointer-events-none"/>

      { Modals.map(({ Component, key, startPos, ...rest }) => (
          <Modal key={ key } { ...rest }
            MapActions={ MapActions }
            startPos={ startPos }
          >
            <Component { ...rest }
              legend={ state.legend }
              maplibreMap={ state.maplibreMap }
              MapActions={ MapActions }
              activeLayers={ activeLayers }
              inactiveLayers={ inactiveLayers }
              mapStyles={ state.mapStyles }
              styleIndex={ state.styleIndex }
              layerVisibility={ state.layerVisibility }
              layerProps={ layerProps }
              layerState={ state.layerState }
              filterUpdate={ state.filterUpdate }
              layersLoading={ state.layersLoading }
              loadingLayers={ loadingLayers }
              resourcesLoaded={ state.resourcesLoaded }
              openedModals={ state.openedModals }/>
          </Modal>
        ))
      }

      <div className="flex absolute inset-0 pointer-events-none p-4">

        { !leftSidebar ? null :
          <div className="h-full relative pr-4">
            <LeftSidebar { ...leftSidebarOptions }
              legend={ state.legend }
              maplibreMap={ state.maplibreMap }
              MapActions={ MapActions }
              activeLayers={ activeLayers }
              inactiveLayers={ inactiveLayers }
              mapStyles={ state.mapStyles }
              styleIndex={ state.styleIndex }
              layerVisibility={ state.layerVisibility }
              layerProps={ layerProps }
              layerState={ state.layerState }
              filterUpdate={ state.filterUpdate }
              layersLoading={ state.layersLoading }
              loadingLayers={ loadingLayers }
              resourcesLoaded={ state.resourcesLoaded }
              openedModals={ state.openedModals }/>
          </div>
        }

        <div className="flex-1 relative">
          { [...activeLayers].reverse().map((l, i) => (
              <l.RenderComponent key={ l.id } layer={ l }
                legend={ state.legend }
                isActive={ get(state, ["activeLayers", l.id], true) }
                isVisible={ get(state, ["layerVisibility", l.id], true) }
                isLoading={ Boolean(get(state, ["layersLoading", l.id, "loading"], false)) }
                resourcesLoaded={ Boolean(get(state, ["resourcesLoaded", l.id], false)) }
                maplibreMap={ state.maplibreMap }
                updateHover={ updateHover }
                containerId={ containerId.current }
                MapActions={ MapActions }
                activeLayers={ activeLayers }
                inactiveLayers={ inactiveLayers }
                layerProps={ get(layerProps, l.id, {}) }
                layerState={ get(state, ["layerState", l.id], {}) }
                allLayerProps={ layerProps }
                allLayerState={ state.layerState }
                styleIndex={ state.styleIndex }
                mapStyles={ state.mapStyles }
                layersLoading={ state.layersLoading }
                loadingLayers={ loadingLayers }
                filterUpdate={ state.filterUpdate }
                openedModals={ state.openedModals }/>
            ))
          }
          <div className="absolute bottom-0 left-0 grid grid-cols-1 gap-4">
            { loadingLayers.map(layer => (
                <LoadingIndicator key={ layer.id } layer={ layer }/>
              ))
            }
          </div>
        </div>

        { !Actions.length ? null :
          <div className="h-full relative pl-4">
            <div className="grid grid-cols-1 gap-4">
              { Actions.map(({ Component, ...action }, i) => (
                  <Component key={ i } { ...action }
                    legend={ state.legend }
                    maplibreMap={ state.maplibreMap }
                    MapActions={ MapActions }
                    activeLayers={ activeLayers }
                    inactiveLayers={ inactiveLayers }
                    mapStyles={ state.mapStyles }
                    styleIndex={ state.styleIndex }
                    layerVisibility={ state.layerVisibility }
                    layerProps={ layerProps }
                    layerState={ state.layerState }
                    filterUpdate={ state.filterUpdate }
                    layersLoading={ state.layersLoading }
                    loadingLayers={ loadingLayers }
                    resourcesLoaded={ state.resourcesLoaded }
                    openedModals={ state.openedModals }/>
                ))
              }
            </div>
          </div>
        }

        { !rightSidebar ? null :
          <div className="h-full relative pl-4">
            <RightSidebar { ...rightSidebarOptions }
              legend={ state.legend }
              maplibreMap={ state.maplibreMap }
              MapActions={ MapActions }
              activeLayers={ activeLayers }
              inactiveLayers={ inactiveLayers }
              mapStyles={ state.mapStyles }
              styleIndex={ state.styleIndex }
              layerVisibility={ state.layerVisibility }
              layerProps={ layerProps }
              layerState={ state.layerState }
              filterUpdate={ state.filterUpdate }
              layersLoading={ state.layersLoading }
              loadingLayers={ loadingLayers }
              resourcesLoaded={ state.resourcesLoaded }
              openedModals={ state.openedModals }/>
          </div>
        }

      </div>

      { state.pinnedHoverComps.map(({ HoverComps, data, id, ...hoverData }) => (
          <PinnedHoverComp { ...hoverData } { ...size }
            remove={ removePinnedHoverComp }
            project={ projectLngLat }
            id={ id } key={ id }
          >
            { HoverComps.map(({ Component, data, layer }, i) => (
                <Component key={ layer.id } isPinned
                  legend={ state.legend }
                  layer={ layer }
                  data={ data }
                  maplibreMap={ state.maplibreMap }
                  MapActions={ MapActions }
                  activeLayers={ activeLayers }
                  inactiveLayers={ inactiveLayers }
                  mapStyles={ state.mapStyles }
                  styleIndex={ state.styleIndex }
                  layerVisibility={ state.layerVisibility }
                  layerProps={ layerProps }
                  layerState={ state.layerState }
                  filterUpdate={ state.filterUpdate }
                  layersLoading={ state.layersLoading }
                  loadingLayers={ loadingLayers }
                  resourcesLoaded={ state.resourcesLoaded }
                  openedModals={ state.openedModals }/>
              ))
            }
          </PinnedHoverComp>
        ))
      }

      { !hoverData.hovering ? null :
        <HoverCompContainer { ...hoverData } { ...size } project={ projectLngLat }>
          { HoverComps.map(({ Component, layer, ...rest }, i) =>
              <Component key={ layer.id } layer={ layer } { ...rest }
                legend={ state.legend }
                maplibreMap={ state.maplibreMap }
                MapActions={ MapActions }
                activeLayers={ activeLayers }
                inactiveLayers={ inactiveLayers }
                mapStyles={ state.mapStyles }
                styleIndex={ state.styleIndex }
                layerVisibility={ state.layerVisibility }
                layerProps={ layerProps }
                layerState={ state.layerState }
                filterUpdate={ state.filterUpdate }
                layersLoading={ state.layersLoading }
                loadingLayers={ loadingLayers }
                resourcesLoaded={ state.resourcesLoaded }
                openedModals={ state.openedModals }/>
            )
          }
        </HoverCompContainer>
      }

    </div>
  )
}

export { AvlMap };
