import React,{Component} from "react";
const client = require('./client');
import EmployeeList from "./EmployeeList";

class EmployeePage extends Component {

	constructor(props) {
		super(props);
		this.state = {employees: []};
	}

	componentDidMount() {
		
		client({method: 'GET', path: '/api/employees'}).done(response => {
			this.setState({employees: response.entity._embedded.employees});
		});
		/*
		const jsonres = '[ { \
			"firstName" : "Frodo",\
			"lastName" : "Baggins",\
			"description" : "ring bearer"\
		  } ]';
		const employeesList = JSON.parse(jsonres);
		this.setState({
			employees:employeesList
		});*/
	}

	render() {
		return (
			<EmployeeList employees={this.state.employees}/>
		)
	}
}

export default EmployeePage;