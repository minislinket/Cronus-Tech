<template>
    <div class="add-call-details-modal-wrap" v-if="active">

        <h3>Add Call Details</h3>

        <textarea v-model="additionalCallDetails" maxlength="500"></textarea>

        <div class="add-call-details-btns-wrap">
            <button class="submit-add-call-details-btn" @click="submitCallDetails()">Submit</button>
            <button class="close-btn" @click="$store.dispatch('AllocateTech/addCallDetailsModalActive', false)">Close</button>
        </div>

    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            additionalCallDetails: ''
        }
    },


    computed: {
        ...mapGetters({
            active: ['AllocateTech/addCallDetailsModalActive']
        })
    },




    watch: {

    },




    methods: {


        canSubmitCallDetails: function() {

            var flag = true;

            if(!this.additionalCallDetails)
            {
                flag = false;
                var toast = {
                    shown: false,
                    type: "error",
                    heading: "Details Empty",
                    body: '',
                    time: 2000,
                    icon: "" // leave blank for default type icon
                };
                this.$store.dispatch("Toast/toast", toast);
            }
            
            return flag;
        },  


        submitCallDetails: function() {
            if(!this.canSubmitCallDetails()) { return }
            this.$store.dispatch('AllocateTech/AddCallDetails', this.additionalCallDetails);
        }
    }

}
</script>



<style>

.add-call-details-modal-wrap {
    position: fixed;
    max-height: 42vh;
    width: 95vw;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    border: 2px solid var(--BlockBorder);
    border-radius: 3px;

    padding: 10px;
    padding-bottom: 55px;
    background: var(--GunMetal);
    overflow-y: hidden;
    z-index: 500;
}


.add-call-details-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
    display: flex;
    flex-direction: column;
}





.add-call-details-modal-wrap textarea {
    width: 100%;
    height: 150px;
    margin-bottom: 20px;
    padding-top: 3px;
    padding-left: 3px;
}





.add-call-details-btns-wrap {
    display: flex;
    justify-content: center;
}


.add-call-details-btns-wrap button {
    margin: 0 5px;
}

</style>