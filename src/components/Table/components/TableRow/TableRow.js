import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Types from '../../Types';
import TableCell from '../TableCell';

import './TableRow.scss';

class TableRow extends React.Component {
  constructor() {
    super();

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.hovered !== this.props.hovered) return true;
    if (nextProps.row !== this.props.row) return true;
    if (nextProps.selectedColumnKey !== this.props.selectedColumnKey) return true;
    if (nextProps.selectedCellEditing !== this.props.selectedCellEditing) return true;
    if (nextProps.columns !== this.props.columns) return true;
    return false;
  }

  handleMouseEnter() {
    this.props.onSetHoveredRowKey(this.props.rowKey);
  }

  handleMouseLeave() {
    this.props.onSetHoveredRowKey(undefined);
  }

  renderSelectRow() {
    if (!this.props.onChangeSelectRow) return null;

    return (
      <th className="TableCell">
        <div className="TableCell__content TableCell__content--select">
          <input type="checkbox" onChange={this.props.onChangeSelectRow} />
        </div>
      </th>
    );
  }

  render() {
    const {
      columns,
      row,
      rowKey,
      selectedColumnKey,
      onSelectCell,
      onEditSelectedCell,
      selectedCellEditing,
    } = this.props;
    const tds = columns.map(column => {
      const columnKey = column.get('key');
      const width = column.getIn(['layout', 'width']);
      const selected = selectedColumnKey === columnKey;
      const onSelect = () => onSelectCell(columnKey, rowKey);

      const onClick = selected ? onEditSelectedCell : onSelect;
      const editable = column.get('editable') && !column.get('formula');
      const events = { onKeyDown: this.props.handleKeyPress, onClick };

      return (
        <TableCell
          key={columnKey}
          selected={selected}
          screenReaderMode={this.props.screenReaderMode}
          editing={selected && selectedCellEditing}
          events={events}
          style={selected && selectedCellEditing ? {} : { width }}
          editable={editable}
          formula={column.get('formula')}
          rowKey={rowKey}
          columnKey={columnKey}
          onEditCell={this.props.onEditCell}
          value={row.get(columnKey)}
        />
      );
    });

    return (
      <tr
        key={rowKey}
        className={classnames('TableRow', { 'TableRow--hovered': this.props.hovered })}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderSelectRow()}
        {tds}
      </tr>
    );
  }
}

TableRow.displayName = 'TableRow';

TableRow.defaultProps = {};

TableRow.propTypes = {
  rowKey: PropTypes.string.isRequired,
  columns: ImmutablePropTypes.listOf(Types.immutableColumn).isRequired,
  selectedCellEditing: PropTypes.bool.isRequired,
  onSelectCell: PropTypes.func.isRequired,
  onEditSelectedCell: PropTypes.func.isRequired,
  onChangeSelectRow: PropTypes.func,
  onEditCell: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  onSetHoveredRowKey: PropTypes.func.isRequired,
  hovered: PropTypes.bool.isRequired,
};

export default TableRow;
