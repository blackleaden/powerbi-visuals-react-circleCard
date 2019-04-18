import * as React from "react";
import powerbi from "powerbi-visuals-api";
import * as ReactDOM from "react-dom";

import DataView = powerbi.DataView;
import VisualObjectInstance = powerbi.VisualObjectInstance;

import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

import ReactCircleCard from "./component";
import { VisualSettings } from "./settings";

export class Visual implements IVisual {
    protected target: HTMLElement;
    protected host: IVisualHost;
    protected settings: VisualSettings;
    protected root: React.ComponentElement<any, any>;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.root = React.createElement(ReactCircleCard, {});
        this.target = options.element;

        ReactDOM.render(this.root, this.target);
    }

    public update(options: VisualUpdateOptions) {

        if(options.dataViews && options.dataViews[0]){
            const dataView: DataView = options.dataViews[0];
            this.settings = VisualSettings.parse(dataView) as VisualSettings;
            const object = this.settings.circle;
            
            ReactCircleCard.update({
                color: object && object.circleColor ? object.circleColor : undefined,
                textLabel: dataView.metadata.columns[0].displayName,
                textValue: dataView.single.value.toString()
            });
        }
  }

  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {

    return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
  }
}