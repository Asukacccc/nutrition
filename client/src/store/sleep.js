export default {
    namespaced: true,

    state: {
        start: 0,
        length: 0,
        alertClockTime: [],
        alertClockAudio: {},
        hasSetAlertClock: false,
        respiteCloseTime: 0,
        respiteStartTime: 0,
        recordList: [],
    },

    mutations: {
        setStart(state, start) {
            state.start = start
        },

        setLength(state, length) {
            state.length = length
        },
        setAlertClockTime(state, time) {
            state.alertClockTime = time
        },
        setAlertClockAudio(state, obj) {
            state.alertClockAudio = obj
        },
        setHasAlertClock(state, flag) {
            state.hasSetAlertClock = flag
        },
        setRespiteCloseTime(state, time) {
            state.respiteCloseTime = time
        },
        setRespiteStartTime(state, time) {
            state.respiteStartTime = time
        },
        clearRespiteInfo(state) {
            state.alertClockTime = []
            state.alertClockAudio = {}
            state.hasSetAlertClock = false
            state.respiteCloseTime = 0,
            state.respiteStartTime = 0
        },
        setRecordList(state, array) {
            state.recordList = array
        }
    }
}