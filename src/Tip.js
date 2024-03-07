import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { v4 as uuidv4 } from 'uuid';
import TipManager from './TipManager'

const Tip = (props) => {
    const {
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
    } = props

    const tipId = React.useRef('')

    React.useEffect(() => {
        return () => TipManager.unregisterTip(tipId.current)
    }, [])

    function showTip(target) {
        TipManager.showTip(tipId.current)
    }

    function getDimensions(evt) {
        const layout = evt.nativeEvent.layout

        const _id = id || uuidv4()
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
