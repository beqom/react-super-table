import React from "react";
import omit from "lodash/omit";
import classnames from 'classnames';
/*
const selectedStyles = css`
  z-index: 10;
  box-shadow: inset 0 0 0 2px #3498db, 0 0 3px 0 rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  min-height: 100%;
  max-width: 100%;
  max-height: 100%;
`;
const editingStyles = css`
  box-shadow: inset 0 0 0 2px #3498db, 0 0 7px 0 rgba(0, 0, 0, 0.7);
  min-width: 100%;
  min-height: 100%;
  max-width: 200px;
  max-height: 150px;
  overflow: auto;
  width: auto;
  height: auto;
  resize: none;
`;

const TableCellStyled = styled.div`
  outline: 0;
  padding: 1px 2px;
  background: white;
  transition: box-shadow .1s;
  overflow: hidden;
  cursor: default;
  ${props => props.selected ? selectedStyles : ''}
  ${props => props.editing ? editingStyles : ''}
`;
*/

class TableCell extends React.Component {
  constructor() {
    super();

    this.setContentNode = this.setContentNode.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if(nextProps.children !== this.props.children) return true;
    if(nextProps.selected !== this.props.selected) return true;
    if(nextProps.editing !== this.props.editing) return true;
    return false;
  }

  componentDidUpdate(prevProps) {
    const becameSelected = !prevProps.selected && this.props.selected;
    const becameEditing = !prevProps.editing && this.props.editing;
    if(becameSelected || becameEditing) {
      this.focus();
      if(becameEditing) this.setCursorAtTheEnd();
    }
  }

  setCursorAtTheEnd() {
    let range = document.createRange();
    range.selectNodeContents(this.contentNode);
    range.collapse(false);

    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  focus() {
    this.contentNode.blur();
    this.contentNode.focus();
  }

  setContentNode(node) {
    this.contentNode = node;
  }

  render() {
    const { children, selected, editing } = this.props;
    const props = omit(this.props, ["children", "selected", "editing"]);
    const editingProps = editing
      ? { contentEditable: 'true', dangerouslySetInnerHTML: { __html: children }}
      : { children };

    return (
      <div
        {...props}
        className={classnames('cell-content', {'cell-content--selected': selected})}
        tabIndex="0"
        ref={this.setContentNode}
        {...editingProps}
      />
    );
  }
}

export default TableCell;
