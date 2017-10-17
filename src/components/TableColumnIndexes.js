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
    const ci = colIndex + startAt;
    const alpha = numToAlpha(ci);
    return (
      <th
        className={classnames("frame-cell", { focused: ci === selectedCellColIndex })}
        key={alpha}
      >
        <div style={{ width: colsWidth.get(ci) }}>{alpha}</div>
        <div
          className="frame-resize-handle frame-resize-handle--cols"
          draggable="true"
          onDragStart={e =>
            onResizeStart({
              mouseX: e.clientX,
              handleBox: e.currentTarget.getBoundingClientRect(),
              colIndex: ci,
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
