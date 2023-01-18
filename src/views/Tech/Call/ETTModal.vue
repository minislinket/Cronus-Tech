<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="call-eta-modal app-modal-content">

            <h4>Estimated Travel Time</h4>

            <div class="ett-time-input-wrap">
                <input type="tel" placeholder="hh" maxlength="2" v-model="hour">
                <span> : </span>
                <input type="tel" placeholder="mm" maxlength="2" v-model="minute">
            </div>
            
            <div class="ett-btn-wrap">
                <button :disabled="!hour && !minute" @click="submitETT()">Submit</button>
                <button class="warning" @click="closeETTModal()">Cancel</button>
            </div>

        </div>

    </div>
</template>


<script>
export default {

    props: ['active'],

    data() {
        return {
            hour: '',
            minute: '',
        }
    },




    watch: {
        
    },




    mounted() {
        this.ETT = '';
    },




    methods: {



        closeETTModal: function() {
            this.$emit('closeETT');
            this.hour = '';
            this.minute = '';
        },



        submitETT: function() {
            this.$emit('submitETT', {hour: this.hour, minute: this.minute});
            setTimeout(() => {
                this.hour = '';
                this.minute = '';
            }, 1000);
        }

    }

}
</script>


<style>


.call-eta-modal {

}


.call-eta-modal h4 {
    margin-bottom: 10px;
}


.call-eta-modal input {
    width: 80px;
    text-align: center;
    padding: 0;
}

.call-eta-modal button {
    margin-bottom: 10px;
}




.ett-time-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}




.ett-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5px;
}

</style>