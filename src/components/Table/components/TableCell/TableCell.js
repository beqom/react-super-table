import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';

import './TableCell.scss';

class TableCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };

    this.setContentNode = this.setContentNode.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleEditCell = this.handleEditCell.bind(this);
    this.handleTexteareaChange = this.handleTexteareaChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.value !== this.state.value) return true;
    if (nextProps.value !== this.props.value) return true;
    if (nextProps.selected !== this.props.selected) return true;
    if (nextProps.editing !== this.props.editing) return true;
    if (nextProps.style !== this.props.style) return true;
    return false;
  }

  componentDidUpdate(prevProps) {
    const becameSelected = !prevProps.selected && this.props.selected;
    const becameEditing = !prevProps.editing && this.props.editing;
    const becameNotSelected = prevProps.selected && !this.props.selected;
    const becameNotEditing = prevProps.editing && !this.props.editing;
    if (!this.props.screenReaderMode) {
      if (becameSelected || becameEditing) {
        this.focus();
        if (becameEditing) this.setCursorAtTheEnd();
      }

      if (becameNotSelected || becameNotEditing) {
        this.handleEditCell();
      }
    }
  }

  setCursorAtTheEnd() {
    if (this.contentNode) {
      const range = document.createRange();
      range.selectNodeContents(this.contentNode);
      range.collapse(false);

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  setContentNode(node) {
    this.contentNode = node;
  }

  blur() {
    if (this.contentNode) this.contentNode.blur();
  }

  focus() {
    this.blur();
    if (this.contentNode) this.contentNode.focus();
  }

  handleChange() {
    const value = this.contentNode.innerHTML;
    this.setState({ value });
  }

  handleTexteareaChange(e) {
    this.setState({ value: e.target.value });
  }

  handleEditCell() {
    if (this.state.value !== this.props.value) {
      const { rowKey, columnKey, onEditCell } = this.props;
      onEditCell(rowKey, columnKey, this.state.value);
    }
  }

  render() {
    const { value, selected, editing, editable, formula, screenReaderMode } = this.props;
    const editingProps = editing
      ? {
          contentEditable: 'true',
          dangerouslySetInnerHTML: { __html: this.props.value },
          onBlur: this.handleEditCell,
          onInput: this.handleChange,
        }
      : { children: value };

    const className = classnames('TableCell__content', {
      'TableCell__content--screen-reader': screenReaderMode,
      'TableCell__content--selected': selected,
      'TableCell__content--editing': editing,
      'TableCell__content--readonly': !editable,
      'TableCell__content--formula': formula,
    });

    return (
      <td className={classnames('TableCell', { 'TableCell--focused': selected })}>
        {screenReaderMode ? (
          <textarea
            disabled={!editable}
            className={className}
            style={this.props.style}
            onChange={this.handleTexteareaChange}
            value={this.state.value}
            onBlur={this.handleEditCell}
          />
        ) : (
          <div
            style={this.props.style}
            {...this.props.events}
            className={className}
            tabIndex="0"
            ref={this.setContentNode}
            {...editingProps}
          />
        )}
      </td>
    );
  }
}

TableCell.displayName = 'TableCell';

TableCell.defaultProps = {};

TableCell.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
  rowKey: PropTypes.string.isRequired,
  columnKey: PropTypes.string.isRequired,
  onEditCell: PropTypes.func.isRequired,
};

export default TableCell;
