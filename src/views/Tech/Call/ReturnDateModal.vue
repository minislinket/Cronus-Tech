<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="return-date-modal app-modal-content">

            <h4>When are you returning to this Job?</h4>

            <div class="return-date-modal-input-wrap">
                <input type="date" v-model="returnDate" :min="today" @change="showDate()">
                
            </div>
            
            <div class="return-date-modal-btn-wrap">
                <button :disabled="!this.returnDate" @click="recordReturnDate()">Submit</button>
                <button class="warning" @click="closeReturnDateModal()">Cancel</button>
            </div>

        </div>

    </div>
</template>


<script>
import { mapGetters } from 'vuex';

export default {

    data() {
        return {
            returnDate: '',
            today: new Date().toISOString().split('T')[0]
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/returnDateModal'],
            call: ['Call/call']
        })
    },






    mounted() {
        this.returnDate = '';
        console.log(this.today);
    },




    methods: {

        showDate: function() {
            console.log(this.returnDate);
            console.log(this.today);
        },
 
        closeReturnDateModal: function() {
            this.$store.dispatch('Call/returnDateModal', false);
            this.returnDate = '';
        },



        recordReturnDate: function() {
            this.$emit('recordReturnDate', this.returnDate);
            this.closeReturnDateModal();
        }

    }

}
</script>


<style>

.return-date-modal {
    height: 25vh;
    width: 85vw;
}


.return-date-modal.active {
    top: 120px;
}


.return-date-modal h4 {
    margin-bottom: 10px;
}


.return-date-modal input {
    
}

.return-date-modal button {
    margin-bottom: 10px;
}




.return-date-modal-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}

.return-date-modal-input-wrap input {
    width: 120px;
    text-align: center;
    padding: 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--OffWhite);
    margin-right: 20px;
    color: white;
    border-radius: 0;
}

.return-date-modal-input-wrap input::placeholder {
    font-size: 12px;
}


.return-date-modal-input-wrap button {
    display: flex;
    align-items: center;
    margin-bottom: 0;
}




.return-date-modal-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5px;
}





.return-date-add-jc-id-icon {
    color: var(--OkayGreen);
    font-size: 24px;
}

.return-date-add-jc-id-icon.disabled {
    color: var(--MidGrey);
}



.verifying-order-number-id-loading-icon {
    margin-right: 20px;
    animation: color-change 8000ms ease alternate-reverse infinite, rotate 2s linear infinite;
}




.return-date-icon {
    margin-right: 20px;
}


.return-date-icon.okay {
    color: var(--OkayGreen);
}


.return-date-icon.verifying {
    animation: color-change 8000ms ease alternate-reverse infinite;
}






.job-card-id-grid-scroll-section {
    height: 60%;
    text-align: left;
}


.job-card-id-grid {
    display: grid;
    grid-template-columns: 2fr 0.5fr;
    padding: 5px 0;
    padding-left: 10px;
    border-bottom: 1px dashed rgba(255,255,255,0.2);
}

.job-card-id-grid:last-child {
    border-bottom: none;
}


</style>