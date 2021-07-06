import React, { Component } from "react";

import {playableKeys, playableKey} from "./constants";

export type Option<V> = {
  title: string,
  value: V,
};

export type OptionsMenuInfo<V> = {
  title: string,
  options: Option<V>[],
}

const noteRangeMenuInfo: OptionsMenuInfo<number> = {
  title: "Note Range",
  options: [
    {title: "E4-F5", value: 9},
    {title: "C4-A5", value: 13},
    {title: "A3-C6", value: 17},
  ],
};

const keyPossibilitiesMenuInfo: OptionsMenuInfo<playableKey[]> = {
  title: "Available Keys",
  options: [
    {title: "C", value: ["C"]},
    {title: "F, C, G, D, A", value: ["F", "C", "G", "D", "A"]},
    {title: "All keys", value: playableKeys},
  ],
};

const noteDurationsMenuInfo: OptionsMenuInfo<number[]> = {
  title: "Available Note Types",
  options: [
    {title: "1/4", value: [1]},
    {title: "1, 1/4, 1/2, 1/8", value: [.5, .5, 1, 1, 1, 1, 2, 4]},
    {title: "All", value: [.5, .5, 1, 1, 1, 1, 1.5, 2, 4]},
  ],
};

export const menuInfo = {
  noteRange: noteRangeMenuInfo,
  keyPossibilities: keyPossibilitiesMenuInfo,
  noteDurations: noteDurationsMenuInfo,
};

type Props<T> = {
  current: Option<T>,
  options: OptionsMenuInfo<T>,
  update: (t: Option<T>) => void,
}

class OptionsChooser<T> extends Component<Props<T>> {
  render() {
    let { current, options, update } = this.props;

    return (
      <div className="col-12 col-md-6 col-lg-4"><div className="options">
        <div className="optionTitle">{options.title}</div>
        {options.options.map((choice, i) =>
          <div key={i}
               className={"option" +
               (choice.value === current.value ? " option-selected" : "")}
               onClick={() => update(choice)}>
              {choice.title}
          </div>
        )}
      </div></div>
    );
  }
}

export default OptionsChooser;