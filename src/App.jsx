import * as cdsl from "balena-cdsl";
import React from "react";
import ReactDOM from "react-dom";
import { Box, Provider } from "rendition";
import { Form } from "rendition/dist/unstable";

const balenaSchema = `
  title: pricing
  version: 1
  properties:
    - devices:
        title: Devices
        type: number
    - monthsCommit:
        title: Commitment (months)
        default: 0
        type: number
    - monthsPrepay:
        title: Prepayment (months)
        default: 0
        type: number
    - foo:
        type: number
        formula: uuidv4()
        $$formula: uuidv4()

    - bar:
        type: number
        eval: foo + 10
    - deviceClass:
        type: string?
        default: standard
        enum:
          - value: basic
          - value: standard
          - value: gateway
    - licenseType:
        type: string
        default: transferrable
        enum:
          - value: transferrable
          - value: fixed
    - microservices:
        type: boolean
`

const schema = cdsl.generate_ui(balenaSchema)

console.log(schema)

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {}
    };
  }

  onChange = ({ formData }) => {
    console.log(formData);
    this.setState({ formData });
  };

  render() {
    const { formData } = this.state;
    const monthsCommit = formData.monthsCommit || 0
    const monthsPrepay = formData.monthsPrepay || 0

    return (
      <Box p={3}>
        <Form
          schema={schema.json_schema}
          uiSchema={schema.ui_object}
          onFormChange={this.onChange}
        />

        <Box
          mt={3}
        >
          {monthsCommit * monthsPrepay}
        </Box>
      </Box>
    );
  }
}

export default App;

