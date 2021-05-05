class TipManager {
    tipProvider = null;
    tips = [];
    steps = [];

    register(ref) {
        this.tipProvider = ref
    }

    unregister(ref) {
        this.tipProvider = null
    }

    getDefault() {
        return this.tipProvider
    }

    registerTip(tip) {
        if (tip) {
            this.tips = [...this.tips, tip]
        }
    }

    updateProps(tipId: string, props: any) {
        const index = this.tips.findIndex(i => i.id === tipId)
        const tips = this.tips
        tips[index] = { ...tips[index], ...props }
        this.tips = tips
    }

    showTip(tipId: string, delay: number = 0) {
        const showItem = () => {
            const tip = this.tips.find(i => i.id === tipId)
            tip.tourProps = null
            if (!tip) return setTimeout(showItem, 250)
            this.tipProvider.showTip(tip)
        }

        if (tipId && delay) {
            // Hides current tip but keeps overlay
            this.tipProvider.hideCurrentTip()
        }

        setTimeout(showItem, delay)
    }

    showTipTour(steps: []) {
        const currentStep = steps[0]
        this.steps = steps

        const showItem = () => {
            const tip = this.tips.find(i => i.id === currentStep.id)
            if (!tip) return setTimeout(showItem, 250)
            tip.tourProps = currentStep
            this.tipProvider.showTip(tip)
        }

        setTimeout(showItem, 0)
    }

    changeTipTour(stepTourProps = {}, direction: 'prev' | 'next') {
        let tries = 0
        this.tipProvider.hideCurrentTip()

        if (!stepTourProps) {
            this.closeTip()
            return alert('Next tip id not found! Verify if the item is registered by the time you are calling it.')
        }

        const showItem = () => {
            const id = direction === 'prev'
                ? stepTourProps.prevId
                : stepTourProps.nextId

            const tip = this.tips.find(i => i.id === id)

            if (!tip) {
                if (tries > 10) {
                    return alert('Timeout! Tip id not found after 10 tries (2500ms)! Verify if the item is registered by the time you are calling it.')
                }

                tries++
                return setTimeout(showItem, 250)
            }

            tip.tourProps = this.steps.find(i => i.id === id)

            if (direction === 'prev' && stepTourProps.prevAction) {
                stepTourProps.prevAction()
                setTimeout(() => this.tipProvider.showTip(tip), stepTourProps.delay || 10)
                return
            } else if (direction === 'next' && stepTourProps.nextAction) {
                stepTourProps.nextAction()
                setTimeout(() => this.tipProvider.showTip(tip), stepTourProps.delay || 10)
                return
            }

            this.tipProvider.showTip(tip)
        }

        setTimeout(showItem, 0)
    }

    closeTip() {
        this.tipProvider.closeTip()
    }
}

export default new TipManager()