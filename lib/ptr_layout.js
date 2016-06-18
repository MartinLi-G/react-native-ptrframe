'use strict';

import React, {
  Component
} from 'react';

import {
  View,
  PanResponder,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';

import Dimensions from 'Dimensions';
let H = Dimensions.get('window').height;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  }
});

export default class PtrLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offsetHeader: 0,
      loadingState: 'default',
    };
    this.maxOffset = this.props.maxOffset || 150;
    this.refreshOffset = this.props.refreshOffset || 100;
    this._initProps();
    this._initPanResponder();
  }

  complete() {
    if (this.state.loadingState === 'default') {
    } else {
      LayoutAnimation.configureNext({
        duration: 400,
        create: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.scaleXY,
        },
        update: {
          type: LayoutAnimation.Types.linear,
        }
      });
      this.setState({offsetHeader: 0, loadingState: 'default'});
    }
  }

  _initProps() {
    this._renderPtrHeader = this.props.renderPtrHeader;
    if (typeof this._renderPtrHeader === 'undefined' || this._renderPtrHeader === null) {
      this._renderPtrHeader = ()=>{
        return (
          <View style={{height: this.maxOffset, backgroundColor: '#00FF00'}}></View>
        )
      };
    }
    this._ptrEnabled = this.props.ptrEnabled;
//    if (typeof this._enabled === 'undefined' || this._enabled === null) {
//      this._enabled = ()=>false;
//    }
  }

  _initPanResponder() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return this._ptrEnabled()},
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (gestureState.dy<0)
          return false;
        return this._ptrEnabled();
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

      onPanResponderMove: (evt, gestureState) => {
        if (this._ptrEnabled()) {
          let dy = gestureState.dy;
          let max = this.maxOffset;
          let n = 20000;
          if (dy > 0) {
            dy = max - max * n/(dy * max + n);
            console.log('y = ' + dy);
            let ls = dy > this.refreshOffset ? 'toRefresh' : 'toCancel';
            this.setState({offsetHeader: dy, loadingState: ls});
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (this.state.loadingState === 'toRefresh') {
          this.setState({offsetHeader: this.refreshOffset, loadingState: 'refreshing'});
          this.props.onRefresh();
        } else {
          this.complete();
        }
      }
    });
  }

  render() {
    return (
      <View style={[styles.root, this.props.style]}
        {...this._panResponder.panHandlers}
        >
        <View style={[styles.header, {height: this.state.offsetHeader}]}>
          {this._renderPtrHeader(this.state.offsetHeader, this.refreshOffset, this.state.loadingState)}
        </View>
        <View style={styles.body, {height: H - 49 - 64 - this.state.offsetHeader}}>
          {this.props.children}
        </View>
      </View>
    );
  }

}
