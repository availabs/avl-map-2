import React from "react"

import { useTheme } from "../uicomponents"

const StylePanel = ({ mapStyle, styleIndex, isActive, setMapStyle }) => {
  const onClick = React.useCallback(e => {
    setMapStyle(styleIndex);
  }, [styleIndex, setMapStyle]);
  const theme = useTheme();
  return (
    <div onClick={ isActive ? null : onClick }
      className={ `
        flex items-center p-1 border ${ theme.border } rounded ${ theme.bgAccent2 }
        ${ isActive ? `border-r-8 ${ theme.borderHighlight }` : `cursor-pointer ${ theme.bgAccent3Hover }` }
      ` }
    >
      <div className="ml-1 flex-1 h-full flex items-center">
        { mapStyle.name }
      </div>
    </div>
  )
}

const StylesPanel = ({ mapStyles, styleIndex, MapActions }) => {
  return (
    <div className="grid grid-cols-1 gap-1">
      <div className="font-bold text-lg text-center">
        Map Style Selector
      </div>
      { mapStyles.map((ms, i) => (
          <StylePanel key={ i } mapStyle={ ms }
            isActive={ i === styleIndex }
            setMapStyle={ MapActions.setMapStyle }
            styleIndex={ i }/>
        ))
      }
    </div>
  )
}
export default StylesPanel
