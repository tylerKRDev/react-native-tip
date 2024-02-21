import React, { Component } from 'react'
import { Animated, Dimensions, Easing, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import TipManager from './TipManager'
import { ARROW_HEIGHT, ARROW_WIDTH, RENDER_BOUNDARY, clearItemStyles, getItemCoordinates, getTipPositionProps } from './utils'

export default class TipProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.animation = new Animated.Value(0)
    this.overlayAnimation = new Animated.Value(0)
    this.pulseAnim = new Animated.Value(0)
  }

  componentDidMount() {
    TipManager.register(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.itemCoordinates !== this.state.itemCoordinates) {
      if (this.state.itemCoordinates) {
        this.animation.setValue(0)
        this.animateIn()
      }
    }
  }

  showTip = async (tip) => {
    if (this.state.itemCoordinates) {
      this.pulseAnim.setValue(0)
      this.animation.setValue(0)
      this.overlayAnimation.setValue(1)
      this.setState({ tipHasProps: false })
    }

    const itemCoordinates = await getItemCoordinates(tip.target, this.props.statusBarTranslucent)

    this.setState({
      ...tip,
      itemCoordinates,
      destroyItemImediatelly: null
    })
  }

  closeTip = () => {
    this.animateOut()
  }

  hideCurrentTip = () => {
    this.setState({ destroyItemImediatelly: true })

    Animated.parallel([
      Animated.timing(this.animation, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start()
  }

  componentWillUnmount() {
    TipManager.unregister(this)
  }

  animatePulse = () => {
    const {
      showItemPulseAnimation = this.props.showItemPulseAnimation
    } = this.state

    if (!showItemPulseAnimation) return

    return Animated.loop(
      Animated.timing(this.pulseAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      })
    ).start()
  }

  animateIn = () => {
    Animated.parallel([
      Animated.timing(this.animation, {
        toValue: 1,
        duration: 250,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(this.overlayAnimation, {
        toValue: 1,
        duration: 250,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => this.animatePulse())
  }

  animateOut = () => {
    this.setState({ destroyItemImediatelly: true })

    Animated.parallel([
      Animated.timing(this.animation, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(this.overlayAnimation, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => {
      this.pulseAnim.setValue(0)
      this.animation.setValue(0)
      this.overlayAnimation.setValue(0)
      this.setState({ itemCoordinates: null, tipHasProps: false })
    })
  }

  onTipLayout = (e) => {
    if (this.state.tipHasProps) return
    const { height, width } = e.nativeEvent.layout
    const tipProps = getTipPositionProps(this.state.itemCoordinates, height, width)
    this.setState({ ...tipProps })
  }

  renderOverlay() {
    const {
      dismissable = true,
      onDismiss,
      overlayOpacity
    } = this.state;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (onDismiss) {
            onDismiss();
          } else {
            dismissable && this.closeTip();
          }
        }}
      >
        <Animated.View
          style={{
            ...StyleSheet.absoluteFill,
            opacity: this.overlayAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            }),
            backgroundColor: this.props.overlayComponent ? "rgba(0,0,0,0)" : `rgba(0,0,0,${overlayOpacity || 0.6})`
          }}
        >
          {this.props.overlayComponent}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  getTipAnimation() {
    const {
      pivotPoint = { x: 0, y: 0 }
    } = this.state

    return {
      opacity: this.animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1]
      }),
      transform: [
        { translateX: -1 * pivotPoint.x },
        { translateY: -1 * pivotPoint.y },
        {
          scale:
            this.animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            })
        },
        { translateX: pivotPoint.x },
        { translateY: pivotPoint.y }
      ]
    }
  }

  renderItemPulseAnimation = (coordinates) => {
    const {
      pulseColor = this.props.pulseColor,
      pulseStyle = this.props.pulseStyle,
      pulseIntensity = this.props.pulseIntensity || 1.5
    } = this.state

    let top = 0
    if (pulseStyle?.height) {
      top = (coordinates.height - pulseStyle.height) / 2
    }

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top,
          ...coordinates,
          ...pulseStyle,
          alignSelf: 'center',
          backgroundColor: pulseColor,
          transform: [
            {
              scaleX: this.pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, pulseIntensity]
              })
            },
            {
              scaleY: this.pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, pulseIntensity]
              })
            }
          ],
          opacity: this.pulseAnim.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0, 0.6, 0]
          })
        }} />
    )
  }

  renderTip() {
    const {
      title,
      body,
      titleStyle = {},
      bodyStyle = {},
      tipContainerStyle = {},
      renderTip,
      onTipPress,
      tipPosition,
      arrowPosition,
      tourProps
    } = this.state

    const {
      darkMode: isDarkMode,
      prevNextTextStyle,
      prevNextButtonStyle,
      prevButtonLabel = 'Prev',
      nextButtonLabel = 'Next',
      closeButtonLabel = 'Close'
    } = this.props

    const tipStyle = {
      backgroundColor: isDarkMode ? '#303030' : 'white',
      ...this.props.tipContainerStyle,
      ...tipContainerStyle
    }

    const _titleStyle = {
      color: isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)',
      ...this.props.titleStyle,
      ...titleStyle
    }

    const _bodyStyle = {
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
      ...this.props.bodyStyle,
      ...bodyStyle
    }

    const _tipStyle = {
      ...styles.tip,
      maxWidth: Dimensions.get('screen').width - RENDER_BOUNDARY * 2,
      ...tipStyle
    }

    const _prevNextButtonStyle = {
      ...styles.actionBtn,
      ...prevNextButtonStyle
    }

    const _prevNextTextStyle = {
      ...styles.actionBtnLabel,
      ...prevNextTextStyle
    }

    return (
      <Animated.View
        onLayout={this.onTipLayout}
        style={{
          ..._tipStyle,
          ...tipPosition,
          ...this.getTipAnimation()
        }}
      >
        {/* Tip leg border */}
        <View style={{
          ...styles.arrow,
          ...arrowPosition,
          top: arrowPosition?.top ? arrowPosition?.top - (tipStyle.borderWidth + 1 || 0) : undefined,
          bottom: arrowPosition?.bottom ? arrowPosition?.bottom - (tipStyle.borderWidth + 1 || 0) : undefined,
          borderBottomColor: tipStyle.borderColor,
          borderTopColor: tipStyle.borderColor,
        }} />

        {/* Tip leg */}
        <View style={{
          ...styles.arrow,
          ...arrowPosition,
          borderBottomColor: tipStyle.backgroundColor,
          borderTopColor: tipStyle.backgroundColor
        }} />

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!onTipPress}
          onPress={onTipPress}
        >
          {
            renderTip
              ? renderTip({
                titleStyle: _titleStyle,
                bodyStyle: _bodyStyle
              })
              : <>
                {title &&
                  <Text style={_titleStyle}>
                    {title}
                  </Text>
                }

                {body &&
                  <Text style={_bodyStyle}>
                    {body}
                  </Text>
                }
              </>
          }

          {tourProps &&
            <View style={styles.actions}>
              {
                !!tourProps.prevId &&
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() =>
                    TipManager.changeTipTour(tourProps, 'prev')
                  }
                  style={_prevNextButtonStyle}
                >
                  <Text style={_prevNextTextStyle}>
                    {prevButtonLabel}
                  </Text>
                </TouchableOpacity>
              }

              {
                !!tourProps.nextId &&
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() =>
                    TipManager.changeTipTour(tourProps, 'next')
                  }
                  style={_prevNextButtonStyle}
                >
                  <Text style={_prevNextTextStyle}>
                    {nextButtonLabel}
                  </Text>
                </TouchableOpacity>
              }

              {
                !!tourProps.prevId && !tourProps.nextId &&
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={this.closeTip}
                  style={_prevNextButtonStyle}
                >
                  <Text style={_prevNextTextStyle}>
                    {closeButtonLabel}
                  </Text>
                </TouchableOpacity>
              }
            </View>
          }
        </TouchableOpacity>
      </Animated.View>
    )
  }

  renderItem() {
    const {
      itemCoordinates,
      children,
      onPressItem,
      destroyItemImediatelly,
      layout,
      activeItemStyle,
      showItemPulseAnimation = this.props.showItemPulseAnimation,
    } = this.state

    if (destroyItemImediatelly) return null

    const item = React.cloneElement(children, {
      ...children.props,
      onPressOut: () => onPressItem && onPressItem(),
      style: clearItemStyles(children.props?.style),
    })

    const width = activeItemStyle?.width || layout.width
    const height = activeItemStyle?.height || layout.height

    const coordinates = {
      ...activeItemStyle,
      position: 'absolute',
      width,
      height,
      top: itemCoordinates.centerPoint.y,
      left: itemCoordinates.centerPoint.x,
      transform: [
        { translateX: -width / 2 },
        { translateY: -height / 2 }
      ],
    }

    return (
      <View style={coordinates}>
        {showItemPulseAnimation && this.renderItemPulseAnimation({
          width,
          height,
        })}

        <TouchableOpacity
          onPress={() => {
            if (onPressItem) onPressItem()
            else this.closeTip()
          }}
        >
          {item}
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    if (!this.state.itemCoordinates) return null

    return (
      <Modal
        visible
        onRequestClose={this.closeTip}
        transparent
        hardwareAccelerated
        presentationStyle='overFullScreen'
        statusBarTranslucent
      >
        {this.renderOverlay()}
        {this.renderTip()}
        {this.renderItem()}
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  tip: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    minHeight: 40,
    zIndex: 999,
    overflow: 'visible'
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_WIDTH / 2,
    borderRightWidth: ARROW_WIDTH / 2,
    borderBottomWidth: ARROW_HEIGHT,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    borderTopColor: 'white'
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end'
  },
  actionBtn: {
    padding: 10,
    marginBottom: -10
  },
  actionBtnLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  prev: {
    marginRight: 10
  }
})
