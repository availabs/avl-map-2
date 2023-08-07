import React from "react"

import { Draggable } from "./Draggable"

import { useTheme } from "../uicomponents"

const DefaultHeader = ({ children, closeModal, dragHandle, bringModalToFront }) => {
  const theme = useTheme();
  return (
    <div id={ dragHandle }
      onClick={ bringModalToFront }
      className={ `
        p-1 font-bold ${ theme.bgAccent2 } rounded-t flex
        border-b ${ theme.border } cursor-grabbing
      ` }
    >
      <div className="flex-1">
        { children }
      </div>
      <div>
        <span onClick={ closeModal }
          className="px-2 py-1 hover:bg-gray-400 rounded cursor-pointer"
        >
          <span className="fa fa-close"/>
        </span>
      </div>
    </div>
  )
}

const DefaultModalContainer = ({ children }) => {
  const theme = useTheme();
  return (
    <div className={ `p-1 rounded ${ theme.bg } w-fit` }>
      <div className={ `border ${ theme.border } rounded whitespace-nowrap` }>
        { children }
      </div>
    </div>
  )
}
const DefaultModalContentContainer = ({ children }) => {
  return (
    <div className="p-1">
      { children }
    </div>
  )
}

export const Modal = allProps => {
  const {
    Header = null,
    ModalContainer = DefaultModalContainer,
    ModalContentContainer = DefaultModalContentContainer,
    startPos,
    MapActions,
    layerId,
    modalId,
    children,
    ...props
  } = allProps;

  const dragHandle = React.useMemo(() => {
    return `modal-drag-handle-${ layerId }-${ modalId }`;
  }, [layerId, modalId]);

  const closeModal = React.useCallback(() => {
    MapActions.closeModal(layerId, modalId);
  }, [layerId, modalId, MapActions.closeModal]);

  const bringModalToFront = React.useCallback(() => {
    MapActions.bringModalToFront(layerId, modalId);
  }, [layerId, modalId, MapActions.bringModalToFront]);

  return (
    <Draggable startPos={ startPos }
      dragHandle={ dragHandle }
    >
      <ModalContainer>
        { typeof Header === "function" ?
            <Header { ...props }
              closeModal={ closeModal }
              bringModalToFront={ bringModalToFront }
              MapActions={ MapActions }
              dragHandle={ dragHandle }/> :
            <DefaultHeader
              closeModal={ closeModal }
              bringModalToFront={ bringModalToFront }
              dragHandle={ dragHandle }
            >
              { Header }
            </DefaultHeader>
        }
        <ModalContentContainer>
          { children }
        </ModalContentContainer>
      </ModalContainer>
    </Draggable>
  )
}
