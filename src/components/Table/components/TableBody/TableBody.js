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
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    const { colIndex, rowIndex } = selectedCell;
    this.selectCell(colIndex, Math.max(0, rowIndex - 1), e);
  }

  selectCellBelow(e) {
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    const { colIndex, rowIndex } = selectedCell;
    const { size } = this.props.rows;
    this.selectCell(colIndex, Math.min(size, rowIndex + 1), e);
  }

  selectCellRight(e) {
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    const { colIndex, rowIndex } = selectedCell;
    const { size } = this.props.fields;
    this.selectCell(Math.min(size, colIndex + 1), rowIndex, e);
  }

  selectCellLeft(e) {
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    const { colIndex, rowIndex } = selectedCell;
    this.selectCell(Math.max(0, colIndex - 1), rowIndex, e);
  }

  selectCell(colIndex, rowIndex, e) {
    if (e) e.preventDefault();

    const selectedCell = this.props.selectedCell || {};
    if (colIndex === selectedCell.colIndex && rowIndex === selectedCell.rowIndex) return;

    this.props.onSelectCell(colIndex, rowIndex);
  }

  renderSelectRow() {
    if (!this.props.onChangeSelectRow) return null;

    return (
      <th className="TableBody__cell">
        <div className="TableBody__cell-content">
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
        const width = column.getIn(['layout', 'width']);
        const selected = selectedCell.columnKey === columnKey && selectedCell.rowKey === rowKey;
        const onSelect = () => this.props.onSelectCell(columnKey, rowKey);

        return (
          <td
            key={columnKey}
            className={classnames('TableBody__cell', { 'TableBody__cell--focused': selected })}
          >
            <TableCell
              selected={selected}
              editing={selected && selectedCell.editing}
              onKeyDown={this.handleKeyPress}
              onClick={selected ? this.props.onEditSelectedCell : onSelect}
              style={selected && selectedCell.editing ? {} : { width }}
            >
              {row.get(columnKey)}
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
