import React from "react";
import classnames from "classnames";

import { numToAlpha } from "../libs/helpers";

const TableColumnIndexes = ({
  startAt = 0,
  columns,
  selectedCellColIndex,
  onResizeStart,
  onResize,
  onResizeEnd,
  colsWidth
}) => {
  const indexes = columns.map((_, colIndex) => {
    const alpha = numToAlpha(startAt + colIndex);
    return (
      <th
        className={classnames("frame-cell", { focused: colIndex === selectedCellColIndex })}
        key={alpha}

      >
        <div style={{ width: colsWidth.get(startAt + colIndex) }}>{alpha}</div>
        <div
          className="frame-resize-handle frame-resize-handle--cols"
          draggable="true"
          onDragStart={e =>
            onResizeStart({
              mouseX: e.clientX,
              handleBox: e.currentTarget.getBoundingClientRect(),
              colIndex,
            })}
          onDrag={e => onResize(e.clientX, e.clientY)}
          onDragEnd={e => onResizeEnd(e.clientX, e.clientY)}
        />
      </th>
    );
  });

  return <tr>{indexes}</tr>;
};

export default TableColumnIndexes;
