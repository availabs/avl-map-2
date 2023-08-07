import React from "react"

import get from "lodash.get"

import LayersPanel from "./LayersPanel"
import StylesPanel from "./StylesPanel"
import LegendPanel from "./LegendPanel"

import "./animations.css"

import { MultiLevelSelect } from "../uicomponents"

import { useTheme } from "../uicomponents"

export const LayerSidebarContainer = ({ open, children }) => {
  return (
    <div className={ `
        w-full h-full relative ${ open ? "p-0" : "pr-8" }
      ` }
      style={ { transition: "padding 150ms" } }
    >
      <div className={ `w-full h-full max-h-full relative` }>
        { children }
      </div>
    </div>
  )
}

export const LayerSidebarToggle = ({ toggle, open }) => {
  const theme = useTheme();
  return (
    <div className="pointer-events-auto">
      <div onClick={ toggle }
        className={ `
          h-8 w-8 ${ theme.bg } text-2xl
          flex items-center justify-center
          cursor-pointer ${ open ? "rounded-t" : "rounded" }
          pointer-events-auto absolute
          ${ theme.textHighlightHover }
        ` }
        style={ {
          right: open ? "0rem" : "-2rem",
          transition: "right 150ms"
        } }
      >
        <span className={ `fa fa-caret-${ open ? "left" : "right" }` }/>
      </div>
    </div>
  )
}

const DefaultPanelSettings = {
  LayersPanel: {
    icon: "fa-solid fa-layer-group",
    Panel: LayersPanel
  },
  StylesPanel: {
    icon: "fa-solid fa-palette",
    Panel: StylesPanel
  },
  LegendPanel: {
    icon: "fa-sharp fa-solid fa-chart-simple",
    Panel: LegendPanel
  }
}
const DefaultPanels = {
  LayersPanel: LayersPanel,
  StylesPanel: StylesPanel,
  LegendPanel: LegendPanel
}

export const LayerSidebar = ({ startOpen = true, Panels = [], SubComponents, ...props }) => {

  const [ref, setRef] = React.useState(null);
  const [width, setWidth] = React.useState("fit-content");

  React.useEffect(() => {
    if (!ref) return;
    const { width } = ref.getBoundingClientRect();
    setWidth(`${ width }px`);
  }, [ref]);

  const [open, setOpen] = React.useState(startOpen);
  const toggle = React.useCallback(() => {
    setOpen(o => !o);
  }, []);

  const [tabIndex, setTabIndex] = React.useState(0);

  const SidebarPanels = React.useMemo(() => {
    return Panels.reduce((a, c) => {
      if ((typeof c === "string") && (c in DefaultPanelSettings)) {
        a.push(DefaultPanelSettings[c]);
      }
      if (typeof c.Panel === "function") {
        a.push(c);
      }
      if ((typeof c.Panel === "string") && (c.Panel in DefaultPanels)) {
        a.push({
          ...c,
          Panel: DefaultPanels[c.Panel]
        });
      }
      return a;
    }, [])
  }, [Panels]);

  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full relative">
        <SubComponents.LayerSidebarContainer open={ open }>

          <div className={ `flex relative` }>
            <div className={ `flex flex-1 ${ open ? "overflow-visible" : "overflow-hidden" }` }
              style={ {
                width: open ? width : "0px",
                transition: "width 150ms",
                animation: open ? "open 150ms" : null
              } }
            >
              { SidebarPanels.map(({ icon }, i) => (
                  <Tab key={ i } icon={ icon }
                    active={ tabIndex === i }
                    setTabIndex={ setTabIndex }
                    index={ i }/>
                ))
              }
            </div>
            <SubComponents.LayerSidebarToggle open={ open }
              toggle={ toggle }/>
          </div>


          <div className={ `
              absolute top-8 bottom-0
              ${ open ? "overflow-visible" : "overflow-hidden" }
            ` }
            style={ {
              width: open ? width : "0px",
              transition: "width 150ms",
              animation: open ? "open 150ms" : null
            } }
          >

            <div ref={ setRef } className="w-fit h-full">
              <SubComponents.PanelContainer>
                { SidebarPanels.map(({ Panel }, i) => (
                    <div key={ i }
                      className={
                        tabIndex === i ? "block" : "h-0 overflow-hidden invisible"
                      }
                    >
                      <Panel key={ i } { ...props }
                        SubComponents={ SubComponents }/>
                    </div>
                  ))
                }
              </SubComponents.PanelContainer>
            </div>

          </div>

        </SubComponents.LayerSidebarContainer>
      </div>
    </div>
  )
}

export const PanelContainer = ({ children }) => {
  const theme = useTheme();
  return (
    <div className={ `
        w-80 h-full max-h-full p-1 ${ theme.bg } rounded-b
        pointer-events-auto overflow-auto scrollbar-sm
      ` }
    >
      { children }
    </div>
  )
}

const Tab = ({ icon, active, setTabIndex, index }) => {
  const onClick = React.useCallback(e => {
    setTabIndex(index);
  }, [setTabIndex, index]);
  const theme = useTheme();
  return (
    <div onClick={ onClick }
      className={ `
        h-8 w-10 rounded-t mr-1 cursor-pointer pointer-events-auto relative
        ${ active ? theme.bg : theme.bgAccent1 }
      ` }
    >
      { active ?
        <div className="absolute inset-0 flex justify-center items-center">
          <span className={ `${ icon } ${ theme.textHighlight }` }/>
        </div> :
        <div className="absolute inset-0 flex justify-center items-center">
          <span className={ `${ icon } ${ theme.textHighlight }` }/>
          <span className={ `
            absolute inset-0 flex justify-center items-center
            opacity:100 hover:opacity-25 ${ theme.text } ${ icon }
          ` }/>
        </div>
      }
    </div>
  )
}
