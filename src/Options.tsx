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
    {title: "All keys", value: [...playableKeys]},
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

const maxVoicesMenuInfo: OptionsMenuInfo<number> = {
  title: "Maximum Voices",
  options: [
    {title: "1", value: 1},
    {title: "2", value: 2},
    {title: "3", value: 3},
  ]
}

export const menuInfo = {
  noteRange: noteRangeMenuInfo,
  keyPossibilities: keyPossibilitiesMenuInfo,
  noteDurations: noteDurationsMenuInfo,
  maxVoices: maxVoicesMenuInfo,
};

type Props<T> = {
  current: T,
  options: OptionsMenuInfo<T>,
  update: (t: T) => void,
}

function OptionsChooser<T>({ current, options, update }: Props<T>) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="options">
        <div className="optionTitle">{options.title}</div>
        {options.options.map((choice, i) =>
            <div key={i}
                 className={"option" +
                 (choice.value === current ? " option-selected" : "")}
                 onClick={() => choice.value != current ? update(choice.value) : null}>
              {choice.title}
            </div>
        )}
      </div>
    </div>
  );
}

export default OptionsChooser;