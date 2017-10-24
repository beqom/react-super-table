import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Types from '../../Types';
import TableRow from '../TableRow';

import './TableBody.scss';

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.hoveredRowKey !== nextProps.hoveredRowKey) return true;
    if (this.props.columns !== nextProps.columns) return true;
    if (this.props.rows !== nextProps.rows) return true;
    if (this.props.selectedCell !== nextProps.selectedCell) return true;
    return false;
  }

  handleKeyPress(e) {
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    switch (e.key) {
      case 'ArrowUp':
        return this.selectCellAbove(e);
      case 'ArrowDown':
        return this.selectCellBelow(e);
      case 'ArrowLeft':
        return this.selectCellLeft(e);
      case 'ArrowRight':
        return this.selectCellRight(e);

      case 'Tab': {
        if (e.shiftKey) return this.selectCellLeft(e);
        return this.selectCellRight(e);
      }
      case 'Enter': {
        e.preventDefault();
        if (selectedCell.editing) return this.selectCellBelow();
        return this.props.onEditSelectedCell();
      }
      default:
        return this.props.onEditSelectedCell();
    }
  }

  selectCellAbove(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(0, -1);
  }

  selectCellBelow(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(0, 1);
  }

  selectCellRight(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(1, 0);
  }

  selectCellLeft(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(-1, 0);
  }

  render() {
    const { columns, rows, noTable, selectedCell = {}, screenReaderMode } = this.props;

    const tbodies = rows.map(row => {
      const rowKey = row.get(this.props.rowKey);
      const selectedColumnKey = selectedCell.rowKey === rowKey ? selectedCell.columnKey : null;
      const selectedCellEditing = selectedCell.rowKey === rowKey ? selectedCell.editing : false;
      return (
        <TableRow
          key={rowKey}
          screenReaderMode={screenReaderMode}
          rowKey={rowKey}
          row={row}
          columns={columns}
          selectedColumnKey={selectedColumnKey}
          onSelectCell={this.props.onSelectCell}
          onEditSelectedCell={this.props.onEditSelectedCell}
          onChangeSelectRow={this.props.onChangeSelectRow}
          onEditCell={this.props.onEditCell}
          selectedCellEditing={selectedCellEditing}
          handleKeyPress={this.handleKeyPress}
          onSetHoveredRowKey={this.props.onSetHoveredRowKey}
          hovered={this.props.hoveredRowKey === rowKey}
        />
      );
    });

    const tbody = <tbody>{tbodies}</tbody>;

    if (noTable) return tbody;

    return (
      <table className="TableBody">
        {tbody}
      </table>
    );
  }
}

TableBody.displayName = 'TableBody';

TableBody.defaultProps = {};

TableBody.propTypes = {
  onEditCell: PropTypes.func.isRequired,
  onSelectCell: PropTypes.func.isRequired,
  onChangeSelectRow: PropTypes.func,
  onSwitchSelectedCell: PropTypes.func.isRequired,

  noTable: PropTypes.bool,
};

export default TableBody;
