<template>

    <div class="app-blocking-lightbox" :class="{ active : modal.active }">

        <div class="modal-wrap" :class="modal.type, { active : modal.active }" >


            <div class="modal-inner-wrap">

                <div class="icon-wrap">
                    <font-awesome-icon v-if="modal.icon && modal.type" class="modal-icon" :icon="modal.icon" size="lg" />
                    <font-awesome-icon v-else-if="!modal.icon && modal.type === 'info'" class="modal-icon" :icon="['fa', 'info-circle']" size="lg" />
                    <font-awesome-icon v-else-if="!modal.icon && modal.type === 'okay'" class="modal-icon" :icon="['far', 'check-circle']" size="lg" />
                    <font-awesome-icon v-else-if="!modal.icon && modal.type === 'warning'" class="modal-icon" :icon="['fa', 'exclamation-triangle']" size="lg" />
                    <font-awesome-icon v-else-if="!modal.icon && modal.type === 'error'" class="modal-icon" :icon="['fa', 'exclamation-circle']" size="lg" />
                    <h3 v-html="modal.heading"></h3>
                </div>

                


                <div class="modal-body-scroll-section" :class="{ 'custom-scroller' : this.scrollHeight >= 395 }">
                    <p id="ModalBody" v-html="modal.body"></p>
                </div>

            </div>

            <div class="modal-button-wrap">
                <button v-if="modal.confirmAction === undefined" class="modal-okay-btn" @click="closeModal()">Okay</button>
                <button style="margin: 0 12px;" v-if="modal.confirmAction" class="modal-yes-btn" @click="modalResolve()">{{ modal.resolveText }}</button>
                <button style="margin: 0 12px;" v-if="modal.confirmAction" class="modal-no-btn" @click="modalReject()">{{ modal.rejectText }}</button>
            </div>

        </div>

    </div>

</template>




<script>
import { mapGetters } from 'vuex'

export default {

    data() {
        return {
            scrollHeight: 0
        }
    },




    computed: {
        ...mapGetters({
            modal: ['Modal/modal']
        })
    },



    watch: {

        modal: {
            handler: function() {
                setTimeout(() => {
                    var modalBody = document.getElementById('ModalBody');
                    if(modalBody)
                        this.scrollHeight = modalBody.offsetHeight;
                }, 120);
                
                
            },
            deep: true,
            // immediate: true
        }

    },



    methods: {

        closeModal: function() {
            this.$store.dispatch('Modal/closeModal');
        },


        modalResolve: function() {
            this.$store.dispatch('Modal/modalResolve');
        },

        modalReject: function() {
            this.$store.dispatch('Modal/modalReject');
        }

    }

    

}
</script>




<style>


@keyframes modal-entry {
    0% {
        opacity: 0;
        top: -120vh;
    }
    100%{
        opacity: 1;
        top: 40px;
    }
}


@keyframes modal-exit {
    0% {
        opacity: 1;
        top: 40px;
    }
    25%{
        top: 40px;
    }
    60% {
        opacity: 0.1;
    }
    100%{
        opacity: 0;
        top: -120vh;
    }
}





.modal-wrap {
    position: fixed;
    top: -120vh;
    left: 0;
    right: 0;
    margin: 0 auto;

    height: 50vh;
    width: 75vw;

    color: white;
    z-index: 1500;

    border-radius: 3px;

    animation: modal-exit 600ms ease;
}



.modal-wrap.active {
    top: 120px;
    transition: top 350ms ease;
    animation: modal-entry 350ms ease;
}






.modal-inner-wrap {
    height: 88%;
    position: relative;
}









.modal-inner-wrap .icon-wrap {
    
    position: absolute;
    top: 0;
    left: 0;

    height: 45px;
    
    width: 100%;
    border-radius: 3px;
    /* border-top-right-radius: 0; */
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 22px;
    z-index: 81;
    /* box-shadow: 4px 0px 4px 0 rgba(0,0,0,0.25); */
}



.modal-inner-wrap .icon-wrap h3 {
    font-size: 20px;
}




.modal-wrap .icon-wrap .modal-icon {
    margin-right: 8px;
}




/* Info Modal */

/* Set Modal text and background color */
.modal-wrap.info {
    background: rgba(240,240,240,1);
    color: rgb(20,20,20);   
}

/* Set icon and icon background colors */
.modal-wrap.info .icon-wrap {
    background: rgba(45,45,45,1);
    color: rgba(132, 196, 255, 1);
    /* box-shadow: 3px 0px 6px 0 rgba(0,0,0,0.1); */
}






/* Warning Modal */

/* Set Modal text and background color */
.modal-wrap.warning {
    background: rgba(220,161,0,1);
    color: rgb(20,20,20);      
}

/* Set icon and icon background colors */
.modal-wrap.warning .icon-wrap {
    background: rgba(45,45,45,1);
    color: rgba(255, 180, 19, 1);
}





/* Error Modal */

/* Set Modal text and background color */
.modal-wrap.error {
    background: rgba(120,0,0,1);
    color: rgb(240,240,240);   
}

/* Set icon and icon background colors */
.modal-wrap.error .icon-wrap {
    background: rgba(45,45,45,1);
    color: rgba(180,0,0,1);
}





/* Okay Modal */

/* Set Modal text and background color */
.modal-wrap.okay {
    background: rgba(138, 247, 152, 1);
    color: rgb(20,20,20);   
}

/* Set icon and icon background colors */
.modal-wrap.okay .icon-wrap {
    background: rgba(45,45,45,1);
    color: rgba(32, 209, 56, 1);
}








/* Modal Content Styling */

.modal-body-scroll-section {
    font-size: 14px;
    overflow-y: scroll;
    height: 100%;
    padding: 0 15px;
    padding-top: 50px;
    padding-bottom: 55px;
    box-shadow: inset 0 -4px 6px 0 rgba(0,0,0,0.12);
    z-index: 80;
}





.modal-button-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 12%;
    background: rgba(45,45,45,1);
    padding: 25px 0;
}

.modal-okay-btn {
    margin-bottom: 1px;
    /* color: white;
    background: var(--BlueDark); */
}




.modal-yes-btn {
    color: var(--OkayGreen);
}


.modal-no-btn {
    color: var(--WarningRed);
}


</style>