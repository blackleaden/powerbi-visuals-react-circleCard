import * as React from "react";
import { ReactVisual } from './powerbi-visual-react';
import powerbi from "powerbi-visuals-api";

import IVisual = powerbi.extensibility.visual.IVisual;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import "./../style/visual.less";

export class Visual extends ReactVisual implements IVisual {
  public update(options: VisualUpdateOptions) {
    super.update(options)
  }
  
  public render(props: VisualUpdateOptions): React.ReactElement {
    console.log('props', props);
    if (props.dataViews && props.dataViews[0]) {
      const dataView = props.dataViews[0];
      const textLabel = dataView.metadata.columns[0].displayName;
      const textValue = dataView.single.value;
      return (
        <div className="circleCard">
          <p>{textLabel} 
          <br/>
          <em>{textValue}</em>
          </p>
        </div>
      )
    }
    return (
      <div >
        Hello React Card!
      </div>
    )

  }
}