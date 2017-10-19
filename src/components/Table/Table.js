import React from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import Immutable from 'immutable';
import classnames from 'classnames';
import IconPin from 'react-icons/lib/go/pin';
import debounce from 'lodash/debounce';

// import TableRowIndexes from '../TableRowIndexes';
// import TableColumnIndexes from '../TableColumnIndexes';

import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import './Table.scss';

const getHeaderRowsCount = (columns, groups) => {
  const colGroups = columns
    .map(column => column.get('group'))
    .filter((key, i, arr) => !!key && arr.indexOf(key) === i)
    .map(key => groups.find(g => g.get('key') === key))
    .filter(g => !!g);
  if (colGroups.size) {
    return 1 + getHeaderRowsCount(colGroups, groups);
  }
  return 0;
};

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.columns = Immutable.fromJS(this.props.columns).sort((a, b) => {
      if (a.order < b.order) return -1
      if (a.order > b.order) return 1;
      return 0;
    });

    this.state = {
      selectedCell: null,
      resizing: {
        colIndex: null,
        rowIndex: null,
        handleBox: null,
        mouseX: null,
        mouseY: null,
        containerBox: null,
      },
      frozenColumns: this.columns.filter(c => c.getIn(['layout', 'frozen'])),
      columns: this.columns.filter(c => !c.getIn(['layout', 'frozen'])),
      rows: Immutable.fromJS(this.props.rows),
      groups: Immutable.fromJS(this.props.groups),
    };

    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResize = throttle(this.handleResize.bind(this), 50);
    this.handleResizeEnd = this.handleResizeEnd.bind(this);
    this.handleSelectCell = this.handleSelectCell.bind(this);
    this.handleEditSelectedCell = this.handleEditSelectedCell.bind(this);
    this.handleScrollContent = debounce(this.handleScrollContent.bind(this), 10);
    this.handleScrollFrozenContent = debounce(this.handleScrollFrozenContent.bind(this), 10);
    this.handleScrollHeader = debounce(this.handleScrollHeader.bind(this), 10);
  }

  handleResizeStart({
    colIndex, rowIndex, handleBox, mouseX, mouseY,
  }) {
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
    const {
      colIndex, rowIndex, startX, startY,
    } = resizing;

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

  handleSelectCell(colIndex, rowIndex) {
    this.setState({
      selectedCell: { colIndex, rowIndex, editing: false },
    });
  }

  handleEditSelectedCell() {
    const { selectedCell } = this.state;
    if (!selectedCell) return;

    const { colIndex, rowIndex, editing } = selectedCell;
    if (editing) return;

    this.setState({
      selectedCell: { colIndex, rowIndex, editing: true },
    });
  }

  renderResizeColsHelper() {
    const { colsWidth, resizing } = this.state;
    const {
      colIndex, mouseX, startX, handleBox, containerBox,
    } = resizing;
    if (!colIndex && colIndex !== 0) return null;

    const mouseOffsetX = startX - (handleBox.left + handleBox.width / 2);
    const columnLeft =
      handleBox.left + handleBox.width / 2 - colsWidth.get(colIndex) - containerBox.left;
    const left = Math.max(mouseX + mouseOffsetX - containerBox.left, columnLeft + 10);

    return <div className="Table__resize-col-helper" style={{ left }} />;
  }

  renderResizeRowsHelper() {
    const { rowsHeight, resizing } = this.state;
    const {
      rowIndex, mouseY, startY, handleBox, containerBox,
    } = resizing;
    if (!rowIndex && rowIndex !== 0) return null;

    const mouseOffsetY = startY - (handleBox.top + handleBox.height / 2);
    const rowTop =
      handleBox.top + handleBox.height / 2 - rowsHeight.get(rowIndex) - containerBox.top;
    const top = Math.max(mouseY + mouseOffsetY - containerBox.top, rowTop + 10);

    return <div className="Table__resize-row-helper" style={{ top }} />;
  }

  render() {
    const { rowKey } = this.props;
    const { groups, rows, columns, frozenColumns } = this.state;

    const headerRowsCount = getHeaderRowsCount(this.columns, groups) + 1;

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
              onChangeSelectAllRows={() => {}}
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
              columns={columns}
              groups={groups}
              headerRowsCount={headerRowsCount}
            />
          </div>
        </div>

        <div className="Table__content-container">
          <div className="Table__content-feezed-cols" onScroll={this.handleScrollFrozenContent} ref={node => {this.frozenContentNode = node;}}>
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
              onChangeSelectRow={() => {}}
              columns={frozenColumns}
              rows={rows}
              rowKey={rowKey}
              selectedCell={this.state.selectedCell}
              onSelectCell={this.handleSelectCell}
              onEditSelectedCell={this.handleEditSelectedCell}
            />
          </div>
          <div className="Table__content" onScroll={this.handleScrollContent} ref={node => {this.contentNode = node;}}>
            <TableBody
              columns={columns}
              rows={rows}
              rowKey={rowKey}
              selectedCell={this.state.selectedCell}
              onSelectCell={this.handleSelectCell}
              onEditSelectedCell={this.handleEditSelectedCell}
            />
          </div>
        </div>
      </div>
    );
  }
}

Table.displayName = "Table";

Table.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    group: PropTypes.string,
  })).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    order: PropTypes.number.isRequired,
    dataType: PropTypes.string.isRequired,
    layout: PropTypes.shape({
      visible: PropTypes.bool.isRequired,
      frozen: PropTypes.bool.isRequired,
      width: PropTypes.number.isRequired,
    }).isRequired,
    editable: PropTypes.bool.isRequired,
    formula: PropTypes.string,
    formatter: PropTypes.func,
    group: PropTypes.string,
    editorType: PropTypes.string,
  })).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Table;
