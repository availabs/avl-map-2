import React from "react"

import get from "lodash.get"
import isequal from "lodash.isequal"
import { range as d3range } from "d3-array"

import { ColorRangesByType, ColorBar } from "../utils/colors"

import { MultiLevelSelect } from "../uicomponents"

import { useTheme } from "../uicomponents"

const LegendPanel = ({ legend, MapActions }) => {

  const updateLegendType = React.useCallback(type => {
    MapActions.updateLegend({ ...legend, type });
  }, [MapActions.updateLegend]);

  const updateLegendRange = React.useCallback(range => {
    MapActions.updateLegend({ ...legend, range });
  }, [MapActions.updateLegend]);

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
            updateLegend={ updateLegendRange }
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
  }, [updateLegend]);
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
