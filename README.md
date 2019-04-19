# Creating react custom visual

This tutorial leads you to create the simplest custom visual using [React](https://reactjs.org/).

The result of that tutorial 
You can also clone it's the code directly from [github]().

## Install dependencies

1. Create basic PowerBI Custom Visual

```
pbiviz new ReactCircleCard
```

2. Step into new folder and launch (Visual Studio Code)[https://code.visualstudio.com/] 

```
cd ./ReactCircleCard; code .
```

3. Start developer server for your custom visual.
```
pbiviz start
```
![updatesVisual.jpg]

This basic visual represent updates count. Let's transform it to circle card, witch will represent some singular measure and it's title using React JS.

## Developing React component

1. Install required dependencies before coding.
```
npm i react react-dom
```

We also need to install typings.
```
npm i @types/react @types/react-dom
```
React 16 and corresponding versions of react-dom and typings are expected to be installed.

2. Let's start with the simple react component class.
Create `src/component.tsx` and copy the following code.

```javascript
import * as React from "react";

export class ReactCircleCard extends React.Component<{}>{
    render(){
        return (
            <div className="circleCard">
                Hello, React!
            </div>
        )
    }
}

export default ReactCircleCard;
```

3. Open `src/visual.ts`. Remove all the code except following lines:

```javascript
"use strict";
import "@babel/polyfill";
import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;


import "./../style/visual.less";

export class Visual implements IVisual {

    constructor(options: VisualConstructorOptions) {

    }

    public update(options: VisualUpdateOptions) {

    }
}
```

4. Import React dependencies and our component:

```javascript
import * as React from "react";
import * as ReactDOM from "react-dom";
...
import ReactCircleCard from "./component";
```

5. As you see, default PowerBI typescript settings are not ready for react tsx files. We need to improve `tsconfig.json` to use it. 

```json
{
  "compilerOptions": {
    "jsx": "react",
    "types": ["react", "react-dom"],
    ...
  }
}
```

6. Now all warnings disappear and we are ready to integrate our react component into custom visual. Let's render our component. The target HTML element can be found as `element` in `VisualConstructorOptions` object, passing into constructor.

```javascript
    private target: HTMLElement;
    private reactRoot: React.ComponentElement<any, any>;

    constructor(options: VisualConstructorOptions) {
        this.reactRoot = React.createElement(ReactCircleCard, {});
        this.target = options.element;

        ReactDOM.render(this.reactRoot, this.target);
    }
```

5. Finally, we can start our custom visual and see greeting from react component. Save the changes and run existing code.

```bash
pbiviz start
```

## Configuring capabilities.json

1. Open `capabilities.json`. Remove `Category Data` object from `dataRoles`. ReactCircleCard will display single value, so, we need only `Measure Data`.

```json
    "dataRoles": [
        {
            "displayName": "Measure Data",
            "name": "measure",
            "kind": "Measure"
        }
    ],
```

2. Remove all the content of `objects` key. It will be filled later.

```
    "objects": {},
```

3. Copy the following code of `dataViewMappings` property. Pay attention to `condition`: `max: 1` means that only one measure column can be submitted.

```json
      "dataViewMappings": [
      {
          "conditions": [
              {
                  "measure": {
                      "max": 1
                  }
              }
          ],
          "single": {
              "role": "measure"
          }
      }
  ]
```

Now you can drag some data from `Fields` pane into visual settings.

![dragTheMeasure.png]

## Receiving props from PowerBI visual

1. Let the component to display data from it's state. Improve `src/component.tsx`.

```javascript
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
    render(){
        const { textLabel, textValue } = this.state;

        return (
            <div className="circleCard">
                <p>
                    {textLabel}
                    <br/>
                    <em>{textValue}</em>
                </p>
            </div>
        )
    }
}
```

2. Add some style for new markup by editing `styles/visual.less`.

```less
.circleCard{
    position: relative;
    box-sizing: border-box;
    border: 1px solid #000;
    border-radius: 50%;
    width: 200px;
    height: 200px;
}

p {
    text-align: center;
    line-height: 30px;
    font-size: 20px;
    font-weight: bold;

    position: relative;
    top: -30px;
    margin: 50% 0 0 0;
}
```

3. Custom visuals receives current data as argument of `update` method. Open `src/visual.ts` and add the following code into `update` method. 

```typescript
    public update(options: VisualUpdateOptions) {

        if(options.dataViews && options.dataViews[0]){
            const dataView: DataView = options.dataViews[0];

            ReactCircleCard.update({
                textLabel: dataView.metadata.columns[0].displayName,
                textValue: dataView.single.value.toString()
            });
        }
    }
```

It picks `textValue` and `textLabel` from `DataView` and, if data exists, updates component state. That update method will be implemented at the next step.

4. To send the updates to the component instance insert the following into `ReactCircleCard` class:

```typescript
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
```

5. Now you can test the component. Make sure that `pbiviz start` is run and all files are saved and update developing visual.

![updateDevelopingVisualEllipsis.png]

You can toggle auto reload to keep it up-to-date with your code.

![toggleAutoReload.png]

# Getting the viewport properties

1. Our component have fixed width and height. At this step we will make it responsive. To do that, we will get current size of custom visual viewport from `options` inside. Let's start with importing of `IViewport` interface at `src/visual.ts` and adding the `viewport` property to visual class.

```typescript
import IViewport = powerbi.IViewport;
...
export class Visual implements IVisual {
    private viewport: IViewport;
    ...
}
```

2. Upgrade the `update` method of visual:

```typescript
        if (options.dataViews && options.dataViews[0]) {
            const dataView: DataView = options.dataViews[0];
            
            this.viewport = options.viewport;
            const { width, height } = options.viewport;
            const size = Math.min(width, height);

            ReactCircleCard.update({
                size,
                //...
            });
        }
```

3. Add new properties to `State` interface at `src/component.tsx`

```typescript
export interface State {
    //...
    size: number
}

const initialState: State = {
    //...
    size: 200
}
```

4. Make following changes at `render` method

```tsx
    render() {
        const { textLabel, textValue, size } = this.state;

        const style: React.CSSProperties = { width: size, height: size };

        return (
            <div className="circleCard" style={style}>
                {/* ... */}
            </div>
        )
    }
```

5. Replace `width` and `height` rules in `style/visual.less`

```less
    min-width: 200px;
    min-height: 200px;
```


# Working with settings

I's time to make the visual customizable. 

1. Go to `capabilities.json` and describe settings in `objects` property

```json
...
  "objects": {
      "circle": {
          "displayName": "Circle",
          "properties": {
              "circleColor": {
                  "displayName": "Color",
                  "description": "The fill color of the circle.",
                  "type": {
                      "fill": {
                          "solid": {
                              "color": true
                          }
                      }
                  }
              },
              "circleThickness": {
                  "displayName": "Thickness",
                  "description": "The circle thickness.",
                  "type": {
                      "numeric": true
                  }
              }
          }
      }
  },
...

```

2. Replace existing code from `src/settings.ts` with new one:

```typescript
"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class CircleSettings {
    public circleColor: string = "white";
    public circleThickness: number = 2;
}

export class VisualSettings extends DataViewObjectsParser {
    public circle: CircleSettings = new CircleSettings();
}
```

3. Import required dependencies at the top of `src/visual.ts`

```typescript
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
...

import { VisualSettings } from "./settings";

```

4. `enumerateObjectInstances` is used to apply visual settings. Improve `src/visual.ts` inserting that lines:

```typescript
    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions
    ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {

        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
```

5. Now the settings can be get from DataView.

```typescript
export class Visual implements IVisual {
    private settings: VisualSettings;
    ...

    public update(options: VisualUpdateOptions) {

        if(options.dataViews && options.dataViews[0]){
            //...
            this.settings = VisualSettings.parse(dataView) as VisualSettings;
            const object = this.settings.circle;

            ReactCircleCard.update({
                borderWidth: object && object.circleThickness ? object.circleThickness : undefined,
                color: object && object.circleColor ? object.circleColor : undefined,
                //...
            });
        }
    }
}
```

6. Apply the corresponding changes to `src/component.tsx`. Extend `State` interface first.

```typescript
export interface State {
    //...
    background?: string,
    borderWidth?: number
}
```
...and type following into `render` method.

```typescript
    const { /*...*/ color, thickness } = this.state;

    const style: React.CSSProperties = {
        //...
        background: color,
        borderWidth: thickness
    };
```