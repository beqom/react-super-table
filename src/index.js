// import React from "react";
// import { render } from "react-dom";
// import isPlainObject from "lodash/isPlainObject";
// import capitalize from "lodash/capitalize";
// import Immutable from 'immutable';

// import { trace } from './libs/helpers';
// import Table from './components/Table';
// import "./style.css";


// const getMaxChildrenLength = children =>
//   children.reduce((acc, child) => {
//     if (child.children.length)
//       return acc + getMaxChildrenLength(child.children);
//     return acc + 1;
//   }, 0);

// const getCols = (data, parentPath = "") =>
//   Object.keys(data).map(key => {
//     const path = parentPath ? parentPath.push(key) : Immutable.List([key]);
//     const children = isPlainObject(data[key]) ? getCols(data[key], path) : [];
//     return {
//       key,
//       path,
//       name: capitalize(key),
//       maxChildrenLength: getMaxChildrenLength(children),
//       children,
//       value: data[key]
//     };
//   });

// class App extends React.Component {
//   constructor() {
//     super();

//     this.state = {
//       fetching: true,
//       data: {}
//     };

//     this.fetchData();
//   }

//   fetchData() {
//     fetch("https://randomuser.me/api/?results=10")
//       .then(res => res.json())
//       .then(res => res.results)
//       .then(this.setData.bind(this))
//       .then(() => this.setState(() => ({ fetching: false })));
//   }

//   setData(rows) {
//     this.setState(() => ({
//       data: {
//         columns: Immutable.fromJS(getCols(rows[0])),
//         rows: Immutable.fromJS(rows),
//       }
//     }));
//   }

//   render() {
//     if (this.state.fetching) return <p>Loading...</p>;

//     const { columns, rows } = this.state.data;

//     return (
//       <div className="app">
//         <Table
//           columns={columns}
//           rows={rows}
//           keyPath={Immutable.List(['email'])}
//         />
//       </div>
//     );
//   }
// }

// render(<App />, document.getElementById("root"));
