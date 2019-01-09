import React from "react";
import ReactDOM from "react-dom";
import { Box, Provider } from "rendition";
import { Form } from "rendition/dist/unstable";

import * as cdsl from "balena-cdsl";

const JSONSchema = {
  type: "object",
  properties: {
    devices: {
      type: "number",
      title: "Devices"
    },
    monthsCommit: { type: "number", title: "Commitment (months)", default: 1 },
    monthsPrepay: { type: "number", title: "Prepayment (months)", default: 1 },
    deviceClass: {
      default: "standard",
      enum: ["basic", "standard", "gateway"]
    },
    licenseType: {
      default: "transferrable",
      enum: ["transferrable", "fixed"]
    },
    microservices: {
      type: "boolean"
    }
  }
};

const balenaSchema = `
  title: pricing
  version: 1
  properties:
    - devices:
        title: Devices
        type: number
    - monthsCommit:
        default: 0
        type: number
    - monthsPrepay:
        default: 0
        type: number
    - deviceClass:
        type: string
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
    return (
      <Box p={3}>
        <Form schema={schema.json_schema} uiSchema={schema.ui_object} onFormChange={this.onChange} />
        <Box mt={3}>{formData.monthsCommit * formData.monthsPrepay}</Box>
      </Box>
    );
  }
}

export default App;

