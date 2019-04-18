
"use strict";
import * as React from "react";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import "./../style/visual.less";
import { VisualSettings } from "./settings";

export interface State {
    textLabel: string,
    textValue: string,
    color?: string,
    textSize?: number
}

const initialState: State = {
    textLabel: "",
    textValue: ""
}

export class ReactCircleCard extends React.Component<{}, State>{
    private static updateCallback: (data: object) => void = null;

    public static update(newState: State) {
        if(typeof ReactCircleCard.updateCallback === 'function'){
            ReactCircleCard.updateCallback(newState);
        }
    }

    public state: State = initialState;

    public componentWillMount() {
        ReactCircleCard.updateCallback = (newState: State): void => { this.setState(newState); };
    }

    public componentWillUnmount() {
        ReactCircleCard.updateCallback = null;
    }

    render(): React.ReactElement{
        const { textLabel, textValue, color } = this.state;

        const style = color
            ? { background: color } 
            : {};

        return (
            <div className="circleCard">
                <p>
                    {textLabel}
                    <br/>
                    <em style={style}>{textValue}</em>
                </p>
            </div>
        )
    }

    public update = (newState: State): void => {
        this.setState(newState);
    }
}

export default ReactCircleCard;