import React from "react"

import "./animations.css"

import { useTheme } from "../uicomponents"

const LoadingIndicator = ({ layer }) => {
  const theme = useTheme();
  const {
    icon = "fa-solid fa-spinner",
    color = theme.textHighlight
  } = layer.loadingIndicator;
  return (
    <div className={ `w-64 h-12 flex items-center rounded-l ${ theme.bg } py-2 pr-2 pl-4` }
      style={ {
        borderTopRightRadius: "2rem",
        borderBottomRightRadius: "2rem"
      } }
    >
      <div className="flex-1 font-bold">
        { layer.name }
      </div>
      <div style={ { fontSize: "2rem" } }>
        <span className={ `${ icon } ${ color } fa-spin` }/>
      </div>
    </div>
  )
}
export default LoadingIndicator;
