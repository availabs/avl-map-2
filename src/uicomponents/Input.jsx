import React from "react"

import { useTheme } from "./theme"

export const Input = ({ onChange, className = "input", ...props }) => {
  const doOnChange = React.useCallback(e => {
    onChange(e.target.value);
  }, [onChange]);
  const theme = useTheme();
  return (
    <input { ...props } onChange={ doOnChange }
      className={ theme[className] }/>
  )
}
