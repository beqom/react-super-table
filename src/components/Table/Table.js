import React from 'react';
import throttle from 'lodash/throttle';
import Immutable from 'immutable';
import classnames from 'classnames';
import IconPin from 'react-icons/lib/go/pin';

// import TableRowIndexes from '../TableRowIndexes';
// import TableColumnIndexes from '../TableColumnIndexes';

import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import './Table.scss';

const flattenCols = cols => {
  const childrenCols = cols.reduce((acc, col) => acc.concat(col.get('children')), Immutable.List());

  return Immutable.List()
    .push(cols)
    .concat(childrenCols.size ? flattenCols(childrenCols) : []);
};

const getFields = cols =>
  cols.reduce((acc, col) => {
    if (col.get('children').size) return acc.concat(getFields(col.get('children')));
    return acc.push(col);
  }, Immutable.List());

const getHeadingsAndFields = columns => {
  const freezedColumns = columns.filter(col => col.get('freezed'));
  const unfreezedColumns = columns.filter(col => !col.get('freezed'));

  return {
    headings: flattenCols(unfreezedColumns),
    freezedHeadings: flattenCols(freezedColumns),
    fields: getFields(unfreezedColumns),
    freezedFields: getFields(freezedColumns),
  };
};

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

    const columns = this.props.columns.sort((a, b) => {
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
      frozenColumns: columns.filter(c => c.getIn(['layout', 'frozen'])),
      columns: columns.filter(c => !c.getIn(['layout', 'frozen'])),
      rows: this.props.rows,
    };

    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResize = throttle(this.handleResize.bind(this), 50);
    this.handleResizeEnd = this.handleResizeEnd.bind(this);
    this.handleSelectCell = this.handleSelectCell.bind(this);
    this.handleEditSelectedCell = this.handleEditSelectedCell.bind(this);
    this.handleScrollContent = this.handleScrollContent.bind(this);
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

  handleScrollContent(e) {
    const { scrollLeft, scrollTop } = e.currentTarget;

    if (this.headingsNode) {
      this.headingsNode.scrollLeft = scrollLeft;
    }

    if (this.freezedColsNode) {
      this.freezedColsNode.scrollTop = scrollTop;
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
    const { groups, rowKey } = this.props;
    const { rows, columns, frozenColumns } = this.state;

    const headerRowsCount = getHeaderRowsCount(this.props.columns, groups) + 1;

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
            ref={node => {
              this.headingsNode = node;
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
          <div className="Table__content-feezed-cols" ref={node => (this.freezedColsNode = node)}>
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
          <div className="Table__content" onScroll={this.handleScrollContent}>
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

export default Table;