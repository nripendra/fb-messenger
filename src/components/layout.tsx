import * as React from 'react';

/**
 * Style
 * @ref: https://gist.github.com/Munawwar/7926618
 */
export var Style: any = {
  merge(target: any) {
      //@ref = https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(nextSource);
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    },
    "hbox": {
        display: "flex",
        flexDirection: "row",
        alignContent: "flex-start",
        padding: "2px"
    },
    "vbox": {
        display: "flex",
        flexDirection: "column",
        alignContent: "flex-start",
        padding: "2px"
    },
    /*Stretch item along parent's main-axis*/
    "flex": function(value:number){
        value = value || 1;
        return {
        WebkitFlex: value,
        msFlex: value,
        flex: value
      };
    },
    /*Stretch item along parent's cross-axis*/
    "stretch": {
        alignSelf: "stretch"
    },

    /*Stack child items to the main-axis start*/
    "mainStart": {
        WebkitJustifyContent: "flex-start",
        msFlexPack: "flex-start",
        justifyContent: "flex-start"
    },
    /*Stack child items to the cross-axis start*/
    "crossStart": {
        WebkitAlignItems: "flex-start",
        msFlexAlign: "flex-start",
        alignItems: "flex-start",

        WebkitAlignContent: "flex-start",
        msFlexLinePack: "start",
        alignContent: "flex-start"
    },
    /*Stack child items to the main-axis center*/
    "mainCenter": {
        WebkitJustifyContent: "center",
        msFlexPack: "center",
        justifyContent: "center"
    },
    /*Stack child items to the cross-axis center*/
    "crossCenter": {
        WebkitAlignItems: "center",
        msFlexAlign: "center",
        alignItems: "center",

        webkitAlignContent: "center",
        msFlexLinePack: "center",
        alignContent: "center"
    },
    /*Stack child items to the main-axis end.*/
    "mainEnd": {
        webkitJustifyContent: "flex-end",
        msFlexPack: "end",
        justifyContent: "flex-end"
    },
    /*Stack child items to the cross-axis end.*/
    "crossEnd": {
        WebkitAlignItems: "end",
        msFlexAlign: "end",
        AlignItems: "end",

        WebkitAlignContent: "flex-end",
        msFlexlinePack: "end",
        alignContent: "flex-end"
    },
    /*Stretch child items along the cross-axis*/
    "crossStretch": {
        WebkitAlignItems: "stretch",
        msFlexAlign: "stretch",
        alignItems: "stretch",

        WebkitAlignContent: "stretch",
        msFlexlinePack: "stretch",
        alignContent: "stretch"
    },

    /*Wrap items to next line on main-axis*/
    "wrap": {
        WebkitflexWrap: "wrap",
        msFlexWrap: "wrap",
        flexWrap: "wrap"
    }
}

export class Hbox extends React.Component<any, any> {
	render() {
    var style = Style.merge({}, Style.hbox, this.props.style || {});
		return (
			<div style={ style } data-box-layout="hbox">
			{ this.props.children }
			</div>
		);
	}
}

export class Vbox extends React.Component<any, any> {
	render() {
    var style = Style.merge({}, Style.vbox, this.props.style || {});
		return (
			<div style={ style } data-box-layout="vbox">
			{ this.props.children }
			</div>
		);
	}
}
