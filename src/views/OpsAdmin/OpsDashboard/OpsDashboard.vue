<template>
    <div class="dashboard-wrap">

    <br>

    <h2>Ops Admin Dashboard</h2>


    <div class="data-selector-wrap">
        <h4>Data Heading</h4>
        <input type="text" placeholder="Search text...">
        <p>dropdown finder 1</p>
        <p>dropdown finder 2</p>
        <p>dropdown finder 3</p>
    </div>



    <!-- <div class="job-dashboard-wrap">

        <div class="job-type pending">
            
            <div class="job-type-wrap">
                <span class="material-symbols-outlined dash-job-icon pending material" >pending_actions</span>
                Pending
            </div>

            <div class="job-amount-circle">
                <span class="job-amount">{{ incomingCalls.length }}</span>
            </div>

        </div>



        <div class="job-type on-hold">

            <div class="job-type-wrap">
                <font-awesome-icon class="dash-job-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                On Hold
            </div>

            <div class="job-amount-circle">
                <span class="job-amount">{{ onHoldCalls.length }}</span>
            </div>

        </div>



        <div class="job-type active">

            <div class="job-type-wrap">
                <font-awesome-icon class="dash-job-icon active-calls" :icon="['fa', 'clipboard-check']" size="lg" />
                Active
            </div>

            <div class="job-amount-circle">
                <span class="job-amount">{{ busyActiveCalls.length }}</span>
            </div>

        </div>
    </div> -->


    </div>
</template>




<script>

export default {

    data() {
        return {

        }
    },




    computed: {

    },




    mounted() {
        this.$store.dispatch('Menu/setTitle', { title: 'Home', icon: ['fa', 'home'] });
    }

}

</script>




<style>

</style>