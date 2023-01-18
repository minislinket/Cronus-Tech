<template>
    <div class="view-call-events-modal-wrap" v-if="active">

        <h3>Call Events</h3>


        <div class="call-events-grid headings">
            <h4>Event</h4>
            <h4>Operator</h4>
            <h4 @click="sortByDate()" class="heading-sort">Time <font-awesome-icon class="heading-sort-icon" :icon="['fa', 'sort']" size="lg" /></h4>
        </div>
        
        <div class="call-events-grid-scroll-section">
            <div class="call-events-grid data" v-for="event in callEvents" :key="event.id">
                <p>{{ event.description }}</p>
                <p>{{ getOperator(event.employeeCode) }} <span class="tiny-text">({{ event.employeeCode }})</span></p>
                <p>{{ event.time }}</p>
            </div>
        </div>

        <button class="close-info-modal-btn fixed" @click="$store.dispatch('AllocateTech/viewCallEventsModal', false)">Close</button>
    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            employees: JSON.parse(localStorage.getItem('employees')),
            sortByDate: 'up'
        }
    },


    computed: {
        ...mapGetters({
            active: ['AllocateTech/viewCallEventsModal'],
            callEvents: ['AllocateTech/callEvents']
        })
    },




    watch: {

    },




    methods: {
        getOperator: function(empCode) {
            return this.employees.filter(emp => emp.employeeCode == empCode)[0].displayName;
        },




        sortByDate: function() {
            this.callEvents.reverse();
        }
    }

}
</script>



<style>

.view-call-events-modal-wrap {
    position: fixed;
    height: 75vh;
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
    background: var(--DarkGrey);
    z-index: 500;
    
}


.view-call-events-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
    display: flex;
    flex-direction: column;
}




.call-events-grid-scroll-section {
    height: 55vh;
    overflow-y: scroll;
    box-shadow: inset 0 -6px 20px 0 rgb(0 0 0 / 40%);
    margin: 0 -10px;
    padding: 0 10px;
    background: var(--GunMetal);
}


.call-events-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 0.7fr;
    align-items: center;
    column-gap: 8px;
    text-align: left;
    font-size: 12px;
}


.call-events-grid.headings {
    font-size: 14px;
    margin: 0 -10px;
    padding: 0 10px;
    border-bottom: 1px solid var(--OffWhite);
}

.call-events-grid.data {
    border-bottom: 1px dashed rgba(255,255,255,0.2);
    padding: 2px 0;
}

.call-events-grid.data:last-child {
    border-bottom: none;
}




.view-call-events-modal-wrap .close-info-modal-btn.fixed {
    position: absolute;
    bottom: 20px;
}

</style>