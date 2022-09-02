import { createStore } from "vuex"
import systemModule from './system.js'
import userModule from './user.js'
import progressModule from './progress'
import dietModule from './diet'
import sleepModule from './sleep'

export default createStore({
    modules: {
        'system': systemModule,
        'user': userModule,
        "progress": progressModule,
        "diet": dietModule,
        "sleep": sleepModule
    }
})