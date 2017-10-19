# Table

## Usage

```js
<Table></Table>
```

## Props

### groups

```js
[
  { key: "payee", title: "Payee" },
  { key: "name", title: "Name", group: "payee" },
  { key: "compensation", title: "Compensation" },
  // ...
]
```

### columns

```js

[
  {
    key: "firstname",
    title: "Firstname",
    order: 1,
    dataType: "string",
    layout: { "visible": true, "frozen": true, "width": 120 },
    editable: false,
    formula: null,
    formatter: null,
    group: "payee",
    editorType: "text"
  },
  {
    key: "salary",
    title: "Picture",
    order: 2,
    dataType: "number",
    layout: { "visible": true, "frozen": false, "width": 120 },
    editable: false,
    formula: "base + bonus",
    formatter: x => `$ ${x.toFixed(2)}`,
    group: null,
    editorType: "number"
  },
  //...
]
```


### rows

```js

[
  {
    firstname: "John",
    salary: null,
    bonus: 3000,
    base: 100000,
    //...
  },
  //..
]
```
