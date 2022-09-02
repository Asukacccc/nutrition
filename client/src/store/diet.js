export default {
    namespaced: true,
    
    state: {
        todayRecordList: [],
        start: 0,
        todayTime: 0,
        journalStatus: 0,
        journalContent: {},
        foodInfo: {}
    },

    mutations: {
        setTodayRecordList(state, array) {
            state.todayRecordList = array
        },
        setStart(state, position) {
            state.start = position
        },
        setTodayTime(state, time) {
            state.todayTime = time
        },
        setJournalStatus(state, flag) {
            state.journalStatus = flag
        },
        setJournalContent(state, object) {
            state.journalContent = object
        },
        setFoodInfo(state, object) {
            state.foodInfo = object
        }
    }
}