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
    this.setTexteareaNode = this.setTexteareaNode.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleEditCell = this.handleEditCell.bind(this);
    this.handleTexteareaChange = this.handleTexteareaChange.bind(this);
    this.handleSubmitValue = this.handleSubmitValue.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
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
    const becameNotEditing = prevProps.editing && !this.props.editing;

    if (becameSelected || (becameNotEditing && this.props.selected)) {
      this.focus();
    }

    if (becameEditing) {
      this.focusTextarea();
    }
  }

  setContentNode(node) {
    this.contentNode = node;
  }

  setTexteareaNode(node) {
    this.textareaNode = node;
  }

  handleSelect() {
    const { selected, rowKey, columnKey, onSelect } = this.props;
    if (!selected) onSelect(columnKey, rowKey);
  }

  blur() {
    this.blur();
    if (this.contentNode) this.contentNode.blur();
  }

  focus() {
    if (this.contentNode) this.contentNode.focus();
  }

  focusTextarea() {
    if(this.textareaNode) {
      this.textareaNode.focus();
      this.textareaNode.style.minHeight = `${this.textareaNode.scrollHeight}px`;
    }
  }

  handleChange() {
    const value = this.contentNode.innerHTML;
    this.setState({ value });
  }

  handleTexteareaChange(e) {
    this.setState({ value: e.target.value });
  }

  handleEditCell(e) {
    e.stopPropagation();
    const { rowKey, columnKey, onEditCell } = this.props;
    onEditCell(columnKey, rowKey);
  }

  handleSubmitValue() {
    const { columnKey, rowKey, onChangeCell, value } = this.props;
    if (this.state.value !== value && onChangeCell) {
      onChangeCell(columnKey, rowKey, this.state.value);
    }
  }

  render() {
    const { selected, editing, editable, formula } = this.props;

    const className = classnames('TableCell__content', {
      'TableCell__content--selected': selected,
      'TableCell__content--editing': editing,
      'TableCell__content--readonly': !editable,
      'TableCell__content--formula': formula,
    });

    return (
      <td className={classnames('TableCell', { 'TableCell--focused': selected })}>
        <div
          ref={this.setContentNode}
          className={className}
          style={this.props.style}
          onClick={this.handleSelect}
          onKeyDown={this.props.onKeyDown}
          tabIndex={selected ? '0' : '-1'}
          role="button"
        >
          {editable ? (
            <button className="TableCell__value" onClick={this.handleEditCell}>
              {this.props.value}
            </button>
          ) : (
            this.props.value
          )}
          {editable && (
            <textarea
              ref={this.setTexteareaNode}
              className="TableCell__textarea"
              style={this.props.style}
              onChange={this.handleTexteareaChange}
              value={this.state.value}
              onBlur={this.handleSubmitValue}
            />
          )}
        </div>
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
