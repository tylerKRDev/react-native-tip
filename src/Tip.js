import React, { useEffect, useRef } from "react"
import { TouchableWithoutFeedback } from "react-native"
import TipManager from "./TipManager"

export default Tip = (props) => {
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
		active = true,
		activeItemStyle,
		pulseStyle,
		pulseIntensity,
	} = props

	const tipId = useRef("")

	useEffect(() => {
		return () => TipManager.unregisterTip(tipId.current)
	}, [])

	function uuidv4() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = (Math.random() * 16) | 0,
				v = c == "x" ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
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
			pulseIntensity,
		})
	}

	if (tipId.current) TipManager.updateProps(tipId.current, props)

	return (
		<TouchableWithoutFeedback
			onLayout={getDimensions}
			disabled={!active}
			onPress={() => TipManager.showTip(tipId.current)}
			children={children}
		/>
	)
}
