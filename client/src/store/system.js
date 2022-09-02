export default {
    namespaced: true,

    state: {
        navigationHeight: 0,
        statusHeight: 0,
        screenHeight: 0,
        availableHeight: 0,
        screenWidth: 0
    },

    mutations: {
        setNavigationHeight(state, height) {
            state.navigationHeight = height
        },
        setStatusHeight(state, height) {
            state.statusHeight = height
        },
        setScreenHeight(state, height) {
            state.screenHeight = height
        },
        setScreenWidth(state, width) {
            state.screenWidth = width
        },
        setAvailableHeight(state, height) {
            state.availableHeight = height
        }
    }
}