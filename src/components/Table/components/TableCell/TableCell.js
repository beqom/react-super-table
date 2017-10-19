import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';

import './TableCell.scss';

class TableCell extends React.Component {
  constructor() {
    super();

    this.setContentNode = this.setContentNode.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.children !== this.props.children) return true;
    if (nextProps.selected !== this.props.selected) return true;
    if (nextProps.editing !== this.props.editing) return true;
    if (nextProps.style !== this.props.style) return true;
    return false;
  }

  componentDidUpdate(prevProps) {
    const becameSelected = !prevProps.selected && this.props.selected;
    const becameEditing = !prevProps.editing && this.props.editing;
    if (becameSelected || becameEditing) {
      this.focus();
      if (becameEditing) this.setCursorAtTheEnd();
    }
  }

  setCursorAtTheEnd() {
    const range = document.createRange();
    range.selectNodeContents(this.contentNode);
    range.collapse(false);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  setContentNode(node) {
    this.contentNode = node;
  }

  focus() {
    this.contentNode.blur();
    this.contentNode.focus();
  }

  render() {
    const { children, selected, editing } = this.props;
    const props = omit(this.props, ['children', 'selected', 'editing']);
    const editingProps = editing
      ? { contentEditable: 'true', dangerouslySetInnerHTML: { __html: children } }
      : { children };

    return (
      <div
        {...props}
        className={classnames('TableCell', { 'TableCell--selected': selected })}
        tabIndex="0"
        ref={this.setContentNode}
        {...editingProps}
      />
    );
  }
}


TableCell.displayName = 'TableCell';

TableCell.defaultProps = {
};

TableCell.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

export default TableCell;
