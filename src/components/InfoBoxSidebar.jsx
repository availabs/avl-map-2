import React from "react"

import get from "lodash/get"

import { HeaderButton } from "./LayersPanel"

import {
  LegendContainer,
  Legend,
  useTheme
} from "../uicomponents"

export const InfoBoxSidebarContainer = ({ open, children }) => {
  const theme = useTheme();
  return (
    <div className="relative h-full">
      <div className={ `
          w-96 ${ theme.bg } rounded pointer-events-auto
          max-h-full h-fit scrollbar-sm overflow-auto
        ` }
      >
        { children }
      </div>
    </div>
  )
}

export const InfoBoxSidebar = allProps => {
  const {
    activeLayers,
    legend,
    ...props
  } = allProps;

  const LayersWithInfoBoxes = React.useMemo(() => {
    return activeLayers.reduce((a, c) => {
      if (get(c, ["infoBoxes", "length"], 0)) {
        a.push(c);
      }
      return a;
    }, [])
  }, [activeLayers]);

  return (
    <InfoBoxSidebarContainer>
      { !legend.isActive ? null :
        <LegendContainer { ...legend }>
          <Legend { ...legend }/>
        </LegendContainer>
      }
      { !LayersWithInfoBoxes.length ? null :
        <div className={ `${ legend.isActive ? "px-1 pb-1" : "p-1" } grid grid-cols-1 gap-1` }>
          { LayersWithInfoBoxes.reduce((a, c) => {
              a.push(
                ...c.infoBoxes.map(({ Component, Header, ...options }, i) => (
                  <InfoBoxContainer key={ `${ c.id }-${ i }` }
                    Header={ Header }
                    { ...props } { ...options }
                    layer={ c }
                  >
                    <Component { ...props } layer={ c }/>
                  </InfoBoxContainer>
                ))
              )
              return a;
            }, [])
          }
        </div>
      }
    </InfoBoxSidebarContainer>
  )
}

const HeaderContainer = ({ open, toggleOpen, children }) => {
  const theme = useTheme();
  return (
    <div onClick={ toggleOpen }
      className={ `
        p-1 font-bold flex ${ theme.bgAccent2 } rounded-t cursor-pointer
        ${ open ? `border-b ${ theme.border }` : "rounded-b" }
      ` }
    >
      <div className="flex-1">
        { children }
      </div>
      <div>
        <span className="px-2 py-1">
          <span className={ `fa fa-${ open ? "minus" : "plus" }` } />
        </span>
      </div>
    </div>
  )
}

export const InfoBoxContainer = ({ Header = null, children, startOpen = true, ...props }) => {
  const [open, setOpen] = React.useState(startOpen);
  const toggleOpen = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);
  const theme = useTheme();
  return (
    <div className={ `rounded border ${ theme.border }` }>
      { !Header ? null :
        <HeaderContainer open={ open } toggleOpen={ toggleOpen }>
          { typeof Header === "function" ? <Header { ...props }/> : Header }
        </HeaderContainer>
      }
      { !open ? null :
        <div className="p-1">
          { children }
        </div>
      }
    </div>
  )
}
