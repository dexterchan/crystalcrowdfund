const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

import EmployeePage from "./index";



// tag::render[]
ReactDOM.render(
	<EmployeePage />,
	document.getElementById('react')
)