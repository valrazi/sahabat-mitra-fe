export const useUiStore = defineStore('uiStore', {
    state: () => ({
      loginModal:false,
      loading: 0
    }),
    actions: {
      toggleLogin() {
        this.loginModal = !this.loginModal
      },
      setLoading() {
        this.loading += 1
      },
      removeLoading() {
        if(this.loading > 0) {
          this.loading -= 1
        }
      }
    }
  })