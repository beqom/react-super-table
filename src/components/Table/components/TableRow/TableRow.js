import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Types from '../../../../Types';
import TableCell from '../TableCell';

import './TableRow.scss';

class TableRow extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.row !== this.props.row) return true;
    if (nextProps.selectedColumnKey !== this.props.selectedColumnKey) return true;
    if (nextProps.selectedCellEditing !== this.props.selectedCellEditing) return true;
    if (nextProps.columns !== this.props.columns) return true;
    return false;
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
      selectedCellEditing,
      onChangeCell,
      onEditCell,
    } = this.props;
    const tds = columns.map(column => {
      const columnKey = column.get('key');
      const width = column.getIn(['layout', 'width']);
      const selected = selectedColumnKey === columnKey;
      const onSelect = () => onSelectCell(columnKey, rowKey);
      const editable = column.get('editable') && !column.get('formula');

      return (
        <TableCell
          key={columnKey}
          selected={selected}
          editing={selected && selectedCellEditing}
          onKeyDown={this.props.handleKeyPress}
          onSelect={onSelect}
          style={selected && selectedCellEditing ? {} : { width }}
          editable={editable}
          formula={column.get('formula')}
          rowKey={rowKey}
          columnKey={columnKey}
          onEditCell={onEditCell}
          value={row.get(columnKey)}
          onChangeCell={onChangeCell}
        />
      );
    });

    return (
      <tr key={rowKey} className="TableRow">
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
  onChangeSelectRow: PropTypes.func,
  onEditCell: PropTypes.func.isRequired,
  onChangeCell: PropTypes.func,
  handleKeyPress: PropTypes.func.isRequired,
};

export default TableRow;
