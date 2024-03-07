import React, { useEffect, useRef } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import 'react-native-get-random-values'
import uuid from 'react-native-uuid';
import TipManager from './TipManager'

const Tip = ({
    id,
    children,
    title,
    body,
    titleStyle,
    bodyStyle,
    tipContainerStyle,
    dismissable,
    renderTip,
    overlayComponent,
    overlayOpacity,
    showItemPulseAnimation,
    pulseColor,
    onPressItem,
    onDismiss,
    onTipPress,
    style,
    active = true,
    activeItemStyle,
    pulseStyle,
    pulseIntensity
}) => {

    const tipId = useRef('')

    useEffect(() => {
        return () => TipManager.unregisterTip(tipId.current)
    }, [])

    function showTip(target) {
        TipManager.showTip(tipId.current)
    }

    function getDimensions(evt) {
        const layout = evt.nativeEvent.layout

        const _id = id || uuid.v4()
        tipId.current = _id

        TipManager.registerTip({
            id: _id,
            target: evt.nativeEvent.target,
            layout,
            title,
            body,
            titleStyle,
            bodyStyle,
            tipContainerStyle,
            dismissable,
            children,
            renderTip,
            overlayComponent,
            overlayOpacity,
            showItemPulseAnimation,
            pulseColor,
            onPressItem,
            onDismiss,
            onTipPress,
            activeItemStyle,
            pulseStyle,
            pulseIntensity
        })
    }

    if (tipId.current) TipManager.updateProps(tipId.current, props)

    return (
        <TouchableWithoutFeedback
            onLayout={getDimensions}
            disabled={!active}
            onPress={showTip}
            children={children}
        />
    )
}

export default Tip
