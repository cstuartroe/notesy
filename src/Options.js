import React, { Component } from "react";

import { keyAdjustments } from "./constants";

const noteRangeOptions = [
  {title: "E4-F5", value: 9},
  {title: "C4-A5", value: 13},
  {title: "A3-C6", value: 17}
];

const keyPossibilitiesOptions = [
  {title: "C", value: ["C"]},
  {title: "F, C, G, D, A", value: ["F", "C", "G", "D", "A"]},
  {title: "All keys", value: Object.keys(keyAdjustments)}
];

const noteDurationsOptions = [
  {title: "1/4", value: [1]},
  {title: "1, 1/4, 1/2, 1/8", value: [.5, .5, 1, 1, 1, 1, 2, 4]},
  {title: "All", value: [.5, .5, 1, 1, 1, 1, 1.5, 2, 4]}
];

const optionsTypes = {
  noteRange: noteRangeOptions,
  keyPossibilities: keyPossibilitiesOptions,
  noteDurations: noteDurationsOptions
};

const optionsTitles = {
  noteRange: "Note Range",
  keyPossibilities: "Available Keys",
  noteDurations: "Available Note Types"
}

class Options extends Component {
  optionSet(name, value){
    let { parent } = this.props;

    if (parent.state[name] === value) { return; }
    let d = {};
    d[name] = value;
    parent.setState(d, parent.restart);
  }

  render() {
    let { name, parent } = this.props;

    return (
      <div className="col-12 col-md-6 col-lg-4"><div className="options">
        <div className="optionTitle">{optionsTitles[name]}</div>
        {optionsTypes[name].map((choice, i) =>
          <div key={i}
               className={"option" +
               (choice.value === parent.state[name] ? " option-selected" : "")}
               onClick={() => this.optionSet(name, choice.value)}>
              {choice.title}
          </div>
        )}
      </div></div>
    );
  }
}

export default Options;
export { keyPossibilitiesOptions, noteDurationsOptions };