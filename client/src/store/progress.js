export default {
    namespaced: true,

    state: {
        totalBytesSent: 0
    },

    mutations: {
        setTotalBytesSent(state, number) {
            state.totalBytesSent = number
        }
    }
}