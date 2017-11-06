import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import throttle from 'lodash/throttle';

import Types from '../..//Types';
import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import './Table.scss';

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCell: undefined,
      resizing: {
        colIndex: null,
        rowIndex: null,
        handleBox: null,
        mouseX: null,
        mouseY: null,
        containerBox: null,
      },
    };

    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResize = throttle(this.handleResize.bind(this), 50);
    this.handleResizeEnd = this.handleResizeEnd.bind(this);
    this.handleSelectCell = this.handleSelectCell.bind(this);
    this.handleSwitchSelectedCell = this.handleSwitchSelectedCell.bind(this);
    this.handleUnselectCell = this.handleUnselectCell.bind(this);
    this.handleEditCell = this.handleEditCell.bind(this);
    this.handleEditSelectedCell = this.handleEditSelectedCell.bind(this);
    this.handleCancelEditSelectedCell = this.handleCancelEditSelectedCell.bind(this);
  }

  handleResizeStart({ colIndex, rowIndex, handleBox, mouseX, mouseY }) {
    const containerBox = this.containerNode.getBoundingClientRect();
    this.setState(() => ({
      resizing: {
        colIndex,
        rowIndex,
        handleBox,
        mouseX,
        mouseY,
        containerBox,
        startX: mouseX,
        startY: mouseY,
      },
    }));
  }

  handleResize(mouseX, mouseY) {
    const { resizing } = this.state;
    resizing.mouseX = mouseX || resizing.mouseX;
    resizing.mouseY = mouseY || resizing.mouseY;
    this.setState({ resizing });
  }

  handleResizeEnd(mouseX, mouseY) {
    const { colsWidth, rowsHeight, resizing } = this.state;
    const { colIndex, rowIndex, startX, startY } = resizing;

    // resizing columns
    if (!isNaN(colIndex)) {
      const newWidth = colsWidth.get(colIndex) + (mouseX - startX);
      this.setState({
        colsWidth: colsWidth.set(colIndex, Math.max(newWidth, 10)),
      });
    }

    this.setState({
      resizing: {},
    });
  }

  handleScrollContent() {
    const { scrollLeft, scrollTop } = this.contentNode;

    if (this.headerNode) {
      this.headerNode.scrollLeft = scrollLeft;
    }

    if (this.frozenContentNode) {
      this.frozenContentNode.scrollTop = scrollTop;
    }
  }

  handleSwitchSelectedCell(columnDelta, rowDelta) {
    const { selectedCell = {} } = this.state;
    const { visibleColumns, rows } = this.props;
    if (!selectedCell) return;

    const selectedColumnIndex = visibleColumns.findIndex(
      column => column.get('key') === selectedCell.columnKey
    );
    const selectedRowIndex = rows.findIndex(
      row => row.get(this.props.rowKey) === selectedCell.rowKey
    );

    if (selectedColumnIndex < 0 || selectedRowIndex < 0) {
      this.handleUnselectCell();
      return;
    }

    const nextColumnIndex = Math.max(
      Math.min(visibleColumns.size - 1, selectedColumnIndex + columnDelta),
      0
    );
    const nextRowIndex = Math.max(Math.min(rows.size - 1, selectedRowIndex + rowDelta), 0);

    if (selectedColumnIndex === nextColumnIndex && selectedRowIndex === nextRowIndex) return;

    const columnKey = visibleColumns.getIn([nextColumnIndex, 'key']);
    const rowKey = rows.getIn([nextRowIndex, this.props.rowKey]);

    this.handleSelectCell(columnKey, rowKey);
  }

  handleSelectCell(columnKey, rowKey) {
    if (!columnKey || !rowKey) return;

    this.setState({
      selectedCell: { columnKey, rowKey, editing: false },
    });
  }

  handleUnselectCell() {
    this.setState({ selectedCell: undefined });
  }

  handleEditSelectedCell() {
    const { selectedCell } = this.state;
    if (!selectedCell) return;

    const { columnKey, rowKey, editing } = selectedCell;

    if(editing) return;

    this.handleEditCell(columnKey, rowKey);
  }

  handleEditCell(columnKey, rowKey) {
    if (!columnKey || !rowKey) return;

    this.setState({
      selectedCell: { columnKey, rowKey, editing: true },
    });
  }

  handleCancelEditSelectedCell() {
    const { selectedCell } = this.state;
    if (!selectedCell) return;

    const { columnKey, rowKey, editing } = selectedCell;

    if(!editing) return;

    this.setState({
      selectedCell: { columnKey, rowKey, editing: false },
    });
  }

  renderResizeColsHelper() {
    const { colsWidth, resizing } = this.state;
    const { colIndex, mouseX, startX, handleBox, containerBox } = resizing;
    if (!colIndex && colIndex !== 0) return null;

    const mouseOffsetX = startX - (handleBox.left + handleBox.width / 2);
    const columnLeft =
      handleBox.left + handleBox.width / 2 - colsWidth.get(colIndex) - containerBox.left;
    const left = Math.max(mouseX + mouseOffsetX - containerBox.left, columnLeft + 10);

    return <div className="Table__resize-col-helper" style={{ left }} />;
  }

  render() {
    const { rowKey, headerRowsCount, groups, rows, columns, columnsCount } = this.props;

    return (
      <div
        className="Table"
        ref={node => {
          this.containerNode = node;
        }}
      >
        <div className="Table__content-container">
          <div className="Table__content">
            <table className="Table__table" aria-colcount={columnsCount || columns.size}>
              <TableHeader
                noTable
                onChangeSelectAllRows={this.props.onChangeSelectAllRows}
                columns={columns}
                groups={groups}
                headerRowsCount={headerRowsCount}
                onSort={this.props.onSort}
                sort={this.props.sort}
              />
              <TableBody
                onChangeSelectRow={this.props.onChangeSelectRow}
                columns={columns}
                rows={rows}
                rowKey={rowKey}
                selectedCell={this.state.selectedCell}
                onSelectCell={this.handleSelectCell}
                onUnselectCell={this.handleUnselectCell}
                onEditSelectedCell={this.handleEditSelectedCell}
                onEditCell={this.handleEditCell}
                onSwitchSelectedCell={this.handleSwitchSelectedCell}
                onChangeCell={this.props.onChangeCell}
                onCancelEditSelectedCell={this.handleCancelEditSelectedCell}
              />
            </table>
          </div>
        </div>
      </div>
    );
  }
}

Table.displayName = 'Table';

Table.propTypes = {
  rowKey: PropTypes.string.isRequired,
  headerRowsCount: PropTypes.number.isRequired,
  groups: ImmutablePropTypes.listOf(Types.immutableGroup).isRequired,
  columns: ImmutablePropTypes.contains(Types.columnKeys).isRequired,
  columnsCount: PropTypes.number,
  rows: ImmutablePropTypes.listOf(ImmutablePropTypes.map).isRequired,
  onChangeCell: PropTypes.func,
  onChangeSelectAllRows: PropTypes.func,
  onChangeSelectRow: PropTypes.func,
};

/*
            <table>
              <thead>
                <TableColumnIndexes
                  startAt={freezedFields.size}
                  columns={fields}
                  selectedCellColIndex={(this.state.selectedCell || {}).colIndex}
                  onResizeStart={this.handleResizeStart}
                  onResize={this.handleResize}
                  onResizeEnd={this.handleResizeEnd}
                  colsWidth={this.state.colsWidth}
                />
                {theads}
              </thead>
            </table>
            */

export default Table;
