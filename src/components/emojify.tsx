/*! jMinEmoji v1.0.0 | (c) 2014 RodrigoPolo.com | https://github.com/rodrigopolo/minEmoji/blob/master/LICENSE */
//based on minEmoji: https://github.com/rodrigopolo/minEmoji

import * as React from 'react';
import emoji from "../services/emoji-map";

export class EmojiProps {
	messageText: string
}

export default class Emojify extends React.Component<EmojiProps, any> {
  private emoji: { [key: string]: number; };
  private emoticons: { [key: string]: string; };
  private regx: RegExp;
	constructor(props: EmojiProps) {
    super();
    this.props = props;
		
		
    //Based on: https://github.com/banyan/emoji-emoticon-to-unicode
    // emoticon lists are from https://github.com/Ranks/emojione/blob/master/lib/js/emojione.js
		this.emoticons = {
      '<3':'2764',
      '</3':'1f494',
      ':\')':'1f602',
      ':\'-)':'1f602',
      ':D':'1f603',
      ':-D':'1f603',
      '=D':'1f603',
      ':)':'1f604',
      ':-)':'1f604',
      '=]':'1f604',
      '=)':'1f604',
      ':]':'1f604',
      '\':)':'1f605',
      '\':-)':'1f605',
      '\'=)':'1f605',
      '\':D':'1f605',
      '\':-D':'1f605',
      '\'=D':'1f605',
      '>:)':'1f606',
      '>;)':'1f606',
      '>:-)':'1f606',
      '>=)':'1f606',
      ';)':'1f609',
      ';-)':'1f609',
      '*-)':'1f609',
      '*)':'1f609',
      ';-]':'1f609',
      ';]':'1f609',
      ';D':'1f609',
      ';^)':'1f609',
      '\':(':'1f613',
      '\':-(':'1f613',
      '\'=(':'1f613',
      ':*':'1f618',
      ':-*':'1f618',
      '=*':'1f618',
      ':^*':'1f618',
      '>:P':'1f61c',
      'X-P':'1f61c',
      'x-p':'1f61c',
      '>:[':'1f61e',
      ':-(':'1f61e',
      ':(':'1f61e',
      ':-[':'1f61e',
      ':[':'1f61e',
      '=(':'1f61e',
      '>:(':'1f620',
      '>:-(':'1f620',
      ':@':'1f620',
      ':\'(':'1f622',
      ':\'-(':'1f622',
      ';(':'1f622',
      ';-(':'1f622',
      '>.<':'1f623',
      ':$':'1f633',
      '=$':'1f633',
      '#-)':'1f635',
      '#)':'1f635',
      '%-)':'1f635',
      '%)':'1f635',
      'X)':'1f635',
      'X-)':'1f635',
      '*\\0/*':'1f646',
      '\\0/':'1f646',
      '*\\O/*':'1f646',
      '\\O/':'1f646',
      'O:-)':'1f607',
      '0:-3':'1f607',
      '0:3':'1f607',
      '0:-)':'1f607',
      '0:)':'1f607',
      '0;^)':'1f607',
      'O:)':'1f607',
      'O;-)':'1f607',
      'O=)':'1f607',
      '0;-)':'1f607',
      'O:-3':'1f607',
      'O:3':'1f607',
      'B-)':'1f60e',
      'B)':'1f60e',
      '8)':'1f60e',
      '8-)':'1f60e',
      'B-D':'1f60e',
      '8-D':'1f60e',
      '-_-':'1f611',
      '-__-':'1f611',
      '-___-':'1f611',
      '>:\\':'1f615',
      '>:/':'1f615',
      ':-/':'1f615',
      ':-.':'1f615',
      ':/':'1f615', //treat specially, it matches with "http://"
      ':\\':'1f615',
      '=/':'1f615',
      '=\\':'1f615',
      ':L':'1f615',
      '=L':'1f615',
      ':P':'1f61b',
      ':-P':'1f61b',
      '=P':'1f61b',
      ':-p':'1f61b',
      ':p':'1f61b',
      '=p':'1f61b',
      ':-Þ':'1f61b',
      ':Þ':'1f61b',
      ':þ':'1f61b',
      ':-þ':'1f61b',
      ':-b':'1f61b',
      ':b':'1f61b',
      'd:':'1f61b',
      ':-O':'1f62e',
      ':O':'1f62e',
      ':-o':'1f62e',
      ':o':'1f62e',
      'O_O':'1f62e',
      '>:O':'1f62e',
      ':-X':'1f636',
      ':X':'1f636',
      ':-#':'1f636',
      ':#':'1f636',
      '=X':'1f636',
      '=x':'1f636',
      ':x':'1f636',
      ':-x':'1f636',
      '=#':'1f636'
    };
  
    var regx_arr=new Array<string>();
    for(var k in emoji){
      regx_arr.push(this.ca(k));
    }
    this.regx = new RegExp('(' + regx_arr.join('|') + ')', 'g');
    regx_arr = null;
  }
	
	ca(r:string){
		for(var t="",n=0;n<r.length;n++)
			t+="\\u"+("000"+r[n].charCodeAt(0).toString(16)).substr(-4);
		return t;
	}
	
	mapAlternate(array: Array<string>, fn1: Function, fn2: Function) {
		var fn = fn1, output = new Array<React.Component<any, any>>();
		for (var i=0; i<array.length; i++){
			output[i] = fn.call(this, array[i], i, array);
			// toggle between the two functions
			fn = fn === fn1 ? fn2 : fn1;
		}
		return output;
	}
  
  escapeRegExp(str: string) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

	render() {
    var s = this.props.messageText;
    
    for(var k in this.emoticons) {
      var regxEmoticon = new RegExp('(' + this.escapeRegExp(k) + ')', 'g'); 
      if(k == ':/') {
        //mostly based on hit and trial... matches :/ but not followed by /
        regxEmoticon = /(:\/(?!\/))/g;
      }
       s = s.replace(regxEmoticon,  (function (a:string, b:string) {
        return String.fromCodePoint(parseInt(this.emoticons[b], 16));
       }).bind(this));
    }
		
		s = s.replace(this.regx, (function (a:string, b:string) {
			return '{{emoji:'+ emoji[b]+'}}';
		}).bind(this));
    
    //@ref: http://stackoverflow.com/questions/24348662/reactjs-how-to-insert-react-component-into-string-and-then-render
	  var parts = s.split(/\{\{emoji:|\}\}/g);
    var children = this.mapAlternate(parts, 
								(x:string) => { return <span>{x}</span>; }, 
								(x:string) => { return <span className={'em emj'+ x}></span> });
              
    return (<div>{children}</div>);
	}
}
