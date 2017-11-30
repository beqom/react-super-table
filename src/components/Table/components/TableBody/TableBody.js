import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Types from '../../../../Types';
import TableRow from '../TableRow';

import './TableBody.scss';

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.hoveredRowKey !== nextProps.hoveredRowKey) return true;
    if (this.props.columns !== nextProps.columns) return true;
    if (this.props.rows !== nextProps.rows) return true;
    if (this.props.selectedCell !== nextProps.selectedCell) return true;
    return false;
  }

  handleKeyPress(e) {
    const { selectedCell } = this.props;
    if (!selectedCell) return;

    switch (e.key) {
      case 'ArrowUp':{
        this.selectCellAbove(e);
        return;
      }
      case 'ArrowDown':{
        this.selectCellBelow(e);
        return;
      }
      case 'ArrowLeft':{
        this.selectCellLeft(e);
        return;
      }
      case 'ArrowRight':{
        this.selectCellRight(e);
        return;
      }
      case 'Escape': {
        this.props.onCancelEditSelectedCell();
        return;
      }
      case 'Enter': {
        e.preventDefault();
        if (selectedCell.editing) this.selectCellBelow();
        else this.props.onEditSelectedCell();
        return;
      }
      default: {
        this.props.onEditSelectedCell();
      }
    }
  }

  selectCellAbove(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(0, -1);
  }

  selectCellBelow(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(0, 1);
  }

  selectCellRight(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(1, 0);
  }

  selectCellLeft(e) {
    if (e) e.preventDefault();
    this.props.onSwitchSelectedCell(-1, 0);
  }

  render() {
    const { columns, rows, selectedCell = {} } = this.props;

    if (!rows.size) {
      return (
        <tbody className="TableBody">
          <tr>
            <td className="TableBody__empty-cell" colSpan={columns.size + 1}>
              <div className="TableBody__empty-content">No results found</div>
            </td>
          </tr>
        </tbody>
      );
    }

    const tbodies = rows.map(row => {
      const rowKey = row.get(this.props.rowKey);
      const selectedColumnKey = selectedCell.rowKey === rowKey ? selectedCell.columnKey : null;
      const selectedCellEditing = selectedCell.rowKey === rowKey ? selectedCell.editing : false;
      return (
        <TableRow
          key={rowKey}
          rowKey={rowKey}
          row={row}
          columns={columns}
          selectedColumnKey={selectedColumnKey}
          onSelectCell={this.props.onSelectCell}
          onChangeSelectRow={this.props.onChangeSelectRow}
          onEditCell={this.props.onEditCell}
          selectedCellEditing={selectedCellEditing}
          handleKeyPress={this.handleKeyPress}
          onChangeCell={this.props.onChangeCell}
        />
      );
    });
    return <tbody className="TableBody">{tbodies}</tbody>;
  }
}

TableBody.displayName = 'TableBody';

TableBody.defaultProps = {};

TableBody.propTypes = {
  rowKey: PropTypes.string.isRequired,
  onEditCell: PropTypes.func.isRequired,
  onSelectCell: PropTypes.func.isRequired,
  onChangeSelectRow: PropTypes.func,
  onSwitchSelectedCell: PropTypes.func.isRequired,
  onChangeCell: PropTypes.func,
};

export default TableBody;
