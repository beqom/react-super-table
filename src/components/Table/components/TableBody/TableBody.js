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
    return this.selectCell(0, -1, e);
  }

  selectCellBelow(e) {
    return this.selectCell(0, 1, e);
  }

  selectCellRight(e) {
    return this.selectCell(1, 0, e);
  }

  selectCellLeft(e) {
    return this.selectCell(-1, 0, e);
  }

  selectCell(columnDelta, rowDelta, e) {
    const { selectedCell = {}, columns, rows } = this.props;
    if (!selectedCell) return;
    if (e) e.preventDefault();

    const selectedColumnIndex = this.props.columns.findIndex(column => column.get('key') === selectedCell.columnKey);
    const selectedRowIndex = this.props.rows.findIndex(row => row.get(this.props.rowKey) === selectedCell.rowKey);

    if (selectedColumnIndex < 0 || selectedRowIndex < 0) return this.props.onUnselectCell();

    const nextColumnIndex = Math.max(Math.min(columns.size, selectedColumnIndex + columnDelta), 0);
    const nextRowIndex = Math.max(Math.min(rows.size, selectedRowIndex + rowDelta), 0);

    if (selectedColumnIndex === nextColumnIndex && selectedRowIndex === nextRowIndex) return;

    const columnKey = this.props.columns.getIn([nextColumnIndex, 'key']);
    const rowKey = this.props.rows.getIn([nextRowIndex, this.props.rowKey]);

    this.props.onSelectCell(columnKey, rowKey);
  }

  render() {
    const { columns, rows, selectedCell = {} } = this.props;

    const tbodies = rows.map(row => {
      const rowKey = row.get(this.props.rowKey);
      const selectedColumnKey = selectedCell.rowKey === rowKey ? selectedCell.columnKey : null ;
      const selectedCellEditing = selectedCell.rowKey === rowKey ? selectedCell.editing : false;
      return (
        <TableRow
          key={rowKey}
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

    return (
      <table className="TableBody">
        <tbody>{tbodies}</tbody>
      </table>
    );
  }
}

TableBody.displayName = 'TableBody';

TableBody.defaultProps = {};

TableBody.propTypes = {

  onEditCell: PropTypes.func.isRequired,
  onUnselectCell: PropTypes.func.isRequired,
  onSelectCell: PropTypes.func.isRequired,
  onChangeSelectRow: PropTypes.func,

};

export default TableBody;
