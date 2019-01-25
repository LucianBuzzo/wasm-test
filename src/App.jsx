import * as cdsl from "balena-cdsl";
import * as temen from "balena-temen";
import React from "react";
import ReactDOM from "react-dom";
import { Box, Provider, Txt } from "rendition";
import Form from "react-jsonschema-form";
import * as _ from 'lodash'

const balenaSchema = `
  title: pricing
  version: 1
  properties:
    - foo:
        formula: UUIDV4()
        type: string
    - devices:
        title: Devices
        type: number
        default: 1000
    - monthsCommit:
        title: Commitment (months)
        default: 12
        type: number
    - monthsPrepay:
        title: Prepayment (months)
        default: 20
        type: number
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
    - unit:
        title: Base unit price
        type: number
        default: 1
    - Total:
        formula: >
          devices * monthsCommit * unit
        readOnly: true
        type: number
`

const schema = cdsl.generate_ui(balenaSchema)

console.log(schema)

console.log(temen)

var isobject = function(x){
    return Object.prototype.toString.call(x) === '[object Object]';
};

const getFormulaKeys = function(obj, prefix){
  var keys = Object.keys(obj);
  prefix = prefix ? prefix + '.' : '';
  return keys.reduce(function(result, key){
    if(isobject(obj[key])){
      result = result.concat(getFormulaKeys(obj[key], prefix + key));
    }else if (key === '$$formula') {
      result.push(prefix + key);
    }
    return result;
  }, []);
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: {}
    };
  }

  onChange = ({ formData }) => {
    console.log(formData);

    console.log(getFormulaKeys(schema.json_schema))

    const keys = getFormulaKeys(schema.json_schema).map(path => {
      return {
        formula: _.get(schema.json_schema, path),
        path: path.replace(/properties\./g, '')
      }
    })

    const data = _.cloneDeep(formData)

    keys.forEach((y) => {
      _.set(data, y.path, y.formula)
    })

    console.log( { keys })

    console.log(data)

    let evaluate

    try {
      evaluate = temen.evaluate(data)
    } catch (e) {
      console.error(e)
      evaluate = formData
    }

    console.log(evaluate)

    this.setState({ formData: _.merge({}, formData, evaluate) });

  };

  render() {
    const { formData } = this.state;

    return (
      <Box p={3} mx='auto' style={{maxWidth: 960}}>
        <Form
          formData={formData}
          schema={schema.json_schema}
          uiSchema={schema.ui_object}
          onChange={this.onChange}
        />
      </Box>
    );
  }
}

export default App;

