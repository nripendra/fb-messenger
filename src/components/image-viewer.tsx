
/// <reference path="../../typings/tsd.d.ts" />
import * as React from "react";

export interface IImageviewerProps {
    title: string;
    url: string;
    width: string;
    height: string;
    onRequestClose?: React.EventHandler<React.MouseEvent>;    
    open: boolean;
}

export default class ImageViewer extends React.Component<IImageviewerProps, any> {
    props: IImageviewerProps;
    private shouldScrollBottom: boolean;
    constructor(props: IImageviewerProps){
        super();
        this.props = props;
    }
    
    render() {
        console.log("rendering imageviewer %o", this.props);
        var maxHeight = 520;
        if(parseInt(this.props.height) < maxHeight) {
            maxHeight = parseInt(this.props.height); 
        }

        if(this.props.open == true) {
             return (<div onClick={this.props.onRequestClose} style={{position:"fixed", top:0, left:0, bottom:0, right:0, backgroundColor:"rgba(0,0,0,0.5)"}}>
                        <img src={this.props.url} style={{height: maxHeight, position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)"}} />
                    </div>);
        } else {
            return null;
        }
    }
}