
/// <reference path="../../typings/tsd.d.ts" />
import * as React from "react";
import ChatActions from "../actions/chatactions";

export interface IImageviewerProps {
    imageInfo: any;
}

export default class ImageViewer extends React.Component<IImageviewerProps, any> {
    props: IImageviewerProps;
    private shouldScrollBottom: boolean;
    constructor(props: IImageviewerProps){
        super();
        this.props = props;
    }
    
    hideImage() {
        ChatActions.showImage({});
    }
    
    componentDidMount(){
        console.log("ImageViewer componentDidMount..");
    }
    
    componentDidUnMount(){
        console.log("ImageViewer componentDidMount..");
    }
    
    render() {
        console.log("rendering imageviewer %o", this.props);
        var image = this.props.imageInfo || {url: "", width: 0, height: 0};
        var open = (image.url || "").length > 0;
        console.log("imageviewer render : %o", image);
        if(open == true) {
            var maxHeight = 520;
            if(parseInt(image.height) < maxHeight) {
                maxHeight = parseInt(image.height); 
            }
            return (<div onClick={this.hideImage} style={{position:"fixed", zIndex:1, top:0, left:0, bottom:0, right:0, backgroundColor:"rgba(0,0,0,0.5)"}}>
                        <img src={image.url} style={{height: maxHeight, position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)"}} />
                    </div>);
        } else {
            return null;
        }
    }
}