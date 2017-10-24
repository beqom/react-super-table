import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import throttle from 'lodash/throttle';
import Immutable from 'immutable';
import classnames from 'classnames';
import IconPin from 'react-icons/lib/go/pin';
import debounce from 'lodash/debounce';

import Types from './Types';
import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import './Table.scss';

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCell: undefined,
      hoveredRowKey: undefined,
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
    this.handleEditSelectedCell = this.handleEditSelectedCell.bind(this);
    this.handleSetHoveredRowKey = this.handleSetHoveredRowKey.bind(this);
    this.handleScrollContent = debounce(this.handleScrollContent.bind(this), 10);
    this.handleScrollFrozenContent = debounce(this.handleScrollFrozenContent.bind(this), 10);
    this.handleScrollHeader = debounce(this.handleScrollHeader.bind(this), 10);
  }

  handleSetHoveredRowKey(hoveredRowKey) {
    this.setState({ hoveredRowKey });
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

    // resizing rows
    if (!isNaN(rowIndex)) {
      const newHeight = rowsHeight.get(rowIndex) + (mouseY - startY);
      this.setState({
        rowsHeight: rowsHeight.set(rowIndex, Math.max(newHeight, 10)),
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

  handleScrollFrozenContent() {
    const { scrollTop } = this.frozenContentNode;

    if (this.contentNode) {
      this.contentNode.scrollTop = scrollTop;
    }
  }

  handleScrollHeader() {
    const { scrollLeft } = this.headerNode;

    if (this.contentNode) {
      this.contentNode.scrollLeft = scrollLeft;
    }
  }

  handleSwitchSelectedCell(columnDelta, rowDelta) {
    const { selectedCell = {} } = this.state;
    const { visibleColumns, rows } = this.props;
    if (!selectedCell) return;

    const selectedColumnIndex = visibleColumns.findIndex(column => column.get('key') === selectedCell.columnKey);
    const selectedRowIndex = rows.findIndex(row => row.get(this.props.rowKey) === selectedCell.rowKey);

    if (selectedColumnIndex < 0 || selectedRowIndex < 0) {
      this.handleUnselectCell();
      return;
    }

    const nextColumnIndex = Math.max(Math.min(visibleColumns.size - 1, selectedColumnIndex + columnDelta), 0);
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
    const selectedColumn = this.props.columns.find(
      column => column.get('key') === selectedCell.columnKey
    );
    if (
      editing ||
      !selectedColumn ||
      !selectedColumn.get('editable') ||
      !!selectedColumn.get('formula')
    )
      return;

    this.setState({
      selectedCell: { columnKey, rowKey, editing: true },
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

  renderResizeRowsHelper() {
    const { rowsHeight, resizing } = this.state;
    const { rowIndex, mouseY, startY, handleBox, containerBox } = resizing;
    if (!rowIndex && rowIndex !== 0) return null;

    const mouseOffsetY = startY - (handleBox.top + handleBox.height / 2);
    const rowTop =
      handleBox.top + handleBox.height / 2 - rowsHeight.get(rowIndex) - containerBox.top;
    const top = Math.max(mouseY + mouseOffsetY - containerBox.top, rowTop + 10);

    return <div className="Table__resize-row-helper" style={{ top }} />;
  }

  renderForScreenReader() {
    const { rowKey, headerRowsCount, groups, rows, unfrozenColumns, frozenColumns } = this.props;
    const columns = frozenColumns.concat(unfrozenColumns);
    return (
      <div
        className="Table Table--screen-reader"
        ref={node => {
          this.containerNode = node;
        }}
      >
        <div className="Table__content-container">
          <div className="Table__content">
            <table className="Table__screen-reader-table">
              <TableHeader
                noTable
                onChangeSelectAllRows={this.props.onChangeSelectAllRows}
                columns={columns}
                groups={groups}
                headerRowsCount={headerRowsCount}
              />
              <TableBody
                screenReaderMode
                noTable
                onChangeSelectRow={this.props.onChangeSelectRow}
                columns={columns}
                rows={rows}
                rowKey={rowKey}
                selectedCell={this.state.selectedCell}
                onSelectCell={this.handleSelectCell}
                onUnselectCell={this.handleUnselectCell}
                onEditSelectedCell={this.handleEditSelectedCell}
                onEditCell={this.props.onEditCell}
                onSetHoveredRowKey={this.handleSetHoveredRowKey}
                hoveredRowKey={this.state.hoveredRowKey}
              />
            </table>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      rowKey,
      headerRowsCount,
      groups,
      rows,
      unfrozenColumns,
      frozenColumns,
      screenReaderMode,
    } = this.props;

    if (screenReaderMode) return this.renderForScreenReader();

    return (
      <div
        className="Table"
        ref={node => {
          this.containerNode = node;
        }}
      >
        {this.renderResizeRowsHelper()}
        {this.renderResizeColsHelper()}
        <div className="Table__head-container">
          <div className="Table__head-freezed-cols">
            {/*
            <table>
              <thead>

                <TableColumnIndexes
                  columns={freezedFields}
                  selectedCellColIndex={(this.state.selectedCell || {}).colIndex}
                  onResizeStart={this.handleResizeStart}
                  onResize={this.handleResize}
                  onResizeEnd={this.handleResizeEnd}
                  colsWidth={this.state.colsWidth}
                />

                {theadsFreezed}
              </thead>
            </table>
            */}
            <TableHeader
              onChangeSelectAllRows={this.props.onChangeSelectAllRows}
              columns={frozenColumns}
              groups={groups}
              headerRowsCount={headerRowsCount}
            />
          </div>
          <div
            className="Table__head"
            onScroll={this.handleScrollHeader}
            ref={node => {
              this.headerNode = node;
            }}
          >
            {/*
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
            */}
            <TableHeader
              columns={unfrozenColumns}
              groups={groups}
              headerRowsCount={headerRowsCount}
            />
          </div>
        </div>

        <div className="Table__content-container">
          <div
            className="Table__content-feezed-cols"
            onScroll={this.handleScrollFrozenContent}
            ref={node => {
              this.frozenContentNode = node;
            }}
          >
            {/*
            <TableRowIndexes
              rows={rows}
              selectedCellRowIndex={(this.state.selectedCell || {}).rowIndex}
              onResizeStart={this.handleResizeStart}
              onResize={this.handleResize}
              onResizeEnd={this.handleResizeEnd}
              rowsHeight={this.state.rowsHeight}
              keyPath={keyPath}
            />
            */}
            <TableBody
              onChangeSelectRow={this.props.onChangeSelectRow}
              columns={frozenColumns}
              rows={rows}
              rowKey={rowKey}
              selectedCell={this.state.selectedCell}
              onSelectCell={this.handleSelectCell}
              onSwitchSelectedCell={this.handleSwitchSelectedCell}
              onEditSelectedCell={this.handleEditSelectedCell}
              onEditCell={this.props.onEditCell}
              onSetHoveredRowKey={this.handleSetHoveredRowKey}
              hoveredRowKey={this.state.hoveredRowKey}
            />
          </div>
          <div
            className="Table__content"
            onScroll={this.handleScrollContent}
            ref={node => {
              this.contentNode = node;
            }}
          >
            <TableBody
              columns={unfrozenColumns}
              rows={rows}
              rowKey={rowKey}
              selectedCell={this.state.selectedCell}
              onSwitchSelectedCell={this.handleSwitchSelectedCell}
              onSelectCell={this.handleSelectCell}
              onEditSelectedCell={this.handleEditSelectedCell}
              onEditCell={this.props.onEditCell}
              onSetHoveredRowKey={this.handleSetHoveredRowKey}
              hoveredRowKey={this.state.hoveredRowKey}
            />
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
  visibleColumns: ImmutablePropTypes.contains(Types.columnKeys).isRequired,
  unfrozenColumns: ImmutablePropTypes.listOf(Types.immutableColumn).isRequired,
  frozenColumns: ImmutablePropTypes.listOf(Types.immutableColumn).isRequired,
  rows: ImmutablePropTypes.listOf(ImmutablePropTypes.map).isRequired,
  onEditCell: PropTypes.func.isRequired,
  onChangeSelectAllRows: PropTypes.func.isRequired,
  onChangeSelectRow: PropTypes.func.isRequired,
  screenReaderMode: PropTypes.bool,
};

export default Table;
