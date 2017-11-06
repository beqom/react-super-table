import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';


// --- GROUP ---

const group = PropTypes.shape({
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  group: PropTypes.string,
});

const immutableGroup = ImmutablePropTypes.contains({
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  group: PropTypes.string,
});


// --- COLUMN ---

const column = PropTypes.shape({
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
});

const immutableColumn = ImmutablePropTypes.contains({
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  order: PropTypes.number.isRequired,
  dataType: PropTypes.string.isRequired,
  layout: ImmutablePropTypes.contains({
    visible: PropTypes.bool.isRequired,
    frozen: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired,
  editable: PropTypes.bool.isRequired,
  formula: PropTypes.string,
  formatter: PropTypes.func,
  group: PropTypes.string,
  editorType: PropTypes.string,
});

export default {
  column,
  immutableColumn,
  group,
  immutableGroup,
}
