import React from "react";
import classnames from "classnames";

import { trace } from "../libs/helpers";

const TableRowIndexes = ({
  rows,
  selectedCellRowIndex,
  onResizeStart,
  onResize,
  onResizeEnd,
  rowsHeight,
  keyPath
}) => {
  const indexes = rows.map((row, ri) => (
    <tr key={row.getIn(keyPath)}>
      <th
        className={classnames("frame-cell", {
          focused: ri === selectedCellRowIndex
        })}
        style={{
          width: `${`${rows.size}`.length}em`,
          height: rowsHeight.get(ri)
        }}
      >
        <div
          style={{
            width: `${`${rows.size}`.length}em`,
            height: rowsHeight.get(ri)
          }}
          className="cell"
        >
          {ri + 1}
        </div>
        <div
          className="frame-resize-handle frame-resize-handle--rows"
          draggable="true"
          onDragStart={e =>
            onResizeStart({
              mouseY: e.clientY,
              handleBox: e.currentTarget.getBoundingClientRect(),
              rowIndex: ri
            })}
          onDrag={e => onResize(e.clientX, e.clientY)}
          onDragEnd={e => onResizeEnd(e.clientX, e.clientY)}
        />
      </th>
    </tr>
  ));

  return (
    <table>
      <tbody>{indexes}</tbody>
    </table>
  );
};

export default TableRowIndexes;
