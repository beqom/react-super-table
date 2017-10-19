import React from 'react';
import classnames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import TableCell from '../TableCell';

import './TableBody.scss';

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedCell: null,
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.fields !== nextProps.fields) return true;
    if (this.props.rows !== nextProps.rows) return true;
    if (this.props.selectedCell !== nextProps.selectedCell) return true;
    if (this.props.colsWidth !== nextProps.colsWidth) return true;
    if (this.props.rowsHeight !== nextProps.rowsHeight) return true;
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

  renderSelectRow() {
    if (!this.props.onChangeSelectRow) return null;

    return (
      <th className="TableBody__cell">
        <div className="TableBody__cell-content TableBody__cell-content--select">
          <input type="checkbox" onChange={this.props.onChangeSelectRow} />
        </div>
      </th>
    );
  }

  render() {
    const { columns, rows, rowKey, selectedCell = {} } = this.props;

    const tbodies = rows.map(row => {
      const rowKey = row.get(this.props.rowKey);
      const tds = columns.map(column => {
        const columnKey = column.get('key');
        const formatter = column.get('formatter');
        const width = column.getIn(['layout', 'width']);
        const selected = selectedCell.columnKey === columnKey && selectedCell.rowKey === rowKey;
        const onSelect = () => this.props.onSelectCell(columnKey, rowKey);

        const onClick = selected ? this.props.onEditSelectedCell : onSelect;
        const editable = column.get('editable') && !column.get('formula')
        const events = { onKeyDown: this.handleKeyPress, onClick };

        return (
          <td
            key={columnKey}
            className={classnames('TableBody__cell', { 'TableBody__cell--focused': selected })}
          >
            <TableCell
              selected={selected}
              editing={selected && selectedCell.editing}
              {...events}
              style={selected && selectedCell.editing ? {} : { width }}
              editable={editable}
              formula={column.get('formula')}
            >
              {formatter(row.get(columnKey))}
            </TableCell>
          </td>
        );
      });

      return (
        <tr className="TableBody__row" key={rowKey}>
          {this.renderSelectRow()}
          {tds}
        </tr>
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
  className: PropTypes.string,
  children: PropTypes.any,
};

export default TableBody;
