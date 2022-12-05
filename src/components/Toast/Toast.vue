<template>

    <div class="toast-wrap" :class="currentToast.type, { active : showingToast }">

        <div class="icon-wrap">
            <font-awesome-icon v-if="currentToast.icon && currentToast.type" class="toast-icon" :icon="currentToast.icon" size="lg" />
            <font-awesome-icon v-else-if="!currentToast.icon && currentToast.type === 'info'" class="toast-icon" :icon="['fa', 'info-circle']" size="lg" />
            <font-awesome-icon v-else-if="!currentToast.icon && currentToast.type === 'okay'" class="toast-icon" :icon="['far', 'check-circle']" size="lg" />
            <font-awesome-icon v-else-if="!currentToast.icon && currentToast.type === 'warning'" class="toast-icon" :icon="['fa', 'exclamation-triangle']" size="lg" />
            <font-awesome-icon v-else-if="!currentToast.icon && currentToast.type === 'error'" class="toast-icon" :icon="['fa', 'exclamation-circle']" size="lg" />
        </div>

        <div class="toast-content-wrap">
            <h4 v-if="currentToast.heading">{{ currentToast.heading }}</h4>
            <p v-html="currentToast.body"></p>
        </div>
        
    </div>

</template>




<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            showingToast: false,

            currentToast: {
                id: undefined,
                type: '', // ['info', 'warning', 'error', 'okay']
                heading: '',
                body: '',
                time: 0,
                icon: [],
                shown: false
            },

            // Copy object used for re-initialization of original "currentToast" above
            initCurrentToast: {
                id: undefined,
                type: '', // ['info', 'warning', 'error', 'okay']
                heading: '',
                body: '',
                time: 0,
                icon: [],
                shown: false
            },

            animationTimeOut: '',
            toastTimeOut: '',
            count: 0,
            toastQueueRunning: false
        }
    },



    computed: {
        ...mapGetters({
            toasts: ['Toast/toastQueue'],
        })
    },





    watch: {

        toasts: {
            handler: function() {
                
                if(this.toasts.length >= 1 && this.toastQueueRunning === false)
                    this.showToasts();
            },
            deep: true,
            // immediate: true
        },



        toastQueueRunning: {
            handler: function() {
                // console.log('Toast queue is running: ', this.toastQueueRunning);
                if(this.toastQueueRunning === false && this.toasts.length >= 1)
                    this.showToasts()
            },
            deep: true,
            immediate: true
        }

    },





    methods: {

        showToasts: async function() {
            this.toastQueueRunning = true;
            this.count = 0;
            this.looper();       
        },





        looper: function() {


            // console.log('Executing looper, round: ', this.count + 1);
            var toast = this.toasts[this.count];


            // Give the animation (slide up and down of toast) time to complete 
            this.animationTimeOut = setTimeout(() => {

                // Change the Toast
                // console.log('Changing Toast to: ', toast);
                this.currentToast = toast;

                // Show the toast
                this.showingToast = true;

                // Toast timeout 
                this.toastTimeOut = setTimeout(() => {

                    toast.shown = true;

                    // Iterate
                    this.count++;

                    // Stop showing Toast
                    this.showingToast = false;

                    // If the count is smaller than the amount of Toasts to show, keep looping
                    if(this.count < this.toasts.length)
                    {
                        this.toastQueueRunning = false;
                    }
                    // If we are at the last toast, reset this.currentToast
                    if(this.count === this.toasts.length)
                    {
                        setTimeout(() => {
                            // console.log('💣💣 - Last toast reached... ending looper');
                            this.currentToast = this.initCurrentToast;
                            this.toastQueueRunning = false;
                        }, 150);
                    }

                    this.removeUsedToasts();

                }, toast.time); // <- How long should the Toast show for?

            }, this.count === 0 ? 150 : 1200); // <- How long does the animation need to complete (Give it an extra 100 - 200ms, otherwise animation errors could occur)
        },



        removeUsedToasts: function() {

            var toastsToRemove = [];
            this.toasts.map(toast => toast.shown === true ? toastsToRemove.push(toast.id) : null );
            (toastsToRemove.length >= 1)
            {
                toastsToRemove.map(id => {
                    var toastIndex = this.toasts.findIndex(tst => tst.id === id);
                    this.toasts.splice(toastIndex, 1);
                })
            }


            if(this.toasts.length <= 0)
            {
                this.count = 0;
            }

            // console.log('Executed removeUsedToasts: ', JSON.parse(JSON.stringify(this.toasts)));

        }

    }

}
</script>




<style>


@keyframes toast-entry {
    0% {
        opacity: 0;
        top: -120px;
    }
    100%{
        opacity: 1;
        top: 35px;
    }
}


@keyframes toast-exit {
    0% {
        opacity: 1;
        top: 35px;
    }
    25%{
        top: 35px;
    }
    60% {
        opacity: 0.1;
    }
    100%{
        opacity: 0;
        top: -120px;
    }
}





.toast-wrap {
    position: fixed;
    top: -120px;
    left: 0;
    right: 0;
    margin: 0 auto;

    width: 85vw;
    padding: 5px 0;
    z-index: 1500;

    border-radius: 3px;

    animation: toast-exit 600ms ease;
}




.toast-wrap.active {
    top: 35px;
    transition: top 350ms ease;
    animation: toast-entry 350ms ease;
}











.toast-wrap .icon-wrap {
    
    position: absolute;
    top: 0;
    left: 0;

    height: 100%;
    
    width: 50px;
    border-radius: 3px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 24px;
    box-shadow: 4px 0px 4px 0 rgba(0,0,0,0.25);
}







/* Info Toast */

/* Set toast text and background color */
.toast-wrap.info {
    background: rgba(240,240,240,0.98);
    color: rgb(20,20,20);   
}

/* Set icon and icon background colors */
.toast-wrap.info .icon-wrap {
    background: rgba(60, 60, 60, 0.95);
    color: rgba(132, 196, 255, 0.98);
    /* box-shadow: 3px 0px 6px 0 rgba(0,0,0,0.1); */
}






/* Warning Toast */

/* Set toast text and background color */
.toast-wrap.warning {
    background: rgba(220,161,0,0.98);
    color: rgb(20,20,20);      
}

/* Set icon and icon background colors */
.toast-wrap.warning .icon-wrap {
    background: rgba(60, 60, 60, 0.95);
    color: rgba(255, 180, 19, 0.98);
}





/* Error Toast */

/* Set toast text and background color */
.toast-wrap.error {
    background: rgba(120,0,0,0.98);
    color: rgb(240,240,240);   
}

/* Set icon and icon background colors */
.toast-wrap.error .icon-wrap {
    background: rgba(60, 60, 60, 0.95);
    color: rgba(180,0,0,1);
}





/* Okay Toast */

/* Set toast text and background color */
.toast-wrap.okay {
    background: rgba(138, 247, 152, 0.98);
    color: rgb(20,20,20);   
}

/* Set icon and icon background colors */
.toast-wrap.okay .icon-wrap {
    background: rgba(60, 60, 60, 0.95);
    color: rgba(32, 209, 56, 0.98);
}












/* Toast Content Styling */
.toast-content-wrap {
    height: 100%;
    min-height: 40px;
    width: 83%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left: 55px;
    font-size: 14px;
    padding: 3px 5px;
    padding-right: 7px;
}


.toast-content-wrap h4 {
    margin-bottom: 3px;
}


.toast-content-wrap p {
    text-align: left;
}

</style>