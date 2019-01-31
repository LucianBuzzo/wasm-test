import * as cdsl from "balena-cdsl";
import * as temen from "balena-temen";
import React from "react";
import ReactDOM from "react-dom";
import { Box, Provider, Txt } from "rendition";
import Form from "react-jsonschema-form";
import * as _ from 'lodash'
import BaseInput from "./BaseInput.jsx"

const widgets = {
  BaseInput
}

const balenaSchema = `
  title: pricing
  version: 1
  properties:
    - devices:
        title: Devices
        type: number
        default: 1000
    - months:
        title: Commitment (months)
        default: 12
        type: number
    - yearDiscount:
        title: Year Discount
        default: 0
        type: number
    - stepdownFactor:
        title: Stepdown Factor
        default: 0.9
        type: number
    - classMultiplier:
        title: Device Class
        type: string?
        default: 1
        enum:
          - title: basic
            value: 0.9
          - title: standard
            value: 1
          - title: gateway
            value: 1.1
    - licenseMultiplier:
        title: License Type
        type: string
        default: 1
        enum:
          - title: Transferrable
            value: 1
          - title: Fixed
            value: 0.8
    - microservices:
        type: number
        default: 0
        enum:
          - title: Yes
            value: 1
          - title: No
            value: 0
    - microservices_boost:
        title: Multicontainer Boost
        type: number
        default: 0.5
    - unit:
        title: Base unit price
        type: number
        default: 1
    - Result:
        properties:
          - Total:
              formula: >
                devices * months * unit *
                  (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
                  POW(stepdownFactor, LOG10(MAX((devices * months) / 1000, 1))) *
                  licenseMultiplier *
                  classMultiplier *
                  (1 + microservices_boost * microservices)
              readOnly: true
              type: number
          - devpm:
              title: Per dev/mo
              formula: >
                unit *
                  (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
                  POW(stepdownFactor, LOG10(MAX((devices * months) / 1000, 1))) *
                  licenseMultiplier *
                  classMultiplier *
                  (1 + microservices_boost * microservices)
              readOnly: true
              type: number
          - marginalDevice:
              title: Marginal Device
              formula: >
                ((devices * months * unit *
                  (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
                  POW(stepdownFactor, LOG10(MAX((devices * months) / 1000, 1))) *
                  licenseMultiplier *
                  classMultiplier *
                  (1 + microservices_boost * microservices))
                   -
                  ((devices-1) * months * unit *
                  (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
                  POW(stepdownFactor, LOG10(MAX((devices * months) / 1000, 1))) *
                  licenseMultiplier *
                  classMultiplier *
                  (1 + microservices_boost * microservices))) / months
              readOnly: true
              type: number

`
/*
    - devpm:
        title: Per dev/mo
        formula: >
          unit *
            (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
            POW(stepdownFactor, LOG10(Math.max((devices * months) / 1000))) *
            licenseMultiplier *
            classMultiplier *
            (1 + microservices_boost * microservices)

    - marginalDevice:
        title: Marginal Device
        formula: >
          ((devices * months * unit *
            (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
            POW(stepdownFactor, LOG10(Math.max((devices * months) / 1000))) *
            licenseMultiplier *
            classMultiplier *
            (1 + microservices_boost * microservices))
             -
            ((devices-1) * months * unit *
            (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
            POW(stepdownFactor, LOG10(Math.max((devices * months) / 1000))) *
            licenseMultiplier *
            classMultiplier *
            (1 + microservices_boost * microservices))) / months
        readOnly: true
        type: number

          devices * months * unit *
              (1 - (((months > 11 ? 13 : 0) + (months-1))/24) * yearDiscount) *
              POW(stepdownFactor, LOG10((devices * months) / 1000, 1)) *
              licenseMultiplier *
              classMultiplier *
              (1 + microservices_boost * microservices)
              */

const schema = cdsl.generate_ui(balenaSchema)

console.log(schema)

console.log(temen)

schema.ui_object['ui:order'] = schema.json_schema.$$order

const getFormulaKeys = function(obj, prefix){
  var keys = Object.keys(obj);
  prefix = prefix ? prefix + '.' : '';
  return keys.reduce(function(result, key){
    if (_.isPlainObject(obj[key])){
      result = result.concat(getFormulaKeys(obj[key], prefix + key));
    } else if (key === '$$formula') {
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
      <Box p={3} mx='auto' style={{maxWidth: 666}}>
        <Form
          widgets={widgets}
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

