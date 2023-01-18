<template>
    <div class="app-modal-lightbox" v-if="active">
        
        <div class="on-hold-reason-modal app-modal-content">

            <h4>On Hold - Reason</h4>

            <div class="on-hold-reason-input-wrap">
                <textarea type="text" placeholder="Reason for placing this job on hold" v-model="reason"></textarea>
            </div>
            
            <div class="on-hold-reason-btn-wrap">
                <button :disabled="!hour && !minute" @click="submitReason()">Submit</button>
                <button class="warning" @click="closeOnHoldReasonModal()">Cancel</button>
            </div>

        </div>

    </div>
</template>


<script>
import { mapGetters } from 'vuex';
export default {

    data() {
        return {
            reason: ''
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/onHoldReasonModal']
        })
    },




    watch: {
        
    },




    mounted() {
        this.reason = '';
    },




    methods: {



        closeOnHoldReasonModal: function() {
            this.$store.dispatch('Call/onHoldReasonModal', false);
            this.reason = '';
        },



        submitReason: function() {
            this.$emit('submitReason', {reason: this.reason});
            setTimeout(() => {
                this.reason = '';
            }, 1000);
        }

    }

}
</script>


<style>


.on-hold-reason-modal {

}


.on-hold-reason-modal h4 {
    margin-bottom: 10px;
}


.on-hold-reason-modal input {
    width: 80px;
    text-align: center;
    padding: 0;
}

.on-hold-reason-modal button {
    margin-bottom: 10px;
}




.on-hold-reason-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}




.on-hold-reason-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5px;
}

</style>