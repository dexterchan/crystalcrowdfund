const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

//import EmployeePage from "./index";

import EmployeeList from "./EmployeeList";

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {employees: []};
	}

	componentDidMount() {
		client({method: 'GET', path: '/api/employees'}).done(response => {
			this.setState({employees: response.entity._embedded.employees});
		});
	}

	render() {
		return (
			<EmployeeList employees={this.state.employees}/>
		)
	}
}


// tag::render[]
ReactDOM.render(
	<App/>,
	document.getElementById('react')
)