import React from "react"

import get from "lodash.get"
import isequal from "lodash.isequal"
import {
  range as d3range,
  extent as d3extent,
  nice as d3nice,
  ticks as d3ticks
} from "d3-array"
import {
  scaleQuantize,
  scaleQuantile,
  scaleThreshold,
  scaleOrdinal
} from "d3-scale"
import { format as d3format } from "d3-format"

import { ColorRangesByType, ColorBar } from "../utils/colors"

import { MultiLevelSelect } from "../uicomponents"

import { useTheme } from "../uicomponents"

const getScale = (type, domain, range) => {
  switch (type) {
    case "quantize":
      return scaleQuantize()
        .domain(d3extent(domain))
        .range(range)
    case "quantile":
      return scaleQuantile()
        .domain(domain)
        .range(range)
    case "threshold":
      return scaleThreshold()
        .domain(domain)
        .range(range)
    case "ordinal":
      return scaleOrdinal()
        .domain(domain)
        .range(range)
  }
}

export const LegendContainer = ({ name, children }) => {
  const theme = useTheme();
  return (
    <div className={ `p-1 sticky top-0 ${ theme.bg }` }>
      <div className={ `p-1 ${ theme.bgAccent2 } border ${ theme.border } rounded pointer-events-auto` }>
        <div>{ name }</div>
        <div>{ children }</div>
      </div>
    </div>
  )
}
const OrdinalLegend = ({ domain, range, format }) => {
  const Scale = React.useMemo(() => {
    return getScale("ordinal", domain, range);
  }, [domain, range]);
  const Format = React.useMemo(() => {
    if (typeof format === "function") return format;
    return d3format(format);
  }, [format]);
  return (
    <div>
      <div className="grid gap-1"
        style={ {
          gridTemplateColumns: `repeat(${ domain.length }, minmax(0, 1fr))`
        } }
      >
        { domain.map(d => (
            <ColorBar key={ d } colors={ [Scale(d)] } height={ 3 }/>
          ))
        }
      </div>
      <div className="grid gap-1 text-right"
        style={ {
          gridTemplateColumns: `repeat(${ domain.length }, minmax(0, 1fr))`
        } }
      >
        { domain.map(d => <div key={ d } className="pr-1">{ d }</div>) }
      </div>
    </div>
  )
}
const NonOrdinalLegend = ({ type, domain, range, format = ",d" }) => {
  const Scale = React.useMemo(() => {
    return getScale(type, domain, range);
  }, [type, domain, range]);
  const Format = React.useMemo(() => {
    if (typeof format === "function") return format;
    return d3format(format);
  }, [format]);
  return (
    <div>
      <ColorBar colors={ range } height={ 3 }/>
      <LegendTicks type={ type }
        scale={ Scale }
        format={ Format }/>
    </div>
  )
}
export const Legend = ({ type, ...props }) => {
  return (
    type === "ordinal" ?
      <OrdinalLegend { ...props }/> :
      <NonOrdinalLegend type={ type } { ...props }/>
  )
}

const LegendTicks = ({ type, scale, format }) => {
  const size = scale.range().length;
  return type === "threshold" ? (
    <div className="flex text-left">
      <div style={ { width: `${ 100 / size }%` } }/>
      { scale.domain().map((d, i) => (
          <div key={ d }
            className="pl-1"
            style={ { width: `${ 100 / size }%` } }
          >
            { format(d) }
          </div>
        ))
      }
    </div>
  ) : (
    <div className="flex text-right">
      { scale.range().map((r, i) => (
          <div key={ r }
            className="pr-1"
            style={ { width: `${ 100 / size }%` } }
          >
            { format(scale.invertExtent(r)[1]) }
          </div>
        ))
      }
    </div>
  )
}

const Reducer = (state, update) => {
  const { action, ...payload } = update;
  switch (action) {
    case "update":
      return {
        ...state,
        ...payload
      }
    default:
      return state;
  }
}
const Init = legend => {
  return { ...legend };
}

const LegendPanel = ({ legend, MapActions }) => {

  const [state, dispatch] = React.useReducer(Reducer, legend, Init);

  React.useEffect(() => {
    dispatch({
      action: "update",
      size: legend.range.length,
      ...legend
    })
  }, [legend]);

  const updateState = React.useCallback((key, value) => {
    dispatch({
      action: "update",
      [key]: value
    })
  }, []);

  const updateLegendType = React.useCallback(t => {
    const { type, ...legend } = state;
    MapActions.updateLegend({ ...legend, type: t });
  }, [MapActions.updateLegend, state]);

  const updateLegendColors = React.useCallback(colors => {
    const { range, ...legend } = state;
    MapActions.updateLegend({ ...legend, range: colors });
  }, [MapActions.updateLegend, state]);

  const {
    type,
    domain,
    range,
    format
  } = legend;

  const [open, setOpen] = React.useState(-1);

  const theme = useTheme();

  return (
    <div className="grid grid-cols-1 gap-1">

      <div className="font-bold text-lg text-center">
        Legend Controls
      </div>

      <div className={ `rounded ${ theme.bgAccent2 } border ${ theme.border }` }>
        <div className="px-2 py-1">Current</div>
        <div className="px-2 pb-2">
          <ColorBar height={ 3 } colors={ legend.range }/>
        </div>
        <TypeSelector type={ legend.type }
          updateLegend={ updateLegendType }/>
      </div>

      { Object.keys(ColorRangesByType).map((type, i) => (
          <ColorCategory key={ type } type={ type }
            startSize={ range.length }
            colors={ ColorRangesByType[type] }
            updateLegend={ updateLegendColors }
            updateState={ updateState }
            isOpen={ open === i } setOpen={ setOpen } index={ i }
            current={ legend.range }/>
        ))
      }

    </div>
  )
}
export default LegendPanel

const LegendTypes = [
  { value: "quantize", name: "Quantize" },
  { value: "quantile", name: "Quantile" },
  { value: "threshold", name: "Threshold" },
  { value: "ordinal", name: "Ordinal" }
]

const TypeSelector = ({ type, updateLegend }) => {
  const onChange = React.useCallback(t => {
    updateLegend(t);
  }, [updateLegend])
  return (
    <div className="flex items-center p-1">
      <div className="flex-0 mr-1">Type:</div>
      <div className="flex-1">
        <MultiLevelSelect
          removable={ false }
          options={ LegendTypes }
          displayAccessor={ t => t.name }
          valueAccessor={ t => t.value }
          onChange={ onChange }
          value={ type }/>
      </div>
    </div>
  )
}

const LegendSizes = d3range(3, 13);

const SizeSelector = ({ size, sizes, setSize }) => {
  const theme = useTheme();
  return (
    <div className={ `flex items-center p-1 rounded border ${ theme.border }` }>
      <div className="flex-0 mr-1">Size:</div>
      <div className="flex-1">
        <MultiLevelSelect
          removable={ false }
          options={ sizes }
          onChange={ setSize }
          value={ size }/>
      </div>
    </div>
  )
}

const ColorCategory = props => {

  const {
    type,
    colors,
    startSize,
    updateLegend,
    updateState,
    isOpen,
    setOpen,
    index,
    current
  } = props;

  const [size, setSize] = React.useState(startSize);

  const toggleOpen = React.useCallback(() => {
    setOpen(prev => prev === index ? -1 : index);
  }, [index]);

  const Colors = React.useMemo(() => {
    return Object.keys(colors)
      .reduce((a, c) => {
        const range = get(colors, [c, size], null);
        if (range) {
          a.push(range);
        }
        return a;
      }, [])
  }, [colors, size]);

  const Sizes = React.useMemo(() => {
    const sizes = new Set();
    Object.keys(colors)
      .forEach(name => {
        Object.keys(colors[name])
          .forEach(size => sizes.add(+size));
      });
    return [...sizes];
  }, [colors]);

  React.useEffect(() => {
    if (Sizes.includes(startSize)) {
      setSize(startSize);
    }
  }, [startSize, Sizes]);

  const select = React.useCallback(colors => {
    updateLegend(colors);
  }, [updateLegend]);

  const theme = useTheme();

  return (
    <div className={ `rounded ${ theme.bgAccent2 } border ${ theme.border }` }>
      <div onClick={ toggleOpen }
        className={ `
          flex items-center ${ theme.border } cursor-pointer px-1
          ${ isOpen ? "border-b" : "" }
        ` }
      >
        <span className="flex-1">
          { type }
        </span>
        <span className="px-2 py-1 flex-0">
          <span className={ `fa fa-${ isOpen ? "minus" : "plus" }` } />
        </span>
      </div>
      { !isOpen ? null :
        <div className="grid grid-cols-1 gap-2 p-2">

            <SizeSelector size={ size }
              sizes={ Sizes }
              setSize={ setSize }/>

            { Colors.map((colors, i) => (
                <ColorSelector key={ i }
                  colors={ colors }
                  select={ select }
                  isActive={ isequal(current, colors) }/>
              ))
            }

        </div>
      }
    </div>
  )
}

const ColorSelector = ({ colors, select, isActive }) => {
  const onClick = React.useCallback(() => {
    select(colors);
  }, [select, colors]);
  return (
    <div onClick={ onClick }
      className={ `
        cursor-pointer rounded outline outline-2 overflow-hidden
        ${ isActive ? "outline-current" : "outline-transparent" }
      ` }
    >
      <ColorBar colors={ colors } height={ 3 }/>
    </div>
  )
}
