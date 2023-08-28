import React from "react"

import { useTheme } from "./index"

export const BooleanSlider = ({ value, onChange }) => {
  const toggle = React.useCallback(e => {
    onChange(!value);
  }, [onChange, value]);
  const theme = useTheme();
  return (
    <div onClick={ toggle }
      className={ `
        px-4 py-1 h-8 rounded flex items-center w-full cursor-pointer
        ${ theme.bgInput }
      ` }
    >
      <div className={ `
          rounded h-2 relative flex flex-1 items-center
          ${ theme.bgAccent2 }
        ` }
      >
        <div className={ `
            w-4 h-4 rounded absolute
            ${ Boolean(value) ? theme.bgHighlight : theme.bgAccent3 }
          ` }
          style={ {
            left: Boolean(value) ? "100%" : "0%",
            transform: "translateX(-50%)",
            transition: "left 150ms"
          } }/>
      </div>
    </div>
  )
}