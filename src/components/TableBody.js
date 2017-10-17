import React from "react";
import get from "lodash/get";
import classnames from "classnames";

import TableCell from './TableCell';

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedCell: null,
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if(this.props.fields !== nextProps.fields) return true;
    if(this.props.rows !== nextProps.rows) return true;
    if(this.props.selectedCell !== nextProps.selectedCell) return true;
    if(this.props.colsWidth !== nextProps.colsWidth) return true;
    if(this.props.rowsHeight !== nextProps.rowsHeight) return true;
    return false;
  }

  handleKeyPress(e) {
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    switch (e.key) {
      case "ArrowUp":
        return this.selectCellAbove(e);
      case "ArrowDown":
        return this.selectCellBelow(e);
      case "ArrowLeft":
        return this.selectCellLeft(e);
      case "ArrowRight":
        return this.selectCellRight(e);

      case "Tab": {
        if (e.shiftKey) return this.selectCellLeft(e);
        return this.selectCellRight(e);
      }
      case "Enter": {
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
    if (
      colIndex === selectedCell.colIndex &&
      rowIndex === selectedCell.rowIndex
    )
      return;

    this.props.onSelectCell(colIndex, rowIndex);
  }

  render() {
    const { fields, rows, keyPath, colsWidth, rowsHeight, selectedCell, startAt } = this.props;

    const { colIndex, rowIndex, editing } = selectedCell || {};

    const tbodies = rows.map((row, ri) => {
      const tds = fields.map((field, i) => {
        const ci = startAt + i;
        const selected = colIndex === ci && rowIndex === ri;
        const onSelect = () => this.props.onSelectCell(ci, ri);
        const style = { width: colsWidth.get(ci), height: rowsHeight.get(ri) };

        return (
          <td
            key={field.get('path').join('.')}
            className={classnames({ focused: selected })}
            style={style}
          >
            <TableCell
              selected={selected}
              editing={selected && editing}
              onKeyDown={this.handleKeyPress}
              onClick={selected ? this.props.onEditSelectedCell : onSelect }
              style={selected && editing ? {} : style}
            >
              {row.getIn(field.get('path'))}
            </TableCell>
          </td>
        );
      });

      return <tr key={row.getIn(keyPath)}>{tds}</tr>;
    });

    return (

      <table>
        <tbody>{tbodies}</tbody>
      </table>

    );
  }
}

export default TableBody;
