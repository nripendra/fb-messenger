import * as React from 'react';
import * as ReactDOM from 'react-dom';
import electronRequire from "../electronRequire";


const debounce =  electronRequire ('lodash.debounce');

const WindowListenable = require ('material-ui/lib/mixins/window-listenable');
// const RenderToLayer = require ('material-ui/lib/render-to-layer');

const Extend = require('material-ui/lib/utils/extend');
const CssEvent = require('material-ui/lib/utils/css-event');
const Dom = require('material-ui/lib/utils/dom');
const PropTypes = require('material-ui/lib/utils/prop-types');
const Transitions = require('material-ui/lib/styles/transitions');
const Paper = require('material-ui/lib/paper');
const AutoPrefix = require('material-ui/lib/styles/auto-prefix');
const ContextPure = require('material-ui/lib/mixins/context-pure');

const ClickAwayable = require('material-ui/lib/mixins/click-awayable');
const StylePropable = require('material-ui/lib/mixins/style-propable');
const Events = require ('material-ui/lib/utils/events');
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const ListDivider = require('material-ui/lib/lists/list-divider');
const DefaultRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const ThemeManager = require('material-ui/lib/styles/theme-manager');

const Popover = React.createClass({

  mixins: [StylePropable, ClickAwayable],

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  propTypes: {
    closeOnItemTouchTap: React.PropTypes.bool,
    iconButtonElement: React.PropTypes.element.isRequired,
    iconStyle: React.PropTypes.object,
    openDirection: PropTypes.corners,
    onItemTouchTap: React.PropTypes.func,
    onKeyboardFocus: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseUp: React.PropTypes.func,
    onTouchTap: React.PropTypes.func,
    listStyle: React.PropTypes.object,
    style: React.PropTypes.object,
    touchTapCloseDelay: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
      closeOnItemTouchTap: true,
      openDirection: 'bottom-left',
      onItemTouchTap: () => {},
      onKeyboardFocus: () => {},
      onMouseDown: () => {},
      onMouseLeave: () => {},
      onMouseEnter: () => {},
      onMouseUp: () => {},
      onTouchTap: () => {},
      touchTapCloseDelay: 200,
    };
  },

  //for passing default theme context to children
  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getChildContext () {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  getInitialState () {
    return {
      muiTheme: this.context.muiTheme ? this.context.muiTheme : ThemeManager.getMuiTheme(DefaultRawTheme),
      iconButtonRef: this.props.iconButtonElement.props.ref || 'iconButton',
      listInitiallyKeyboardFocused: false,
      open: false,
    };
  },

  //to update theme inside state whenever a new theme is passed down
  //from the parent / owner using context
  componentWillReceiveProps (nextProps, nextContext) {
    let newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({muiTheme: newMuiTheme});
  },

  componentWillUnmount() {
    if (this._timeout) clearTimeout(this._timeout);
  },

  componentClickAway() {
    this.close();
  },

  render() {
    let {
      className,
      closeOnItemTouchTap,
      iconButtonElement,
      iconStyle,
      openDirection,
      onItemTouchTap,
      onKeyboardFocus,
      onMouseDown,
      onMouseLeave,
      onMouseEnter,
      onMouseUp,
      onTouchTap,
      listStyle,
      style,
      ...other,
    } = this.props;

    let open = this.state.open;
    let openDown = openDirection.split('-')[0] === 'bottom';
    let openLeft = openDirection.split('-')[1] === 'left';

    let styles = {
      root: {
        display: 'inline-block',
        position: 'relative',
      },

      list: {
        position:'absolute',
        top: openDown ? 'calc(100% - 10px)' : null,
        bottom: !openDown ? 12 : null,
        left: !openLeft ? 12 : null,
        right: openLeft ? 12 : null,
        zIndex: 2
      },
    };

    let mergedRootStyles = this.prepareStyles(styles.root, style);
    let mergedListStyles = this.mergeStyles(styles.list, listStyle);

    let iconButton = React.cloneElement(iconButtonElement, {
      onKeyboardFocus: this.props.onKeyboardFocus,
      iconStyle: this.mergeStyles(iconStyle, iconButtonElement.props.iconStyle),
      onTouchTap: (e) => {
        this.open(Events.isKeyboard(e));
        if (iconButtonElement.props.onTouchTap) iconButtonElement.props.onTouchTap(e);
      },
      ref: this.state.iconButtonRef,
    });

    let list = open ? (
      <List
        {...other}
        animated={true}
        initiallyKeyboardFocused={this.state.listInitiallyKeyboardFocused}
        onEscKeyDown={this._handleListEscKeyDown}
        onItemTouchTap={this._handleItemTouchTap}
        openDirection={openDirection}
        className='callout bottom box-shadow notification-popover'
        style={mergedListStyles}>
        {this.props.children}
      </List>
    ) : null;

    return (
      <div
        className={className}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        onTouchTap={onTouchTap}
        style={mergedRootStyles}>
        {iconButton}
        
        {list}
        
      </div>
    );
  },

  isOpen() {
    return this.state.open;
  },

  close(isKeyboard) {
    if (this.state.open) {
      this.setState({open: false}, () => {
        //Set focus on the icon button when the list close
        if (isKeyboard) {
          let iconButton = this.refs[this.state.iconButtonRef];
          ReactDOM.findDOMNode(iconButton).focus();
          iconButton.setKeyboardFocus();
        }
      });
    }
  },

  open(listInitiallyKeyboardFocused) {
    if (!this.state.open) {
      this.setState({
        open: true,
        listInitiallyKeyboardFocused: listInitiallyKeyboardFocused,
      });
    }
  },

  _handleItemTouchTap(e, child) {

    if (this.props.closeOnItemTouchTap) {
      let isKeyboard = Events.isKeyboard(e);

      this._timeout = setTimeout(() => {
        this.close(isKeyboard);
      }, this.props.touchTapCloseDelay);
    }

    this.props.onItemTouchTap(e, child);
  },

  _handleListEscKeyDown() {
    this.close(true);
  },

});

module.exports = Popover;
