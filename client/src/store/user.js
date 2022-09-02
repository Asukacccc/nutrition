export default {
    namespaced: true,

    state: {
        avatar: '',
        nickname: '',
        signature: ''
    },
    
    mutations: {
        setAvatar(state, url) {
            state.avatar = url
        },
        setNickname(state, name) {
            state.nickname = name
        },
        setSignature(state, signature) {
            state.signature = signature
        }
    }
}